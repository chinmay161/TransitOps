# API Contracts — TransitOps

> **Protocol:** REST over HTTPS
> **Base URL:** `https://api.transitops.example.com/v1`
> **Content Type:** `application/json`
> **Character Encoding:** UTF-8

---

## Standard Conventions

### URL Structure

```
/{resource}                          # Collection
/{resource}/{id}                     # Single resource
/{resource}/{id}/{sub-resource}      # Nested resource
```

### HTTP Methods

| Method | Semantics | Idempotent | Request Body |
|---|---|---|---|
| `GET` | Retrieve resource(s) | Yes | No |
| `POST` | Create a new resource | No | Yes |
| `PUT` | Full replacement of resource | Yes | Yes |
| `PATCH` | Partial update of resource | Yes | Yes |
| `DELETE` | Remove a resource | Yes | No |

### Resource Naming

- **Plural nouns** for collection endpoints: `/trips`, `/vehicles`, `/maintenance`
- **Snake case** for field names in JSON: `scheduled_start`, `estimated_distance_km`
- **UUID v4** as resource identifiers: `550e8400-e29b-41d4-a716-446655440000`

---

## Standard Response Envelope

### Success — Single Resource

```json
{
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "trip",
        "attributes": {
            "status": "scheduled",
            "origin": "Warehouse A",
            "destination": "Depot B",
            "scheduled_start": "2026-07-12T08:00:00Z",
            "scheduled_end": "2026-07-12T16:00:00Z",
            "created_at": "2026-07-10T10:00:00Z",
            "updated_at": "2026-07-10T10:00:00Z"
        },
        "relationships": {
            "driver": { "data": { "id": "...", "type": "driver" } },
            "vehicle": { "data": { "id": "...", "type": "vehicle" } }
        }
    }
}
```

### Success — Collection

```json
{
    "data": [ ... ],
    "meta": {
        "page": 1,
        "per_page": 25,
        "total": 142,
        "total_pages": 6
    }
}
```

### Success — Created (201)

```json
{
    "data": { ... }
}
```

### Success — Deleted (204)

*No body returned.*

---

## Pagination, Filtering, Sorting, Search

### Pagination

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | `1` | — | Page number (1-indexed) |
| `per_page` | integer | `25` | `100` | Items per page |

**Response headers:**

| Header | Description |
|---|---|
| `X-Total-Count` | Total number of records |
| `X-Total-Pages` | Total number of pages |
| `Link` | RFC 5988 pagination links (`first`, `prev`, `next`, `last`) |

### Filtering

Apply filters via query parameters using the pattern:

```
GET /trips?filter[status]=in_progress&filter[driver_id]=<uuid>
```

Supported operators:

| Operator | Syntax | Example |
|---|---|---|
| Equals | `filter[field]=value` | `filter[status]=completed` |
| Not equals | `filter[field][ne]=value` | `filter[status][ne]=cancelled` |
| Greater than | `filter[field][gt]=value` | `filter[amount][gt]=100` |
| Less than | `filter[field][lt]=value` | `filter[amount][lt]=500` |
| In list | `filter[field][in]=a,b,c` | `filter[status][in]=scheduled,in_progress` |
| Date range | `filter[field][gte]=2026-01-01&filter[field][lte]=2026-12-31` | `filter[scheduled_date][gte]=2026-07-01` |

### Sorting

```
GET /trips?sort=-scheduled_start,created_at
```

Prefix field with `-` for descending order. Default: `-created_at`.

### Search

```
GET /trips?q=warehouse
```

Full-text search applied to relevant text columns (defined per endpoint).

---

## HTTP Status Codes

| Code | Name | Usage |
|---|---|---|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Malformed request body, invalid JSON |
| `401` | Unauthorized | Missing or expired authentication token |
| `403` | Forbidden | Authenticated but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate unique value, overlapping schedule |
| `422` | Unprocessable Entity | Validation failure (field-level errors) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |

---

