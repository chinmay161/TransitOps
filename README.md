# TransitOps

TransitOps is a Smart Transport Operations Platform built for the **Odoo Hackathon 2026**. It helps fleet teams manage vehicles, drivers, trips, fuel logs, expenses, maintenance, reports, notifications, and admin settings from one place.

The goal is simple: replace scattered spreadsheets and manual coordination with a centralized fleet operations system.

## Team Members

- Chinmay Wankhede
- Shivam Mishra
- Yash Singh

## What It Does

TransitOps provides role-based tools for fleet operations:

- Admins can manage settings, users, dashboards, reports, and audit logs.
- Fleet managers can monitor vehicles, drivers, maintenance, fuel, and expenses.
- Dispatchers can manage trips, driver assignment, and vehicle availability.
- Drivers can view trips, fuel logs, and notifications.

## Main Modules

- Authentication and role-based access
- Vehicle management
- Driver management with mock DigiLocker verification
- Trip and dispatch management
- Maintenance tracking
- Fuel log management
- Expense management and approval flow
- Dashboard analytics
- Reports with CSV/PDF export
- Notification center
- Admin settings and audit logs

## Tech Stack

**Frontend**

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Recharts

**Backend**

- Node.js
- Express
- TypeScript
- PostgreSQL
- `pg`
- Better Auth (Google OAuth sessions)
- Zod

**Infrastructure**

- Docker Compose
- PostgreSQL 16

## Project Structure

```text
TransitOps/
├── backend/       # Express API and services
├── frontend/      # Next.js application
├── database/      # SQL schema and seed data
├── docs/          # API, auth, schema, and business rules
└── docker-compose.yml
```

## Getting Started

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Or run everything at once from the repository root:

```bash
npm install
npm run dev
```

This starts the backend (http://localhost:5000) and frontend (http://localhost:3000) together.

### 2. Configure Environment

Create a `.env` file in the project root (see `.env.example`), or edit `backend/.env`. Important values:

```env
DATABASE_URL=postgresql://postgres:password123@localhost:5439/transitops
PORT=5000
BETTER_AUTH_SECRET=generate-with-openssl-rand-hex-32
BETTER_AUTH_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-oauth-client-id
GOOGLE_CLIENT_SECRET=your-oauth-client-secret
```

Google OAuth is the only sign-in method. Create an OAuth client (Web application) in Google Cloud Console with redirect URI `http://localhost:5000/api/auth/callback/google`. New Google users start with a safe `pending` role until an admin assigns one. See `docs/AUTHENTICATION.md`.

### 3. Run Backend

```bash
cd backend
pnpm install
pnpm dev
```

Backend runs on:

```text
http://localhost:5000
```

### 4. Run Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Useful Pages

- `/dashboard`
- `/drivers`
- `/vehicles`
- `/trips`
- `/maintenance`
- `/fuel-log`
- `/expenses`
- `/reports`
- `/notifications`
- `/admin-settings`

## Build

Backend:

```bash
cd backend
pnpm build
```

Frontend:

```bash
cd frontend
pnpm build
```

## Documentation

More detailed documentation is available in:

- `docs/API_CONTRACTS.md`
- `docs/AUTHENTICATION.md`
- `docs/BUSINESS_RULES.md`
- `docs/DATABASE_SCHEMA.md`

## Hackathon Note

TransitOps was created as part of the **Odoo Hackathon 2026** to demonstrate a practical fleet management platform for transport operations, dispatch control, cost tracking, and operational analytics.
