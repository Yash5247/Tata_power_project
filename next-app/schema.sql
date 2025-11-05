-- Vercel Postgres schema
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
  temperature DOUBLE PRECISION,
  vibration DOUBLE PRECISION,
  pressure DOUBLE PRECISION,
  current DOUBLE PRECISION,
  ts TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id BIGSERIAL PRIMARY KEY,
  equipment_id TEXT REFERENCES equipment(id) ON DELETE CASCADE,
  failure_probability DOUBLE PRECISION,
  health_score DOUBLE PRECISION,
  ts TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  equipment_id TEXT REFERENCES equipment(id) ON DELETE SET NULL,
  severity TEXT CHECK (severity IN ('healthy','warning','critical')),
  message TEXT,
  ts TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_equipment_ts ON sensor_readings (equipment_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_equipment_ts ON predictions (equipment_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts (ts DESC);


