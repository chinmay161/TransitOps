-- =====================================================
-- TransitOps Database Schema
-- Odoo Hackathon 2026
-- PostgreSQL 16
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM (
    'admin',
    'fleet_manager',
    'dispatcher',
    'driver'
);

CREATE TYPE driver_status AS ENUM (
    'available',
    'on_trip',
    'on_leave',
    'inactive'
);

CREATE TYPE vehicle_status AS ENUM (
    'available',
    'assigned',
    'maintenance',
    'inactive'
);

CREATE TYPE trip_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE maintenance_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed'
);

CREATE TYPE fuel_type AS ENUM (
    'petrol',
    'diesel',
    'cng',
    'electric'
);

CREATE TYPE notification_status AS ENUM (
    'unread',
    'read'
);

CREATE TYPE expense_category AS ENUM (
    'fuel',
    'maintenance',
    'toll',
    'parking',
    'repair',
    'other'
);

-- =====================================================
-- USERS
-- =====================================================
-- Account creation flow:
--   Admin creates Fleet Managers (and other Admins).
--   Fleet Managers create Drivers and Dispatchers.
--   Every account is created by an existing authorized user (created_by FK).
--
-- Password workflow:
--   New accounts start with must_change_password = TRUE.
--   On first login, the user is forced to set a new password.
--   password_changed_at records when the password was last changed.
--   After a successful password change, must_change_password is set to FALSE.
-- =====================================================
CREATE TABLE users (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   VARCHAR(255)    NOT NULL,
    password_hash           TEXT            NOT NULL,
    full_name               VARCHAR(255)    NOT NULL,
    phone                   VARCHAR(50),
    role                    user_role       NOT NULL DEFAULT 'fleet_manager',
    must_change_password    BOOLEAN         NOT NULL DEFAULT TRUE,
    password_changed_at     TIMESTAMPTZ,
    is_active               BOOLEAN         NOT NULL DEFAULT true,
    last_login              TIMESTAMPTZ,
    created_by              UUID,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT ck_users_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-\(\)]{7,20}$')
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_created_by ON users (created_by);

-- =====================================================
-- DRIVERS
-- =====================================================
CREATE TABLE drivers (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID          NOT NULL,
    license_number      VARCHAR(100)  NOT NULL,
    license_expiry      DATE          NOT NULL,
    license_type        VARCHAR(50),
    status              driver_status NOT NULL DEFAULT 'available',
    emergency_contact   VARCHAR(255),
    emergency_phone     VARCHAR(50),
    hire_date           DATE          NOT NULL,
    -- fleet_manager_id links this driver/dispatcher to the Fleet Manager who created/manages them
    -- A driver or dispatcher cannot exist without a Fleet Manager (except pending users)
    fleet_manager_id    UUID,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_drivers_user_id UNIQUE (user_id),
    CONSTRAINT uq_drivers_license_number UNIQUE (license_number),
    CONSTRAINT fk_drivers_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_drivers_fleet_manager FOREIGN KEY (fleet_manager_id)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT ck_drivers_license_expiry CHECK (license_expiry > '1900-01-01'),
    CONSTRAINT ck_drivers_hire_date CHECK (hire_date <= CURRENT_DATE),
    CONSTRAINT ck_drivers_emergency_phone CHECK (emergency_phone IS NULL OR emergency_phone ~ '^\+?[0-9\s\-\(\)]{7,20}$')
);

CREATE INDEX idx_drivers_status ON drivers (status);
CREATE INDEX idx_drivers_fleet_manager_id ON drivers (fleet_manager_id);

-- =====================================================
-- VEHICLES
-- =====================================================
CREATE TABLE vehicles (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number     VARCHAR(50)     NOT NULL,
    vin                     VARCHAR(50),
    make                    VARCHAR(100)    NOT NULL,
    model                   VARCHAR(100)    NOT NULL,
    year                    INTEGER         NOT NULL,
    fuel_type               fuel_type       NOT NULL,
    seating_capacity        INTEGER         NOT NULL,
    status                  vehicle_status  NOT NULL DEFAULT 'available',
    current_odometer        NUMERIC(10,2)   NOT NULL DEFAULT 0,
    insurance_expiry        DATE,
    registration_expiry     DATE,
    last_maintenance_date   DATE,
    next_maintenance_date   DATE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT uq_vehicles_registration_number UNIQUE (registration_number),
    CONSTRAINT uq_vehicles_vin UNIQUE (vin),
    CONSTRAINT ck_vehicles_year CHECK (year >= 2000 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    CONSTRAINT ck_vehicles_seating_capacity CHECK (seating_capacity > 0),
    CONSTRAINT ck_vehicles_current_odometer CHECK (current_odometer >= 0)
);

CREATE INDEX idx_vehicles_status ON vehicles (status);
CREATE INDEX idx_vehicles_fuel_type ON vehicles (fuel_type);
CREATE INDEX idx_vehicles_next_maintenance ON vehicles (next_maintenance_date)
    WHERE status != 'inactive';

-- =====================================================
-- TRIPS
-- =====================================================
CREATE TABLE trips (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id       UUID            NOT NULL,
    vehicle_id      UUID            NOT NULL,
    status          trip_status     NOT NULL DEFAULT 'scheduled',
    origin          VARCHAR(255)    NOT NULL,
    destination     VARCHAR(255)    NOT NULL,
    estimated_distance_km        NUMERIC(10,2),
    estimated_duration_minutes   INTEGER,
    scheduled_start TIMESTAMPTZ     NOT NULL,
    scheduled_end   TIMESTAMPTZ     NOT NULL,
    actual_start    TIMESTAMPTZ,
    actual_end      TIMESTAMPTZ,
    notes           TEXT,
    created_by      UUID,
    updated_by      UUID,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id)
        REFERENCES drivers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_trips_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_trips_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_trips_updated_by FOREIGN KEY (updated_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT ck_trips_scheduled_end CHECK (scheduled_end > scheduled_start),
    CONSTRAINT ck_trips_estimated_distance CHECK (estimated_distance_km IS NULL OR estimated_distance_km >= 0),
    CONSTRAINT ck_trips_estimated_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0),
    CONSTRAINT ck_trips_actual_times CHECK (
        (actual_start IS NULL AND actual_end IS NULL) OR
        (actual_start IS NOT NULL AND actual_end IS NULL) OR
        (actual_start IS NOT NULL AND actual_end IS NOT NULL AND actual_end >= actual_start)
    )
);

