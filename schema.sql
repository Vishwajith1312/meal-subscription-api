-- ============================================================
-- Meal Subscription Plan - PostgreSQL Schema
-- ============================================================

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plan_meals CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Addresses (a user can have multiple delivery addresses)
-- ------------------------------------------------------------
CREATE TABLE addresses (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    line1           VARCHAR(200) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    zip_code        VARCHAR(20) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE
);

-- ------------------------------------------------------------
-- Meal Plans (e.g. "Veg Weekly", "Keto Monthly")
-- ------------------------------------------------------------
CREATE TABLE meal_plans (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price           NUMERIC(10,2) NOT NULL,
    meals_per_week  INTEGER NOT NULL,
    category        VARCHAR(50) NOT NULL,  -- veg / non-veg / vegan / keto ...
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- Meals (individual dishes that can appear in plans)
-- ------------------------------------------------------------
CREATE TABLE meals (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    calories        INTEGER,
    price           NUMERIC(10,2) NOT NULL,
    meal_type       VARCHAR(20) NOT NULL   -- breakfast / lunch / dinner / snack
);

-- ------------------------------------------------------------
-- Plan <-> Meal junction (which meals appear in a plan, on which day)
-- ------------------------------------------------------------
CREATE TABLE plan_meals (
    id              SERIAL PRIMARY KEY,
    plan_id         INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    meal_id         INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    day_of_week     VARCHAR(10) NOT NULL,  -- Monday ... Sunday
    UNIQUE (plan_id, meal_id, day_of_week)
);

-- ------------------------------------------------------------
-- Subscriptions (a user's active/past subscription to a plan)
-- ------------------------------------------------------------
CREATE TABLE subscriptions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id         INTEGER NOT NULL REFERENCES meal_plans(id),
    address_id      INTEGER NOT NULL REFERENCES addresses(id),
    start_date      DATE NOT NULL,
    end_date        DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active', -- active/paused/cancelled/completed
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Deliveries (one row per meal delivered under a subscription)
-- ------------------------------------------------------------
CREATE TABLE deliveries (
    id              SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    meal_id         INTEGER NOT NULL REFERENCES meals(id),
    delivery_date   DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'scheduled' -- scheduled/delivered/skipped/failed
);

-- ------------------------------------------------------------
-- Payments (billing events tied to a subscription)
-- ------------------------------------------------------------
CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL,
    payment_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    method          VARCHAR(30),           -- card/upi/netbanking
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' -- pending/success/failed/refunded
);

-- ------------------------------------------------------------
-- Reviews (users rate meals they've received)
-- ------------------------------------------------------------
CREATE TABLE reviews (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_id         INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Helpful indexes
-- ------------------------------------------------------------
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_deliveries_subscription ON deliveries(subscription_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_reviews_meal ON reviews(meal_id);
CREATE INDEX idx_plan_meals_plan ON plan_meals(plan_id);
