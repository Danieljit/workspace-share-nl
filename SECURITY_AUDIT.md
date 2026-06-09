# Security Audit — workspace-share-nl

> Date: 2026-06-09 · Scope: full application (foundation on `main` + the 8 open feature PRs + `/explore`) and Supabase/infra. Method: 6 parallel domain auditors (auth, authorization, payments, data exposure, input validation, secrets/config/deps/infra).

## Executive summary

**Overall posture: solid core, with a focused set of fixable issues.** The authorization model is the standout — every private endpoint authenticates and enforces ownership from the **server-derived** user id, so **no IDOR or privilege-escalation bugs were found**. The biggest real risks are: an out-of-date Next.js with known CVEs, a double-booking race at payment confirmation, public endpoints leaking host PII, and missing platform hardening (rate limiting, security headers). Several findings the auditors raised against `main` are **already fixed in your open PRs** — those are marked 🟡 below; merging them closes them.

**Status legend:** 🔴 outstanding (needs work) · 🟡 already fixed in an open PR (merge it) · 🟢 verified good

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| C1 | 🔴 Critical | Next.js 15.2.4 has known CVEs (RCE/SSRF/middleware auth-bypass) | Outstanding |
| C2 | 🔴 Critical | Double-booking race — confirm/create not transactional, no DB exclusion constraint | Outstanding |
| H1 | 🔴 High | Public space APIs leak host email/phone + owner account email to anyone | Outstanding |
| H2 | 🔴 High | Cloudinary signature endpoint is unauthenticated & unconstrained (upload abuse) | Outstanding |
| H3 | 🔴 High | Payment refund is a `TODO` — money can be captured with no booking; no refund/dispute webhooks | Outstanding |
| H4 | 🔴 High | No rate limiting on auth/signup/contact/payment/signature endpoints | Outstanding |
| H5 | 🔴 High | No security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) | Outstanding |
| H6 | 🔴 High | `allowDangerousEmailAccountLinking: true` + no email verification → account-takeover vector | Outstanding |
| H7 | 🔴 High | Dependency vulns (cloudinary arg-injection, lodash prototype-pollution, …) | Outstanding |
| H8 | 🟡 High | `POST /api/spaces` unauthenticated + mock owner | Fixed in PR #2 |
| H9 | 🟡 High | `create-intent` charged a **client-supplied** amount | Fixed in PR #6 |
| H10 | 🟡 High | Unauthenticated `/api/db-status` (DB/version + error disclosure) + debug/test routes | Fixed in PR #4 |
| M1 | 🔴 Med | Displayed total ≠ charged amount; currency mislabeled (shows USD, charges EUR); dead client helper | Outstanding |
| M2 | 🔴 Med | Stored-XSS risk: space `description` rendered via `dangerouslySetInnerHTML`, stored unsanitized | Outstanding |
| M3 | 🔴 Med | Email templates interpolate unescaped user input (HTML injection / phishing) | Outstanding |
| M4 | 🔴 Med | Spaces create/update have no schema validation; unbounded input; negative/zero secondary prices | Outstanding |
| M5 | 🔴 Med | Weak password policy (min 6 chars), no breach check; signup enables account enumeration | Outstanding |
| M6 | 🔴 Med | `create-intent` doesn't re-check availability; webhook doesn't verify `amount_received` | Outstanding |
| M7 | 🔴 Med | Infra config: `SECRETS_SCAN_ENABLED=false`, SPA catch-all redirect vs SSR, dueling `next.config.ts/.js` | Outstanding |
| L1 | 🔴 Low | Build skips type/lint (`--no-lint`, `ignoreBuildErrors`) | Outstanding |
| L2 | 🟢/Low | Open redirect via `callbackUrl` — currently mitigated, keep validated if wired up | Watch |
| L3 | 🟡 Critical→ | Hardcoded Cloudinary cloud/preset in `src/lib/env.ts` | Fixed in PR #4 |

---

## Critical

### C1 — Upgrade Next.js (known CVEs) 🔴
`next@15.2.4` (`package.json`) is in the affected range for multiple advisories: RCE in the React flight protocol, **SSRF via middleware redirects**, **middleware/auth bypass on App-Router segment prefetch**, image-optimizer cache poisoning, and DoS vectors. This app uses App-Router middleware for auth, so the bypass/SSRF items are directly relevant.
**Fix:** upgrade to `next@15.5.19` (non-major) and re-test the Netlify build.