## Error Response Format

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed for the request",
        "details": [
            {
                "field": "email",
                "message": "must be a valid email address",
                "code": "INVALID_FORMAT"
            }
        ],
        "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
}
```

### Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | One or more fields failed validation |
| `NOT_FOUND` | 404 | Resource ID does not exist |
| `UNAUTHORIZED` | 401 | Authentication token missing or invalid |
| `FORBIDDEN` | 403 | Role lacks required permission |
| `CONFLICT` | 409 | Unique constraint violation or schedule overlap |
| `INVALID_TRANSITION` | 422 | Status change violates allowed transitions |
| `RATE_LIMITED` | 429 | API rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server-side error |

---

## Authentication

Authentication is handled by Better Auth with Google OAuth as the only provider.
Sessions are server-side (PostgreSQL) with httpOnly signed cookies — no JWTs.

### Endpoints

| Method | URL | Description |
|---|---|---|
| `POST` | `/api/auth/sign-in/social` | Start Google OAuth (`{ "provider": "google", "callbackURL": "..." }`) → returns redirect URL |
| `GET` | `/api/auth/callback/google` | Google OAuth callback (handled by Better Auth) |
| `POST` | `/api/auth/sign-out` | Delete the current session and clear cookies |
| `GET` | `/api/auth/get-session` | Return the raw Better Auth session (or `null`) |
| `GET` | `/api/auth/me` | Return the TransitOps profile of the authenticated user |

### GET /api/auth/me

**Cookies:** Better Auth session cookie (httpOnly). No `Authorization` header is used.

**Success Response (200):**

```json
{
    "success": true,
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "admin@gmail.com",
        "full_name": "Admin User",
        "phone": "+1234567890",
        "role": "admin",
        "email_verified": true,
        "is_active": true,
        "created_at": "2026-07-01T00:00:00Z"
    }
}
```

Drivers additionally include `"driver_id": "<drivers.id>"`.

**Error Responses:**

| Code | Condition |
|---|---|
| 401 | No valid session |
| 401 | Account deactivated (`is_active = false`) |

New Google users are created automatically with role `pending`; module APIs then return
403 until an admin assigns a role. Existing users matched by email keep their role.

---

## Users

### Entity Reference — `users` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `full_name` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(50) | Optional, regex validated |
| `role` | ENUM(user_role) | NOT NULL (`pending` until an admin assigns a role) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true |
| `created_at` | TIMESTAMPTZ | NOT NULL |

Identity is provisioned via Google OAuth (Better Auth); there is no password field in active use.

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/api/users` | Required | admin, fleet_manager |

### GET /users

Returns all user accounts (admin & fleet_manager only). Roles are assigned by an admin
(`UPDATE users SET role = ...`); there is no self-service registration.

**Success Response (200):**

```json
{
    "data": [
        {
            "id": "uuid",
            "email": "user@example.com",
            "full_name": "John Doe",
            "phone": "+1234567890",
            "role": "driver",
            "email_verified": true,
            "is_active": true,
            "approval_status": "approved",
            "last_login": null,
            "created_at": "2026-07-01T00:00:00Z"
        }
    ]
}
```

---

## Drivers

