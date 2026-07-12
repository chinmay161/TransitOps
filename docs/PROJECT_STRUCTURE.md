# Project Structure — TransitOps

> **Repository:** `git@github.com:org/transitops.git`
> **Monorepo:** Yes (backend + frontend + database + infrastructure)
> **Odoo Hackathon 2026**

---

## Folder Structure

```
transitops/
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, typecheck, test on PR
│       └── deploy.yml          # Build and deploy to staging/production
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI application entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py     # POST /auth/login, /refresh, /logout, /me
│   │   │   │   ├── users.py    # CRUD /users
│   │   │   │   ├── drivers.py  # CRUD /drivers, nested /drivers/{id}/trips
│   │   │   │   ├── vehicles.py # CRUD /vehicles, nested endpoints
│   │   │   │   ├── trips.py    # CRUD /trips, status transitions
│   │   │   │   ├── maintenance.py     # CRUD /maintenance, status transitions
│   │   │   │   ├── fuel_logs.py       # CRUD /fuel-logs
│   │   │   │   ├── expenses.py        # CRUD /expenses
│   │   │   │   └── notifications.py   # GET, PATCH /notifications
│   │   │   └── deps.py         # Dependency injection (get_db, get_current_user)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py       # Pydantic Settings (env vars)
│   │   │   ├── security.py     # JWT encode/decode, password hashing
│   │   │   ├── database.py     # SQLAlchemy async engine + session factory
│   │   │   └── exceptions.py   # Custom exception handlers
│   │   ├── models/
│   │   │   ├── __init__.py     # SQLAlchemy Base + all model imports
│   │   │   ├── user.py
│   │   │   ├── driver.py
│   │   │   ├── vehicle.py
│   │   │   ├── trip.py
│   │   │   ├── maintenance.py
│   │   │   ├── fuel_log.py
│   │   │   ├── expense.py
│   │   │   └── notification.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # LoginRequest, TokenResponse
│   │   │   ├── user.py         # UserCreate, UserUpdate, UserResponse
│   │   │   ├── driver.py       # DriverCreate, DriverUpdate, DriverResponse
│   │   │   ├── vehicle.py      # VehicleCreate, VehicleUpdate, VehicleResponse
│   │   │   ├── trip.py         # TripCreate, TripUpdate, TripResponse, TripStart, TripComplete
│   │   │   ├── maintenance.py  # MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
│   │   │   ├── fuel_log.py     # FuelLogCreate, FuelLogUpdate, FuelLogResponse
│   │   │   ├── expense.py      # ExpenseCreate, ExpenseUpdate, ExpenseResponse
│   │   │   ├── notification.py # NotificationResponse, NotificationRead
│   │   │   ├── common.py       # PaginationParams, ErrorResponse, MetaResponse
│   │   │   └── enums.py        # Python ENUMs mirroring DB ENUMs
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── auth_service.py         # Auth logic, token management
│   │       ├── user_service.py         # User CRUD business logic
│   │       ├── driver_service.py       # Driver + status management
│   │       ├── vehicle_service.py      # Vehicle CRUD + compliance checks
│   │       ├── trip_service.py         # Trip CRUD + overlap detection + status workflow
│   │       ├── maintenance_service.py  # Maintenance + auto vehicle status
│   │       ├── fuel_log_service.py     # Fuel log + odometer validation
│   │       ├── expense_service.py      # Expense CRUD
│   │       └── notification_service.py # Notification creation + delivery
│   ├── alembic/
│   │   ├── versions/          # Migration scripts
│   │   ├── env.py             # Alembic environment config
│   │   └── alembic.ini         # Alembic configuration
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py        # Fixtures: test DB, test client, auth headers
│   │   ├── unit/              # Unit tests for services
│   │   │   ├── test_auth_service.py
│   │   │   ├── test_trip_service.py
│   │   │   └── ...
│   │   └── integration/       # Integration tests for API endpoints
│   │       ├── test_auth.py
│   │       ├── test_users.py
│   │       ├── test_drivers.py
│   │       ├── test_vehicles.py
│   │       ├── test_trips.py
│   │       ├── test_maintenance.py
│   │       ├── test_fuel_logs.py
│   │       ├── test_expenses.py
│   │       └── test_notifications.py
│   ├── requirements.txt       # Python dependencies
│   ├── requirements-dev.txt   # Dev dependencies (pytest, ruff, mypy)
│   ├── Dockerfile
│   └── .env.example           # Backend environment variables
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg
│   ├── src/
│   │   ├── main.tsx                    # App entry point
│   │   ├── App.tsx                     # Router + layout
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance, interceptors, auth header
│   │   │   ├── auth.ts                # Auth API calls
│   │   │   ├── users.ts               # Users API calls
│   │   │   ├── drivers.ts             # Drivers API calls
│   │   │   ├── vehicles.ts            # Vehicles API calls
│   │   │   ├── trips.ts               # Trips API calls
│   │   │   ├── maintenance.ts         # Maintenance API calls
│   │   │   ├── fuelLogs.ts            # Fuel logs API calls
│   │   │   ├── expenses.ts            # Expenses API calls
│   │   │   └── notifications.ts       # Notifications API calls
│   │   ├── components/
│   │   │   ├── common/               # Shared UI primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ErrorState.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx       # Main layout shell
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   └── forms/                 # Reusable form components
│   │   │       ├── FormField.tsx
│   │   │       ├── Select.tsx
│   │   │       └── DatePicker.tsx
│   │   ├── features/                  # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── RecentTripsWidget.tsx
│   │   │   ├── drivers/
│   │   │   │   ├── DriverListPage.tsx
│   │   │   │   ├── DriverDetailPage.tsx
│   │   │   │   ├── DriverFormPage.tsx
│   │   │   │   └── DriverStatusBadge.tsx
│   │   │   ├── vehicles/
│   │   │   │   ├── VehicleListPage.tsx
│   │   │   │   ├── VehicleDetailPage.tsx
│   │   │   │   ├── VehicleFormPage.tsx
│   │   │   │   └── VehicleStatusBadge.tsx
│   │   │   ├── trips/
│   │   │   │   ├── TripListPage.tsx
│   │   │   │   ├── TripDetailPage.tsx
│   │   │   │   ├── TripFormPage.tsx
│   │   │   │   ├── TripStatusBadge.tsx
│   │   │   │   └── TripActions.tsx
│   │   │   ├── maintenance/
│   │   │   │   ├── MaintenanceListPage.tsx
│   │   │   │   ├── MaintenanceFormPage.tsx
│   │   │   │   └── MaintenanceStatusBadge.tsx
│   │   │   ├── fuel/
│   │   │   │   ├── FuelLogListPage.tsx
│   │   │   │   └── FuelLogFormPage.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpenseListPage.tsx
│   │   │   │   └── ExpenseFormPage.tsx
│   │   │   └── notifications/
│   │   │       └── NotificationListPage.tsx
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useFilters.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useNotifications.ts
│   │   ├── stores/                    # State management
│   │   │   ├── authStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── types/                     # TypeScript interfaces
│   │   │   ├── user.ts
│   │   │   ├── driver.ts
│   │   │   ├── vehicle.ts
│   │   │   ├── trip.ts
│   │   │   ├── maintenance.ts
│   │   │   ├── fuelLog.ts
│   │   │   ├── expense.ts
│   │   │   ├── notification.ts
│   │   │   └── api.ts                # ApiResponse<T>, PaginationMeta, etc.
│   │   ├── utils/
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts
│   │   │   ├── cn.ts                  # classnames utility
│   │   │   └── validators.ts          # Client-side validation rules
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── index.html
│   └── Dockerfile
│
├── database/
│   ├── schema.sql              # Full PostgreSQL 16 schema (DDL)
│   └── seed.sql                # Development seed data
│
├── docs/
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACTS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── BUSINESS_RULES.md
│   └── TASK_DISTRIBUTION.md
│
├── docker-compose.yml          # PostgreSQL 16 + Backend + Frontend
├── .env.example                # Global environment variable template
├── .gitignore
└── README.md
```

