CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS refrigerators (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL,
  target_min_c NUMERIC NOT NULL DEFAULT 2, target_max_c NUMERIC NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY, refrigerator_id TEXT NOT NULL REFERENCES refrigerators(id) ON DELETE CASCADE,
  name TEXT NOT NULL, mac_address TEXT UNIQUE NOT NULL, last_seen_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sensors (
  id TEXT PRIMARY KEY, node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, model TEXT NOT NULL DEFAULT 'DHT22', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS telemetry (
  recorded_at TIMESTAMPTZ NOT NULL, sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  temperature_c NUMERIC NOT NULL, humidity_rh NUMERIC NOT NULL,
  PRIMARY KEY (sensor_id, recorded_at)
);
SELECT create_hypertable('telemetry', 'recorded_at', if_not_exists => TRUE);
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY, refrigerator_id TEXT NOT NULL REFERENCES refrigerators(id) ON DELETE CASCADE,
  sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE, severity TEXT NOT NULL,
  message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), acknowledged_at TIMESTAMPTZ
);
