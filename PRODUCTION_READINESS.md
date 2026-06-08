# WorkspaceShare — Production Readiness Plan

> Status: **Pre-production.** The frontend and component library are well developed, but the
> core backend (authentication, authorization, the booking↔payment link, email) is mocked or
> half-wired. This document is the ticket-by-ticket plan to close that gap.
>
> Last updated: 2026-06-08 · Email provider decision: **Resend**

---

## How to read this

Tickets are grouped into phases and ordered by priority. Each ticket has:

- **ID** — stable reference (e.g. `AUTH-1`)
- **Priority** — P0 (blocker), P1 (core feature gap), P2 (hardening/quality)
- **Files** — primary files to touch
- **Acceptance** — how we know it's done

Do the phases roughly in order. Phase 1 must land before the app is safe for any real user,
because the broken auth silently breaks ownership everywhere downstream.

---

## Phase 1 — Fix the foundation (P0 blockers)

The app currently has **two conflicting NextAuth configs**, and the `auth()` helper that every
API route depends on is a hardcoded mock returning user `"1"`. As a result, every booking,
payment, and listing is attributed to a single fake user. Nothing about ownership works until
this is fixed.

### AUTH-1 — Unify into one real NextAuth v5 config  · P0
- **Problem:** `src/lib/auth.ts:73-77` exports a mock `auth()` that always returns
  `{ id: "1", name: "Test User" }`. `src/app/api/auth/[...nextauth]/route.ts:34-49` is a second
  config whose credentials provider accepts any email + any password ≥6 chars.
- **Do:**
  - Create a single source of truth (e.g. `src/auth.ts`) exporting `{ handlers, auth, signIn, signOut }` from `NextAuth(authConfig)`.
  - Delete the mock `auth()` and the duplicate config. Point the route handler and all imports at the unified module.
  - Session strategy: **JWT** (already chosen) — add a `jwt` callback that puts the real user id on the token, and a `session` callback that copies `token.sub` → `session.user.id`.
  - Remove the `NEXTAUTH_URL` "markdown sanitization" hacks (`lib/auth.ts:14-36`, route handler `:9-20`). Fix the env var at the deploy config instead (see INFRA-1).
- **Files:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, every route importing `auth`.
- **Acceptance:** `auth()` returns the actually-logged-in user; logging out and in as different users changes `session.user.id`.

### AUTH-2 — Real credentials login against the database  · P0
- **Problem:** Signup (`api/auth/signup/route.ts`) correctly creates users with bcrypt, but no provider ever verifies against them.
- **Do:** In the credentials provider `authorize()`, look up the user by email, `bcrypt.compare` the password against `hashedPassword`, return the user or `null`. Never return a user without a password match.
- **Files:** unified auth config.
- **Acceptance:** A user created via signup can log in; wrong password fails; unknown email fails.

### AUTH-3 — Wire Google OAuth for real  · P0
- **Do:** Configure the Google provider with real `GOOGLE_CLIENT_ID`/`SECRET`, ensure the PrismaAdapter links Google accounts to users, set authorized redirect URIs for prod + local.
- **Acceptance:** "Sign in with Google" creates/links a real `User` + `Account` row and a working session.

### AUTHZ-1 — Ownership checks on listing mutations  · P0
- **Problem:** `src/app/api/spaces/[id]/route.ts` `PATCH` and `DELETE` have **no auth at all** — anyone can edit/delete any listing by ID. `POST` in `api/spaces/route.ts:76-91` assigns ownership to a hardcoded `mockUserId`/`admin@example.com`.
- **Do:**
  - `POST /api/spaces`: require a session, set `ownerId = session.user.id`.
  - `PATCH`/`DELETE /api/spaces/[id]`: require a session AND verify `space.ownerId === session.user.id` (403 otherwise).
- **Files:** `src/app/api/spaces/route.ts`, `src/app/api/spaces/[id]/route.ts`.
- **Acceptance:** A user can only edit/delete their own spaces; new listings are owned by their creator.

### BOOK-1 — Single, idempotent booking↔payment flow  · P0
- **Problem:** Two disconnected paths create bookings: `api/bookings/route.ts` creates a `PENDING` row, and `api/payments/webhook/route.ts:34` creates a separate `CONFIRMED` row on `payment_intent.succeeded`. No idempotency, no link between PaymentIntent and Booking → duplicate and double bookings.
- **Do:**
  - Add `stripePaymentIntentId String? @unique` (and optionally `paymentStatus`) to the `Booking` model; migrate.
  - Flow: create a `PENDING` booking **first**, create the PaymentIntent with `metadata.bookingId`, return its `client_secret`. On `payment_intent.succeeded`, **update** that booking to `CONFIRMED` (look it up by `stripePaymentIntentId` / `bookingId`) rather than creating a new one.
  - Make the webhook idempotent: if the booking is already `CONFIRMED`, no-op (Stripe retries).