---

## Purpose of Every Folder

| Folder | Purpose |
|---|---|
| `.github/workflows/` | CI/CD pipeline definitions (GitHub Actions) |
| `backend/app/api/v1/` | FastAPI route handlers — one file per module |
| `backend/app/core/` | Cross-cutting concerns: config, security, database, exception handling |
| `backend/app/models/` | SQLAlchemy ORM models — one file per table, mirrors `schema.sql` |
| `backend/app/schemas/` | Pydantic request/response models for validation and serialization |
| `backend/app/services/` | Business logic layer — encapsules all domain rules |
| `backend/alembic/` | Database migration management (versioned DDL changes) |
| `backend/tests/` | pytest test suite (unit + integration) |
| `frontend/src/api/` | HTTP client wrappers — one file per backend module |
| `frontend/src/components/common/` | Reusable presentational UI components |
| `frontend/src/components/layout/` | Application shell: sidebar, header, layout |
| `frontend/src/features/` | Feature-based page modules, one folder per domain |
| `frontend/src/hooks/` | Custom React hooks for reusable stateful logic |
| `frontend/src/stores/` | Zustand stores for global client state |
| `frontend/src/types/` | TypeScript interfaces matching backend API responses |
| `database/` | SQL schema and seed data (source of truth for DB) |
| `docs/` | Project documentation |

