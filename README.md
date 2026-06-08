# WorkspaceShare Platform

<div align="center">
  <img src="public/favicon.svg" alt="WorkspaceShare Logo" width="80" height="80">
  <h3>Find and book the perfect workspace for your needs</h3>
</div>

## 🚀 Project Overview

WorkspaceShare is a modern platform that connects workspace owners with professionals looking for flexible work environments. The platform allows users to list their unused spaces (desks, offices, meeting rooms) and enables others to discover and book these spaces based on their specific needs.

## ✨ Features

- **Workspace Listing**: Create and manage workspace listings with detailed information
- **Listing Management**: Edit existing listings with a user-friendly tabbed interface
- **Interactive Maps**: Find workspaces using interactive maps with location-based search
- **Booking System**: Book workspaces with a streamlined booking process
- **User Authentication**: Sign in with email/password or Google OAuth
- **User Dashboard**: Manage your listings and bookings in a centralized dashboard
- **Reviews & Ratings**: Leave and view reviews for workspaces
- **Responsive Design**: Fully responsive UI that works on all devices
- **Transactional Email**: Booking and contact notifications via Resend

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router for server components and routing
- **React 19**: UI library for building component-based interfaces
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Accessible UI primitives for React components
- **Leaflet**: Interactive maps for location-based features
- **React Hook Form**: Form validation and handling
- **Zod**: TypeScript-first schema validation

### Backend
- **Next.js API Routes**: Serverless functions for backend logic
- **Prisma 6**: Type-safe ORM for database access
- **PostgreSQL**: Relational database for data storage
- **NextAuth.js 5**: Authentication solution with multiple providers
- **Cloudinary**: Cloud-based image management

### Development Tools
- **Turbopack**: Fast bundler for Next.js development
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## 🚦 Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database
- Google OAuth credentials (for Google Sign-in)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/workspace-share.git
cd workspace-share
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and update it with your own values:

```bash
cp .env.example .env
```

Edit `.env` with your database connection string, authentication secrets, and API keys. See [Environment Variables](#-environment-variables) below for the full list.

4. **Set up the database**

Generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy   # apply existing migrations (production / CI)
# or, for local development:
npx prisma migrate dev      # apply + create migrations as the schema evolves
```

5. **Seed the database with sample data (optional)**

```bash
npm run seed
```

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔐 Environment Variables

All variables are documented in [`.env.example`](.env.example). Copy it to `.env` and fill in your values.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `AUTH_SECRET` | Yes | Auth.js v5 secret. Generate with `npx auth secret` or `openssl rand -base64 32`. |
| `AUTH_URL` | Prod | Canonical app URL (e.g. `https://yourdomain.com`). Optional in development. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google OAuth credentials (credentials login works without these). |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (use a `sk_test_...` key in development). |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (`pk_test_...`). Exposed to the browser. |
| `RESEND_API_KEY` | No | Resend API key. If unset, emails are logged to the console instead of sent. |
| `EMAIL_FROM` | No | From-address for transactional email. |
| `CONTACT_EMAIL` | No | Recipient for contact-form submissions. Falls back to `EMAIL_FROM` if unset. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name (browser-visible). |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No | Cloudinary server credentials for signed uploads. |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | No | Cloudinary unsigned upload preset (browser-visible). |

> **Note on linting:** the `build` script runs `next build --no-lint` because the
> codebase currently has pre-existing ESLint findings (mostly
> `@typescript-eslint/no-explicit-any` and unused-variable warnings) that are out
> of scope to fix here. Run `npm run lint` to see them. Once they are cleaned up,
> switch the `build` script back to `next build` to re-enable linting in CI.

## 📁 Project Structure

```
workspace-share/
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── scripts/               # Utility scripts
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes for data handling
│   │   ├── dashboard/     # Dashboard pages for user management
│   │   └── spaces/        # Workspace listing and details pages
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components
│   │   ├── spaces/        # Workspace listing components
│   │   ├── layout/        # Layout components (header, footer, etc.)
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utility functions and shared logic
│   └── types/             # TypeScript type definitions
├── .env.example          # Example environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔑 Authentication

The application uses NextAuth.js for authentication with two providers:

1. **Credentials Provider**: Email/password authentication
2. **Google Provider**: OAuth authentication with Google

To set up Google authentication:

1. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/)
2. Add the client ID and secret to your `.env` file
3. Set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google` for local development

## 💾 Database Configuration

The application uses PostgreSQL with Prisma ORM.

1. Set `DATABASE_URL` in your `.env` file to a valid PostgreSQL connection string.
2. Run `npx prisma migrate deploy` (or `npx prisma migrate dev` in development) to apply the schema.
3. Optionally run `npm run seed` to populate sample data.
4. Inspect the database with `npx prisma studio` if you need a visual browser.

## 🗺️ Map Integration

The application uses Leaflet for interactive maps. The map component is dynamically imported to prevent SSR issues:

```typescript
const LocationMap = dynamic(
  () => import("@/components/spaces/listing-onboarding/location-map"),
  { ssr: false }
);
```

## 📝 Workspace Management

Users can manage their workspace listings through the dashboard:

1. **Create Listings**: Multi-step form with validation for creating new workspace listings
2. **Edit Listings**: Tabbed interface for editing all aspects of existing listings
3. **View Listings**: Dashboard view of all user listings with quick access to edit and view details
4. **Delete Listings**: Remove listings that are no longer needed

## 🧩 Component Library

The UI is built using a combination of Radix UI primitives and custom components styled with Tailwind CSS. The component library includes:

- Buttons, inputs, and form elements
- Cards and containers
- Navigation components
- Modal dialogs
- Toast notifications
- Tabs and multi-step interfaces

## 📱 Responsive Design

The application is fully responsive and works on devices of all sizes. Tailwind's responsive utilities are used throughout the codebase:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>
```

## 🔄 State Management

State management is handled using React's built-in hooks:

- `useState` for component-level state
- `useContext` for shared state (auth, theme, etc.)
- `useEffect` for side effects and lifecycle management

## 🚢 Deployment

The application can be deployed to any platform that supports Next.js, such as Vercel or Netlify:

1. **Build the application**

```bash
npm run build
```

2. **Start the production server**

```bash
npm run start
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and React.