- **Files:** `prisma/schema.prisma`, `api/bookings/route.ts`, `api/payments/create-intent/route.ts`, `api/payments/webhook/route.ts`.
- **Acceptance:** One paid booking = exactly one `CONFIRMED` row; replaying the webhook does not duplicate.

### BOOK-2 — Server-side price calculation & availability re-check  · P0
- **Problem:** The server trusts client-supplied `totalPrice` / `totalAmount` (`api/bookings/route.ts:13`, `create-intent/route.ts:17`). A user can pay any amount. Availability is checked at booking creation but **not** at payment time (race between two payers).
- **Do:**
  - Compute price server-side from the space's pricing tiers + the requested date range. Reject if the client value disagrees.
  - Re-run the overlap check inside the same transaction that confirms the booking (the existing overlap query at `api/bookings/route.ts:29-44` is a good base — reuse it).
- **Acceptance:** Tampered prices are rejected; two users cannot both confirm overlapping dates.

---

## Phase 2 — Booking lifecycle & host tooling (P1)

### BOOK-3 — Booking status transitions  · P1
- **Problem:** Only creation exists. No cancel, no host confirm/reject, no `COMPLETED`.
- **Do:** Add endpoints/actions for: guest cancel (with policy), host confirm/reject of `PENDING`, and a job or on-read transition to `COMPLETED` after `endDate`. Enforce who may do what (guest vs host vs neither).
- **Files:** new `api/bookings/[id]/route.ts` (or actions), dashboard UI.
- **Acceptance:** Each role can perform only its allowed transitions; illegal transitions are rejected.

### BOOK-4 — Host-facing bookings view  · P1
- **Problem:** `dashboard/bookings` shows bookings the user *made*; hosts have no view of bookings *on their spaces*.
- **Do:** Add a host view listing bookings for spaces the user owns, with confirm/reject controls.
- **Acceptance:** A host sees and can act on incoming booking requests.

### BOOK-5 — Cancellation / refund policy  · P1
- **Do:** Define a cancellation policy and implement refunds via Stripe (`refunds.create`) on eligible cancellations. Record refund state on the booking.
- **Acceptance:** Cancelling within policy issues the correct refund; the booking reflects it.

### PAYOUT-1 — Host payouts (Stripe Connect)  · P1 (can be staged)
- **Problem:** No payout concept exists; all money would land in the platform account.
- **Do:** Integrate Stripe Connect (Express accounts) so hosts onboard and receive payouts, with a platform fee. **Interim option:** manual/off-platform payouts with a clear ledger, if Connect is too large for v1.
- **Acceptance:** Funds route to hosts (minus fee), or there's a documented manual process + ledger.

---

## Phase 3 — Transactional email with Resend (P1)

No email exists anywhere today. The contact form (`api/contact/route.ts:28`) only `console.log`s.

### EMAIL-1 — Resend setup & shared sender  · P1
- **Do:** Add the `resend` package; create `src/lib/email.ts` with a typed `sendEmail()` wrapper; add `RESEND_API_KEY` + `EMAIL_FROM` env vars; verify the sending domain (SPF/DKIM) in Resend. Use React Email for templates.
- **Acceptance:** A test email sends in dev and prod from the verified domain.

### EMAIL-2 — Account emails  · P1
- Email verification on signup (set `User.emailVerified` on confirm), and password-reset email (see ACCT-2).

### EMAIL-3 — Booking emails  · P1
- Booking confirmation to **guest and host**, payment receipt, cancellation/refund notice. Triggered from the webhook (BOOK-1) and the transition actions (BOOK-3).

### EMAIL-4 — Contact form delivery  · P1
- Make `api/contact/route.ts` actually send to the team inbox (and optionally store the request). Remove the fake `setTimeout`.
- **Acceptance:** Submitting the contact form delivers a real email.

---

## Phase 4 — Complete the remaining features (P1/P2)

### ACCT-1 — Email verification flow  · P1
- Token-based verify link; gate sensitive actions on `emailVerified` if desired.

### ACCT-2 — Password reset / forgot password  · P1
- **Problem:** Does not exist. Add request-reset + reset-with-token endpoints and pages, using EMAIL-1.