### Entity Reference — `drivers` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → users |
| `license_number` | VARCHAR(100) | NOT NULL, UNIQUE |
| `license_expiry` | DATE | NOT NULL |
| `license_type` | VARCHAR(50) | Optional |
| `status` | ENUM(driver_status) | NOT NULL, DEFAULT 'available' |
| `emergency_contact` | VARCHAR(255) | Optional |
| `emergency_phone` | VARCHAR(50) | Optional, regex validated |
| `hire_date` | DATE | NOT NULL, must be ≤ today |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/drivers` | Required | admin, fleet_manager, dispatcher |
| `GET` | `/drivers/{id}` | Required | admin, fleet_manager, dispatcher, driver (own) |
| `POST` | `/drivers` | Required | admin, fleet_manager |
| `PATCH` | `/drivers/{id}` | Required | admin, fleet_manager |
| `DELETE` | `/drivers/{id}` | Required | admin |
| `GET` | `/drivers/{id}/trips` | Required | admin, fleet_manager, dispatcher |

### GET /drivers

**Query Parameters:** `page`, `per_page`, `sort`, `filter[status]`, `filter[user_id]`, `q`

**Success Response (200):**

```json
{
    "data": [
        {
            "id": "uuid",
            "user_id": "uuid",
            "license_number": "DL-42-2026",
            "license_expiry": "2027-06-30",
            "license_type": "CDL A",
            "status": "available",
            "emergency_contact": "Jane Doe",
            "emergency_phone": "+9876543210",
            "hire_date": "2026-01-15",
            "created_at": "2026-01-15T09:00:00Z",
            "updated_at": "2026-07-10T08:00:00Z"
        }
    ],
    "meta": { "page": 1, "per_page": 25, "total": 5, "total_pages": 1 }
}
```

### POST /drivers

**Request Body:**

```json
{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "license_number": "DL-42-2026",
    "license_expiry": "2027-06-30",
    "license_type": "CDL A",
    "emergency_contact": "Jane Doe",
    "emergency_phone": "+9876543210",
    "hire_date": "2026-01-15"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `user_id` | Required, must reference existing user, must not already have a driver profile |
| `license_number` | Required, must be unique |
| `license_expiry` | Required, must be in the future |
| `hire_date` | Required, must be ≤ current date |

---

## Vehicles

### Entity Reference — `vehicles` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `registration_number` | VARCHAR(50) | NOT NULL, UNIQUE |
| `vin` | VARCHAR(50) | UNIQUE, optional |
| `make` | VARCHAR(100) | NOT NULL |
| `model` | VARCHAR(100) | NOT NULL |
| `year` | INTEGER | NOT NULL, 2000 ≤ year ≤ current+1 |
| `fuel_type` | ENUM(fuel_type) | NOT NULL |
| `seating_capacity` | INTEGER | NOT NULL, must be > 0 |
| `status` | ENUM(vehicle_status) | NOT NULL, DEFAULT 'available' |
| `current_odometer` | NUMERIC(10,2) | NOT NULL, DEFAULT 0, ≥ 0 |
| `insurance_expiry` | DATE | Optional |
| `registration_expiry` | DATE | Optional |
| `last_maintenance_date` | DATE | Optional |
| `next_maintenance_date` | DATE | Optional |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/vehicles` | Required | all authenticated |
| `GET` | `/vehicles/{id}` | Required | all authenticated |
| `POST` | `/vehicles` | Required | admin, fleet_manager |
| `PATCH` | `/vehicles/{id}` | Required | admin, fleet_manager |
| `DELETE` | `/vehicles/{id}` | Required | admin |
| `GET` | `/vehicles/{id}/trips` | Required | admin, fleet_manager, dispatcher |
| `GET` | `/vehicles/{id}/maintenance` | Required | admin, fleet_manager |
| `GET` | `/vehicles/{id}/fuel-logs` | Required | admin, fleet_manager |
| `GET` | `/vehicles/{id}/expenses` | Required | admin, fleet_manager |

### GET /vehicles

**Query Parameters:** `page`, `per_page`, `sort`, `filter[status]`, `filter[fuel_type]`, `filter[make]`, `q`

**Success Response (200):**

```json
{
    "data": [
        {
            "id": "uuid",
            "registration_number": "ABC-1234",
            "vin": "1HGCM82633A004352",
            "make": "Toyota",
            "model": "Hiace",
            "year": 2024,
            "fuel_type": "diesel",
            "seating_capacity": 14,
            "status": "available",
            "current_odometer": 15234.50,
            "insurance_expiry": "2026-12-31",
            "registration_expiry": "2026-10-15",
            "last_maintenance_date": "2026-06-01",
            "next_maintenance_date": "2026-09-01",
            "created_at": "2026-01-10T00:00:00Z",
            "updated_at": "2026-07-11T16:00:00Z"
        }
    ],
    "meta": { "page": 1, "per_page": 25, "total": 8, "total_pages": 1 }
}
```

### POST /vehicles

**Request Body:**

```json
{
    "registration_number": "ABC-1234",
    "vin": "1HGCM82633A004352",
    "make": "Toyota",
    "model": "Hiace",
    "year": 2024,
    "fuel_type": "diesel",
    "seating_capacity": 14,
    "insurance_expiry": "2026-12-31",
    "registration_expiry": "2026-10-15"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `registration_number` | Required, must be unique |
| `vin` | Optional, must be unique if provided |
| `make`, `model` | Required |
| `year` | Required, must be ≥ 2000 and ≤ next calendar year |
| `fuel_type` | Required, must be valid `fuel_type` ENUM value |
| `seating_capacity` | Required, must be > 0 |

---

## Trips

### Entity Reference — `trips` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `driver_id` | UUID | NOT NULL, FK → drivers (RESTRICT) |
| `vehicle_id` | UUID | NOT NULL, FK → vehicles (RESTRICT) |
| `status` | ENUM(trip_status) | NOT NULL, DEFAULT 'scheduled' |
| `origin` | VARCHAR(255) | NOT NULL |
| `destination` | VARCHAR(255) | NOT NULL |
| `estimated_distance_km` | NUMERIC(10,2) | Optional, ≥ 0 |
| `estimated_duration_minutes` | INTEGER | Optional, ≥ 0 |
| `scheduled_start` | TIMESTAMPTZ | NOT NULL |
| `scheduled_end` | TIMESTAMPTZ | NOT NULL, must be > scheduled_start |
| `actual_start` | TIMESTAMPTZ | Optional |
| `actual_end` | TIMESTAMPTZ | Optional, must be ≥ actual_start |
| `notes` | TEXT | Optional |
| `created_by` | UUID | FK → users (SET NULL) |
| `updated_by` | UUID | FK → users (SET NULL) |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/trips` | Required | admin, fleet_manager, dispatcher |
| `GET` | `/trips/{id}` | Required | admin, fleet_manager, dispatcher, driver (own) |
| `POST` | `/trips` | Required | admin, fleet_manager, dispatcher |
| `PATCH` | `/trips/{id}` | Required | admin, fleet_manager, dispatcher |
| `DELETE` | `/trips/{id}` | Required | admin |
| `PATCH` | `/trips/{id}/start` | Required | dispatcher, driver (own) |
| `PATCH` | `/trips/{id}/complete` | Required | dispatcher, driver (own) |
| `POST` | `/trips/{id}/fuel-logs` | Required | admin, fleet_manager, driver (own) |
| `POST` | `/trips/{id}/expenses` | Required | admin, fleet_manager, driver (own) |

### POST /trips

**Request Body:**

```json
{
    "driver_id": "550e8400-e29b-41d4-a716-446655440000",
    "vehicle_id": "550e8400-e29b-41d4-a716-446655440001",
    "origin": "Main Warehouse, 123 Industrial Blvd",
    "destination": "Downtown Depot, 456 Market St",
    "estimated_distance_km": 45.5,
    "estimated_duration_minutes": 90,
    "scheduled_start": "2026-07-13T08:00:00Z",
    "scheduled_end": "2026-07-13T09:30:00Z",
    "notes": "Priority delivery"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `driver_id` | Required, driver must exist, driver must be `available`, driver must not have overlapping active trips |
| `vehicle_id` | Required, vehicle must exist, vehicle must be `available`, vehicle must not have overlapping active trips |
| `origin`, `destination` | Required |
| `scheduled_start` | Required, must be in the future |
| `scheduled_end` | Required, must be after `scheduled_start` |
| `estimated_distance_km` | Optional, must be ≥ 0 if provided |
| `estimated_duration_minutes` | Optional, must be ≥ 0 if provided |

### PATCH /trips/{id}/start

**Request Body:**

```json
{
    "actual_start": "2026-07-13T08:05:00Z"
}
```

**Validation Rules:**

- Trip status must be `scheduled`
- `actual_start` must be provided
- Driver status automatically set to `on_trip`
- Vehicle status automatically set to `assigned`

### PATCH /trips/{id}/complete

**Request Body:**

```json
{
    "actual_end": "2026-07-13T09:45:00Z"
}
```

**Validation Rules:**

- Trip status must be `in_progress`
- `actual_end` must be provided, must be ≥ `actual_start`
- Driver status automatically set to `available`
- Vehicle status automatically set to `available`

---

## Maintenance Records

### Entity Reference — `maintenance_records` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `vehicle_id` | UUID | NOT NULL, FK → vehicles (CASCADE) |
| `type` | VARCHAR(100) | NOT NULL |
| `description` | TEXT | Optional |
| `status` | ENUM(maintenance_status) | NOT NULL, DEFAULT 'scheduled' |
| `scheduled_date` | DATE | NOT NULL |
| `completed_date` | DATE | Optional, must be ≥ scheduled_date |
| `cost` | NUMERIC(12,2) | Optional, ≥ 0 |
| `notes` | TEXT | Optional |
| `created_by` | UUID | FK → users (SET NULL) |
| `updated_by` | UUID | FK → users (SET NULL) |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/maintenance` | Required | admin, fleet_manager |
| `GET` | `/maintenance/{id}` | Required | admin, fleet_manager |
| `POST` | `/maintenance` | Required | admin, fleet_manager |
| `PATCH` | `/maintenance/{id}` | Required | admin, fleet_manager |
| `DELETE` | `/maintenance/{id}` | Required | admin |
| `PATCH` | `/maintenance/{id}/start` | Required | admin, fleet_manager |
| `PATCH` | `/maintenance/{id}/complete` | Required | admin, fleet_manager |

### POST /maintenance

**Request Body:**

```json
{
    "vehicle_id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "Oil Change",
    "description": "Full synthetic oil change and filter replacement",
    "scheduled_date": "2026-07-20",
    "notes": "Use 5W-30 oil"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `vehicle_id` | Required, must reference existing vehicle |
| `type` | Required |
| `scheduled_date` | Required |

### PATCH /maintenance/{id}/start

- Status must be `scheduled`
- Vehicle status set to `maintenance`

### PATCH /maintenance/{id}/complete

**Request Body:**

```json
{
    "completed_date": "2026-07-20",
    "cost": 145.50,
    "notes": "Completed on time"
}
```

- Status must be `in_progress`
- `completed_date` must be ≥ `scheduled_date`
- `cost` must be ≥ 0 if provided
- Vehicle status returns to `available` if no other active maintenance records exist

---

## Fuel Logs

### Entity Reference — `fuel_logs` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `vehicle_id` | UUID | NOT NULL, FK → vehicles (CASCADE) |
| `trip_id` | UUID | Optional, FK → trips (SET NULL) |
| `filled_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| `liters` | NUMERIC(10,2) | NOT NULL, must be > 0 |
| `cost_per_liter` | NUMERIC(8,2) | NOT NULL, ≥ 0 |
| `total_cost` | NUMERIC(12,2) | NOT NULL, ≥ 0 |
| `odometer_km` | NUMERIC(10,2) | NOT NULL, ≥ 0 |
| `notes` | TEXT | Optional |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/fuel-logs` | Required | admin, fleet_manager |
| `GET` | `/fuel-logs/{id}` | Required | admin, fleet_manager |
| `POST` | `/fuel-logs` | Required | admin, fleet_manager, driver |
| `PATCH` | `/fuel-logs/{id}` | Required | admin, fleet_manager |
| `DELETE` | `/fuel-logs/{id}` | Required | admin |

### POST /fuel-logs

**Request Body:**

```json
{
    "vehicle_id": "uuid",
    "trip_id": "uuid",
    "filled_at": "2026-07-12T14:30:00Z",
    "liters": 55.20,
    "cost_per_liter": 1.45,
    "total_cost": 80.04,
    "odometer_km": 45234.10,
    "notes": "Full tank at Shell station"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `vehicle_id` | Required |
| `liters` | Required, must be > 0 |
| `cost_per_liter` | Required, must be ≥ 0 |
| `total_cost` | Required, must be ≥ 0 |
| `odometer_km` | Required, must be ≥ 0 |

---

## Expenses

### Entity Reference — `expenses` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `vehicle_id` | UUID | NOT NULL, FK → vehicles (CASCADE) |
| `trip_id` | UUID | Optional, FK → trips (SET NULL) |
| `category` | ENUM(expense_category) | NOT NULL |
| `amount` | NUMERIC(12,2) | NOT NULL, ≥ 0 |
| `description` | TEXT | Optional |
| `expense_date` | DATE | NOT NULL |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/expenses` | Required | admin, fleet_manager |
| `GET` | `/expenses/{id}` | Required | admin, fleet_manager |
| `POST` | `/expenses` | Required | admin, fleet_manager, driver |
| `PATCH` | `/expenses/{id}` | Required | admin, fleet_manager |
| `DELETE` | `/expenses/{id}` | Required | admin |

### POST /expenses

**Request Body:**

```json
{
    "vehicle_id": "uuid",
    "trip_id": "uuid",
    "category": "toll",
    "amount": 15.00,
    "description": "Highway toll between Exit 42 and Exit 56",
    "expense_date": "2026-07-12"
}
```

**Validation Rules:**

| Field | Rule |
|---|---|
| `vehicle_id` | Required |
| `category` | Required, must be valid `expense_category`: `fuel`, `maintenance`, `toll`, `parking`, `repair`, `other` |
| `amount` | Required, must be ≥ 0 |
| `expense_date` | Required |

---

## Notifications

### Entity Reference — `notifications` table

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | NOT NULL, FK → users (CASCADE) |
| `title` | VARCHAR(255) | NOT NULL |
| `message` | TEXT | NOT NULL |
| `status` | ENUM(notification_status) | NOT NULL, DEFAULT 'unread' |

### Endpoints

| Method | URL | Auth | Roles |
|---|---|---|---|
| `GET` | `/notifications` | Required | all authenticated (own only) |
| `GET` | `/notifications/{id}` | Required | all authenticated (own only) |
| `PATCH` | `/notifications/{id}/read` | Required | all authenticated (own only) |
| `DELETE` | `/notifications/{id}` | Required | all authenticated (own only) |

### GET /notifications

**Query Parameters:** `page`, `per_page`, `filter[status]`

**Success Response (200):**

```json
{
    "data": [
        {
            "id": "uuid",
            "title": "Insurance Expiring Soon",
            "message": "Vehicle ABC-1234 insurance expires on 2026-12-31. Please renew.",
            "status": "unread",
            "created_at": "2026-07-12T06:00:00Z"
        }
    ],
    "meta": {
        "page": 1,
        "per_page": 25,
        "total": 3,
        "total_pages": 1,
        "unread_count": 2
    }
}
```

### PATCH /notifications/{id}/read

- Status must be `unread`
- Irreversible — once read, cannot revert to unread

---

## Rate Limiting

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

Default: **1000 requests per 15-minute window** per authenticated user.

---

## Common Headers

| Header | Required | Description |
|---|---|---|
| `Cookie` | Yes (protected endpoints) | Better Auth session cookie (set automatically by the browser) |
| `Content-Type` | Yes (for requests with body) | `application/json` |
| `Accept` | No | `application/json` (default) |
| `X-Request-Id` | No | Client-generated idempotency key |
| `X-Idempotency-Key` | No | Prevents duplicate POST requests (retry-safe) |