CREATE INDEX idx_trips_driver_id ON trips (driver_id);
CREATE INDEX idx_trips_vehicle_id ON trips (vehicle_id);
CREATE INDEX idx_trips_status ON trips (status);
CREATE INDEX idx_trips_scheduled_start ON trips (scheduled_start);
CREATE INDEX idx_trips_driver_schedule ON trips (driver_id, scheduled_start)
    WHERE status IN ('scheduled', 'in_progress');

-- =====================================================
-- MAINTENANCE RECORDS
-- =====================================================
CREATE TABLE maintenance_records (
    id                UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id        UUID                 NOT NULL,
    type              VARCHAR(100)         NOT NULL,
    description       TEXT,
    status            maintenance_status   NOT NULL DEFAULT 'scheduled',
    scheduled_date    DATE                 NOT NULL,
    completed_date    DATE,
    cost              NUMERIC(12,2),
    notes             TEXT,
    created_by        UUID,
    updated_by        UUID,
    created_at        TIMESTAMPTZ          NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ          NOT NULL DEFAULT now(),

    CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_updated_by FOREIGN KEY (updated_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT ck_maintenance_cost CHECK (cost IS NULL OR cost >= 0),
    CONSTRAINT ck_maintenance_completed_date CHECK (
        completed_date IS NULL OR completed_date >= scheduled_date
    )
);

CREATE INDEX idx_maintenance_vehicle_id ON maintenance_records (vehicle_id);
CREATE INDEX idx_maintenance_status ON maintenance_records (status);
CREATE INDEX idx_maintenance_scheduled_date ON maintenance_records (scheduled_date);
CREATE INDEX idx_maintenance_upcoming ON maintenance_records (vehicle_id, scheduled_date)
    WHERE status IN ('scheduled', 'in_progress');

-- =====================================================
-- FUEL LOGS
-- =====================================================
CREATE TABLE fuel_logs (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID            NOT NULL,
    trip_id         UUID,
    filled_at       TIMESTAMPTZ     NOT NULL DEFAULT now(),
    liters          NUMERIC(10,2)   NOT NULL,
    cost_per_liter  NUMERIC(8,2)    NOT NULL,
    total_cost      NUMERIC(12,2)   NOT NULL,
    odometer_km     NUMERIC(10,2)   NOT NULL,
    notes           TEXT,
    created_by      UUID,
    updated_by      UUID,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT fk_fuel_logs_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_fuel_logs_trip FOREIGN KEY (trip_id)
        REFERENCES trips (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_fuel_logs_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_fuel_logs_updated_by FOREIGN KEY (updated_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT ck_fuel_logs_liters CHECK (liters > 0),
    CONSTRAINT ck_fuel_logs_cost_per_liter CHECK (cost_per_liter >= 0),
    CONSTRAINT ck_fuel_logs_total_cost CHECK (total_cost >= 0),
    CONSTRAINT ck_fuel_logs_odometer CHECK (odometer_km >= 0)
);

CREATE INDEX idx_fuel_logs_vehicle_id ON fuel_logs (vehicle_id);
CREATE INDEX idx_fuel_logs_trip_id ON fuel_logs (trip_id);
CREATE INDEX idx_fuel_logs_filled_at ON fuel_logs (filled_at);

-- =====================================================
-- EXPENSES
-- =====================================================
CREATE TABLE expenses (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      UUID            NOT NULL,
    trip_id         UUID,
    category        expense_category NOT NULL,
    amount          NUMERIC(12,2)   NOT NULL,
    description     TEXT,
    expense_date    DATE            NOT NULL,
    created_by      UUID,
    updated_by      UUID,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT fk_expenses_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id)
        REFERENCES trips (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_updated_by FOREIGN KEY (updated_by)
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT ck_expenses_amount CHECK (amount >= 0)
);

CREATE INDEX idx_expenses_vehicle_id ON expenses (vehicle_id);
CREATE INDEX idx_expenses_trip_id ON expenses (trip_id);
CREATE INDEX idx_expenses_expense_date ON expenses (expense_date);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
    id          UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID                    NOT NULL,
    title       VARCHAR(255)            NOT NULL,
    message     TEXT                    NOT NULL,
    status      notification_status     NOT NULL DEFAULT 'unread',
    created_at  TIMESTAMPTZ             NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ             NOT NULL DEFAULT now(),

    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_status ON notifications (status);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at DESC)
    WHERE status = 'unread';