---

## Naming Conventions

### Backend (Python)

| Artifact | Convention | Example |
|---|---|---|
| File names | `snake_case` | `fuel_log_service.py` |
| Class names | `PascalCase` | `FuelLogService`, `TripCreate` |
| Function/method names | `snake_case` | `get_trip_by_id()`, `create_fuel_log()` |
| Variable names | `snake_case` | `trip_status`, `estimated_distance` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PER_PAGE`, `JWT_ALGORITHM` |
| Module `__all__` | Alphabetically sorted | — |

### Frontend (TypeScript/React)

| Artifact | Convention | Example |
|---|---|---|
| Component files | `PascalCase.tsx` | `VehicleCard.tsx` |
| Non-component files | `camelCase.ts` | `formatDate.ts` |
| React component names | `PascalCase` | `TripListPage` |
| React hook names | `camelCase` prefixed `use` | `usePagination()` |
| Function names | `camelCase` | `fetchDrivers()` |
| Type/interface names | `PascalCase` | `TripResponse`, `ApiError` |
| CSS class names | `kebab-case` (Tailwind) | `vehicle-card` |
| Folder names (features) | `kebab-case` | `fuel-logs/` |

### Database

| Artifact | Convention | Example |
|---|---|---|
| Table names | `snake_case` (plural) | `maintenance_records` |
| Column names | `snake_case` | `scheduled_start` |
| ENUM value names | `snake_case` | `in_progress`, `on_leave` |
| Constraint names | `{type}_{table}_{column(s)}` | `uq_users_email`, `ck_trips_scheduled_end` |
| Index names | `idx_{table}_{column(s)}` | `idx_vehicles_next_maintenance` |

---

## Backend Architecture

```
[HTTP Request]
       │
       ▼