### ACCT-3 — Profile editing  · P2
- Verify `dashboard/profile` persists changes (name, image) to the DB; add if missing.

### REVIEW-1 — Reviews API  · P1
- **Problem:** No reviews endpoint exists (`Review` model + `space-reviews.tsx` UI are display-only). Add `POST /api/spaces/[id]/reviews` (auth required; ideally restricted to users with a completed booking of that space) and aggregate ratings on the space detail page.
- **Acceptance:** A guest can post a review; it appears on the space; average rating updates.

### DATA-1 — Clean up the spaces data layer  · P2
- **Problem:** `api/spaces/route.ts` and `[id]/route.ts` are full of `as any`, manual `JSON.stringify` of JSON columns, and "old schema vs new schema" fallbacks (`route.ts:44-66`). Filtering is done **in memory after fetching all rows** (`route.ts:26-41`).
- **Do:** Remove the legacy-schema branches, use Prisma's typed JSON, push filtering/search into the DB query, add pagination.
- **Acceptance:** No `as any` in these routes; search/filter/pagination run in SQL.

### FIN-1 — Real financial dashboard  · P2
- **Problem:** `dashboard/financial/page.tsx:25-40` uses `Math.random()` mock data.
- **Do:** Compute revenue/bookings from real `Booking` rows for the host's spaces.
- **Acceptance:** Numbers reflect actual bookings.

---

## Phase 5 — Hardening & launch hygiene (P2)

### INFRA-1 — Environment & deploy config  · P2
- Document all required env vars in `.env.example` (add `RESEND_API_KEY`, `EMAIL_FROM`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`). Fix `NEXTAUTH_URL`/`AUTH_URL` at the platform level so the in-code sanitization hacks can be deleted.
- Set up the Stripe webhook endpoint in the live dashboard; switch test→live keys for launch.

### CLEAN-1 — Remove debug/test surface  · P2
- Remove or guard: `src/app/debug`, `src/app/test/*`, `api/check-storage` + `app/check-storage`, `db-status` page + `api/db-status`, `api/spaces/seed`, `api/spaces/add-visual-villains`, `spaces/list/direct`, `spaces/list/form/direct`.

### OBS-1 — Error tracking & logging  · P2
- Add Sentry (or similar); replace ad-hoc `console.*` with structured logging; capture API + webhook errors.

### SEC-1 — Rate limiting & abuse protection  · P2
- Rate-limit auth (login/signup/reset) and the contact form. Confirm CSRF posture for credentials login.

### QA-1 — Re-enable lint & add tests  · P2
- **Problem:** Build is `next build --no-lint` (`package.json:7`), and pervasive `as any` defeats type checking.
- **Do:** Re-enable lint in CI, remove `as any`, add tests for the booking/payment flow and auth (unit + a few e2e happy paths).

---

## Quick reference — current state by area

| Area | State | Key file(s) |
|---|---|---|
| Credentials login | ❌ Mocked (accepts anything) | `api/auth/[...nextauth]/route.ts:34`, `lib/auth.ts:73` |
| Signup | ✅ Real (bcrypt) but unused at login | `api/auth/signup/route.ts` |
| Google OAuth | ⚠️ Configured, not verified working | unified auth config |
| Authorization (own your data) | ❌ None on edit/delete/create | `api/spaces/[id]/route.ts`, `api/spaces/route.ts:76` |
| Booking creation | ⚠️ Works but duplicated by webhook | `api/bookings/route.ts`, `api/payments/webhook/route.ts:34` |
| Price/availability integrity | ❌ Trusts client, race at payment | `api/bookings/route.ts:13` |
| Booking lifecycle (cancel/confirm) | ❌ Missing | — |
| Host payouts | ❌ Missing | — |
| Transactional email | ❌ None | `api/contact/route.ts:28` |
| Password reset | ❌ Missing | — |
| Email verification | ❌ Missing | schema has `emailVerified`, unused |
| Reviews (post) | ❌ No API (display-only) | `space-reviews.tsx` |
| Financial dashboard | ❌ Mock data | `dashboard/financial/page.tsx:25` |
| Stripe webhook signature | ✅ Verified | `api/payments/webhook/route.ts:17` |
| Migrations | ✅ Present | `prisma/migrations/` |
| Debug/test routes | ⚠️ Left in repo | `app/debug`, `app/test/*`, `api/db-status`, … |
| Tests / observability | ❌ None | — |