### C2 — Double-booking race at confirmation 🔴
`payments/webhook/route.ts` checks for a conflicting CONFIRMED booking and then updates to CONFIRMED in **two separate statements with no transaction or row lock**, and there is **no DB-level exclusion/unique constraint** on (space, date range). Two concurrent `payment_intent.succeeded` events for overlapping slots can both pass the check → two CONFIRMED bookings + two captured payments. The same TOCTOU exists between availability-check and create in `bookings/route.ts`.
**Fix:** enforce at the database — a Postgres `EXCLUDE USING gist` constraint on `(spaceId, daterange)` for CONFIRMED bookings (or a unique partial index), and/or wrap the re-check+update in a `db.$transaction` at serializable isolation. Application-level checks alone cannot close this.

---

## High

### H1 — Public space APIs leak host PII 🔴
`GET /api/spaces/[id]` returns the **raw Space row** (`NextResponse.json(space)`) including `hostEmail`, `hostPhone`, `hostInfo`, exact `coordinates`, **plus `owner.email`** — with no auth. `GET /api/spaces` returns `owner.email` for every listing (bulk-harvestable). *(Note: this is read-side; Unit 1/PR #2 fixed write-side ownership but not the response projection.)*
**Fix:** replace raw returns with explicit `select`/projection that omits `hostEmail`, `hostPhone`, and `owner.email` for public callers.

### H2 — Cloudinary signature endpoint unauthenticated & unconstrained 🔴
`GET /api/cloudinary/signature` has no `requireUser()` and signs only `{timestamp, folder}`, also returning the `apiKey`. Anyone can mint signed upload tokens and push arbitrary files to your Cloudinary account; client-side type/size limits are trivially bypassed.
**Fix:** gate behind `requireUser()`, don't return the API key, and sign constraints (`allowed_formats`, `max_file_size`) or use a restricted upload preset. Add rate limiting.

### H3 — Refund is a TODO; missing refund/dispute webhooks 🔴
On the losing side of a booking race the webhook records `paymentStatus:"succeeded"` but leaves the booking unconfirmed with only a `// TODO: refund` — **the customer is charged for nothing**. The webhook also ignores `charge.refunded`, `charge.dispute.created`, `payment_intent.canceled`, and iDEAL's async `processing` flow, so dashboard refunds/chargebacks never free the booking.
**Fix:** implement `stripe.refunds.create` on the conflict branch (+ cancel booking + alert), and handle refund/dispute/canceled events.

### H4 — No rate limiting 🔴
No throttling on `/api/auth/*` (login/signup → brute force, enumeration, welcome-email spam), `/api/contact`, `/api/payments/*`, or the Cloudinary signature route.
**Fix:** add IP+identifier rate limiting (e.g. Upstash) on those endpoints.

### H5 — No security headers 🔴
Neither `next.config` nor `netlify.toml` set `Strict-Transport-Security`, `X-Frame-Options`/CSP `frame-ancestors`, `X-Content-Type-Options: nosniff`, or `Referrer-Policy`. App is exposed to clickjacking and MIME sniffing.
**Fix:** add a `headers()` config (or `[[headers]]` in netlify.toml) with the above.

### H6 — Dangerous OAuth linking + no email verification 🔴
`auth.config.ts` sets `allowDangerousEmailAccountLinking: true`, and credentials signup auto-logs-in with no email verification. Together these enable account-merge/takeover by email collision.
**Fix:** set it to `false` (default) and add a verified linking/verification flow, or only auto-link when the existing email is verified.

### H7 — Dependency vulnerabilities 🔴
`npm audit`: 1 critical / several high. Notable: **`cloudinary` <2.7.0** (argument injection), **`lodash`** (prototype pollution + `_.template` code injection), plus transitive `minimatch`/`flatted`/`postcss`. Most auto-fix.
**Fix:** `npm audit fix` + the `next` bump (C1). Bump `next-auth` within the beta line.

---

## Medium

- **M1 — Price/currency display integrity (🔴):** the booking page shows a **USD** total and adds its own 10% fee, `payment-form` labels it `€`, while the server charges the authoritative **EUR** `calculateBookingPrice` total. The `src/lib/stripe.ts` `createPaymentIntent` helper is also dead/mismatched (sends `totalAmount` the route ignores). No theft (server price is authoritative) but the user approves an amount that differs from the charge. **Fix:** single-source the breakdown from the server, label EUR consistently, remove the dead helper.
- **M2 — Stored-XSS risk (🔴):** `listing-onboarding/steps/final-review-step.tsx` renders `description` via `dangerouslySetInnerHTML`, and the space routes store `description` unsanitized. Self-XSS today, but **becomes stored-XSS if any public page renders description as HTML** — verify and sanitize server-side (sanitize-html/DOMPurify) or render as text.
- **M3 — Email HTML injection (🔴):** `src/lib/email.ts` interpolates `name/company/subject/message`/`spaceTitle` directly into HTML (with `\n`→`<br/>`). Escape all interpolated values.
- **M4 — Unvalidated space input (🔴):** unlike the profile route (clean zod allow-list), `spaces` POST/PATCH pass raw `json.*` to Prisma with no type/length checks, and JSON columns accept unbounded blobs; secondary prices allow negative/zero. **Fix:** add a zod schema like `profileSchema`, with positive/max price bounds.
- **M5 — Auth hygiene (🔴):** password min length 6 with no strength/breach check; signup returns `"User already exists"` (enumeration). Raise to ≥8–12 + HIBP check; return a generic response.
- **M6 — Payment defense-in-depth (🔴):** `create-intent` doesn't re-run availability; the webhook doesn't compare `amount_received` to the recomputed price. Add both.
- **M7 — Infra config (🔴):** `netlify.toml` has `SECRETS_SCAN_ENABLED=false` (re-enable; omit specific public keys instead) and a `/* → /index.html` SPA catch-all that conflicts with SSR (let `@netlify/plugin-nextjs` own routing); **two config files** (`next.config.ts` empty stub + `next.config.js` real config) mean the real image/standalone config may be ignored — consolidate to one.

## Low / Info

- **L1 (🔴):** build runs `next build --no-lint` with `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` — security-relevant type/lint errors won't fail the build. Run lint/typecheck in CI.
- **L2 (🟢/watch):** `callbackUrl` open-redirect is currently mitigated (signin hardcodes `/dashboard`; NextAuth default `redirect` enforces same-origin). Keep it validated if you ever consume `callbackUrl`.
- **Review comment** has no max length (minor DoS/storage).

## Already fixed in open PRs (merge to close)
- **PR #2 (listings):** `POST /api/spaces` now requires auth and sets `ownerId` from the session (closes H8).
- **PR #6 (payments):** server recomputes the charge; client amount ignored (closes H9). *(C2 race + H3 refunds remain even after this PR.)*
- **PR #4 (cleanup):** removes `db-status`/`debug`/`test`/`check-storage` routes and replaces the hardcoded `src/lib/env.ts` with env-driven config (closes H10 + L3). *Recommendation: also remove the leftover hardcoded fallback value.*

## ✅ Verified good
- **Authorization/IDOR:** space edit/delete (`requireSpaceOwner`), booking view/confirm/reject/cancel (guest-vs-host roles), `bookings/mine`, profile PATCH (self-scoped zod allow-list, never exposes `hashedPassword`), reviews (self-scoped upsert, booking-eligibility, no self-review), dashboard (owner-scoped) — all enforce ownership from the server-derived user id. No IDOR found.
- **Profile visibility:** people directory filters `PUBLIC`; `/people/[id]` blocks private profiles for non-owners; field selects exclude PII.
- **Payments core:** webhook signature verification fails closed, idempotent (no double-confirm on replay), `stripePaymentIntentId @unique`, server-authoritative pricing.
- **Reviews & profile** responses minimize PII; Prisma is parameterized (no SQL injection); the one raw query is a static template.
- **Auth structure:** bcrypt, generic signin errors, edge/Node config split, JWT id sourced from the signed token.
- **Infra:** Supabase RLS now enabled on all tables (public anon REST surface locked down); `.env` gitignored, no real secrets committed.

---

## Recommended remediation order
1. **C1** `next@15.5.19` + **H7** `npm audit fix` (fast, high impact).
2. **C2** DB exclusion constraint for double-booking + **H3** real refund/dispute handling.
3. **H1** projection fix for public space APIs (PII).
4. **H2** auth + constrain the Cloudinary signature endpoint.
5. **H4/H5** rate limiting + security headers.
6. **H6** disable dangerous OAuth linking; add email verification.
7. Merge **PR #2/#4/#6** to close H8/H9/H10/L3.
8. **M1–M7** as a hardening pass; **M4** (space input zod) pairs naturally with merging PR #2.