[FastAPI Router]           → api/v1/*.py (thin controllers)
       │
       ▼
[Pydantic Schema]          → schemas/*.py (validates request body)
       │
       ▼
[Service Layer]            → services/*.py (business logic, validation)
       │
       ▼
[SQLAlchemy Model]         → models/*.py (ORM queries)
       │
       ▼
[PostgreSQL 16]
```

### Key Design Decisions

- **Services layer** contains all business logic; routers only handle HTTP concerns (status codes, response formatting).
- **Repository calls** go through SQLAlchemy async sessions injected via FastAPI dependencies.
- **Dependency injection** in `api/deps.py` provides `get_db` (async session), `get_current_user` (JWT validation), and `get_current_active_user` (JWT + active check).
- **Pydantic schemas** define both request validation and response serialization — never expose ORM models directly.
- **Alembic** manages incremental schema changes. The `schema.sql` file is the source of truth; migrations are generated from it.

---

## Database Architecture

- **Connection:** Async via `asyncpg` + SQLAlchemy 2.0 async API
- **Migrations:** Alembic with auto-generation from model definitions
- **ENUMs:** Defined as PostgreSQL ENUMs in `schema.sql` — mirrored as Python `StrEnum` or `enum.Enum` in `schemas/enums.py`
- **UUIDs:** Generated at database level via `gen_random_uuid()` (pgcrypto)
- **Audit:** `created_at`/`updated_at` on all tables, `created_by`/`updated_by` on transactional tables

---

## Environment Variables

### Backend (`.env`)

```
# Application
APP_NAME=TransitOps
APP_VERSION=1.0.0
DEBUG=false

# Database
DATABASE_URL=postgresql+asyncpg://transitops:password@localhost:5432/transitops

# JWT
JWT_SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# CORS
CORS_ORIGINS=http://localhost:5173

# Logging
LOG_LEVEL=INFO
```

### Frontend (`.env`)

```
VITE_API_BASE_URL=http://localhost:8000/v1
```

---

## Docker Usage

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: transitops
      POSTGRES_USER: transitops
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://transitops:password@db:5432/transitops
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:8000/v1
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Commands

```bash
# Start full stack
docker compose up --build

# Start only database
docker compose up db -d

# Reset database
docker compose down -v && docker compose up db -d

# Run backend tests
docker compose exec backend pytest
```

---

## Coding Standards

### Python

| Tool | Purpose | Config File |
|---|---|---|
| **Ruff** | Linting + formatting | `pyproject.toml` |
| **mypy** | Static type checking | `pyproject.toml` |
| **pytest** | Testing | `pyproject.toml` |
| **pre-commit** | Pre-commit hooks | `.pre-commit-config.yaml` |

Rules:
- Line length: 100 characters
- Quotes: double quotes for strings
- Imports: standard library → third-party → local (grouped with blank lines)
- Type hints required on all function signatures
- Async for all I/O-bound operations
- No `print()` — use `logging` module

### TypeScript

| Tool | Purpose | Config File |
|---|---|---|
| **ESLint** | Linting | `eslint.config.js` |
| **Prettier** | Formatting | `.prettierrc` |
| **TypeScript** | Type checking | `tsconfig.json` |
| **Vitest** | Testing | `vitest.config.ts` |

Rules:
- Line length: 100 characters
- Quotes: single quotes
- Semicolons: required
- `interface` over `type` for object shapes
- Strict mode in `tsconfig.json`
- No `any` — use `unknown` if type is not known

---

## Git Conventions

### Branch Strategy

```
main ─────────────────────────────────── (production)
  │
  └── develop ───────────────────────── (integration)
        │
        ├── feature/TRANS-{id}-{slug}   (new features)
        ├── bugfix/TRANS-{id}-{slug}    (bug fixes)
        ├── refactor/TRANS-{id}-{slug}  (refactoring)
        └── docs/TRANS-{id}-{slug}      (documentation)
```

### Workflow

1. Branch from `develop`:
   ```bash
   git checkout develop && git pull
   git checkout -b feature/TRANS-42-trip-overlap-validation
   ```

2. Commit frequently with conventional commits:
   ```bash
   git commit -m "feat(trips): add driver overlap validation on trip create"
   ```

3. Push and create a Pull Request to `develop`:
   ```bash
   git push -u origin feature/TRANS-42-trip-overlap-validation
   ```

4. PR is squash-merged after approval and CI green.

5. Release: `develop` → `main` with a version tag.

### Commit Message Format

```
<type>(<scope>): <short imperative description>

[optional body - bullet points for details]
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`, `ci`

**Examples:**

```
feat(trips): add driver overlap validation on trip create
fix(vehicles): prevent year out of range on create
docs(api): document pagination for all list endpoints
refactor(services): extract overlap validation into shared helper
test(fuel-logs): add unit tests for odometer validation
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        types_or: [javascript, typescript, css, json, yaml]
```

---

## CI/CD Pipeline

### GitHub Actions — `ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements-dev.txt
      - run: ruff check backend/
      - run: mypy backend/
      - run: pytest backend/tests/

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:run
```
