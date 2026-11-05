const { Pool } = require('pg');
const { DEFAULT_BILLING_SETTINGS } = require('./utils/billingSettings');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error));

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS businesses (
      id BIGSERIAL PRIMARY KEY,
      "ownerName" TEXT NOT NULL, "businessName" TEXT NOT NULL, category TEXT NOT NULL,
      address TEXT NOT NULL, location TEXT NOT NULL, phone TEXT NOT NULL, whatsapp TEXT NOT NULL,
      services JSONB NOT NULL DEFAULT '[]', "aboutBusness" TEXT NOT NULL, img TEXT NOT NULL,
      timing JSONB NOT NULL DEFAULT '{}', "locationLink" TEXT, status TEXT NOT NULL DEFAULT 'active',
      premium BOOLEAN NOT NULL DEFAULT FALSE, "avgRating" NUMERIC NOT NULL DEFAULT 0,
      "reviewCount" INTEGER NOT NULL DEFAULT 0, "expiryDate" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS businesses_category_location_idx ON businesses (category, location);
    ALTER TABLE businesses ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
    ALTER TABLE businesses ADD COLUMN IF NOT EXISTS delivery BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS businesses_payment_id_unique_idx ON businesses ("paymentId") WHERE "paymentId" IS NOT NULL;
    CREATE TABLE IF NOT EXISTS billing_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1), settings JSONB NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS billing_orders (
      "orderId" TEXT PRIMARY KEY, settings JSONB NOT NULL, "expectedAmountPaise" INTEGER NOT NULL,
      customer JSONB NOT NULL DEFAULT '{}', "businessDetails" JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE billing_orders ADD COLUMN IF NOT EXISTS customer JSONB NOT NULL DEFAULT '{}';
    ALTER TABLE billing_orders ADD COLUMN IF NOT EXISTS "businessDetails" JSONB;
    CREATE TABLE IF NOT EXISTS advertisement_orders (
      "orderId" TEXT PRIMARY KEY, "expectedAmountPaise" INTEGER NOT NULL,
      "durationDays" INTEGER NOT NULL CHECK ("durationDays" IN (15, 30)),
      details JSONB NOT NULL, "baseAmountPaise" INTEGER, settings JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE advertisement_orders ADD COLUMN IF NOT EXISTS "baseAmountPaise" INTEGER;
    ALTER TABLE advertisement_orders ADD COLUMN IF NOT EXISTS settings JSONB;
    CREATE TABLE IF NOT EXISTS payment_notifications (
      "paymentId" TEXT PRIMARY KEY, type TEXT NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS categories (
      id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, img TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS locations (
      id BIGSERIAL PRIMARY KEY, "locationName" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY, "businessId" BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      "userName" TEXT NOT NULL, rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS reviews_business_created_idx ON reviews ("businessId", "createdAt" DESC);
    CREATE TABLE IF NOT EXISTS advertisements (
      id BIGSERIAL PRIMARY KEY,
      "companyName" TEXT NOT NULL,
      place TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT NOT NULL,
      "coverPhoto" TEXT NOT NULL,
      description TEXT NOT NULL,
      "durationDays" INTEGER NOT NULL CHECK ("durationDays" IN (15, 30)),
      amount NUMERIC(12,2) NOT NULL,
      "paymentId" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "expiresAt" TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS advertisements_active_idx ON advertisements ("expiresAt", "createdAt" DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS advertisements_payment_id_unique_idx ON advertisements ("paymentId");
    ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_amount_check;
    ALTER TABLE advertisements ALTER COLUMN amount TYPE NUMERIC(12,2) USING amount::numeric;
  `);
  await pool.query(
    'INSERT INTO billing_settings (id, settings) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING',
    [JSON.stringify(DEFAULT_BILLING_SETTINGS)],
  );
}

module.exports = { pool, initializeDatabase };
