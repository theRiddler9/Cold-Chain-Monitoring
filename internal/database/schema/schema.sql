CREATE EXTENSION IF NOT EXISTS timescaledb;

DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS telemetry CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS refrigerators CASCADE;

-- Organizations & Sites
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products & Batches
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_min_c NUMERIC NOT NULL,
  target_max_c NUMERIC NOT NULL,
  freeze_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  stability_budget_mins INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  lot TEXT NOT NULL,
  expiry DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipments & Logistics
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  status TEXT NOT NULL, -- PENDING, IN_TRANSIT, DELIVERED, QUARANTINED
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hardware & Devices (Units and Tags/Hubs)
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- TRUCK, FRIDGE, DEPOT
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- TAG, HUB
  mac_address TEXT UNIQUE NOT NULL,
  public_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS device_assignments (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  shipment_id TEXT REFERENCES shipments(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telemetry (TimescaleDB)
CREATE TABLE IF NOT EXISTS telemetry (
  recorded_at TIMESTAMPTZ NOT NULL,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  temp_cK INTEGER NOT NULL,
  tmin_cK INTEGER NOT NULL,
  tmax_cK INTEGER NOT NULL,
  humidity_rh INTEGER NOT NULL,
  vbat_mV INTEGER NOT NULL,
  flags INTEGER NOT NULL DEFAULT 0,
  prev_hash TEXT,
  signature TEXT,
  PRIMARY KEY (device_id, recorded_at)
);

SELECT create_hypertable('telemetry', 'recorded_at', if_not_exists => TRUE);

-- Excursions & Quality Assurance
CREATE TABLE IF NOT EXISTS excursions (
  id TEXT PRIMARY KEY,
  unit_id TEXT REFERENCES units(id),
  device_id TEXT REFERENCES devices(id),
  status TEXT NOT NULL, -- NORMAL, WARNING, LATCHED, DISPOSITIONED
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  peak_temp NUMERIC,
  duration_mins INT,
  cause TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispositions (
  id TEXT PRIMARY KEY,
  excursion_id TEXT NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- RELEASE, CONDEMN, RETEST
  signed_by TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ
);
