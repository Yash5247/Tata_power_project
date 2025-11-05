// Vercel Postgres helper and CRUD operations
import { sql } from '@vercel/postgres';

// Tables:
// equipment(id TEXT PRIMARY KEY, name TEXT, location TEXT, created_at TIMESTAMPTZ DEFAULT now())
// sensor_readings(id BIGSERIAL PRIMARY KEY, equipment_id TEXT REFERENCES equipment(id),
//   temperature DOUBLE PRECISION, vibration DOUBLE PRECISION, pressure DOUBLE PRECISION, current DOUBLE PRECISION,
//   ts TIMESTAMPTZ DEFAULT now())
// predictions(id BIGSERIAL PRIMARY KEY, equipment_id TEXT REFERENCES equipment(id),
//   failure_probability DOUBLE PRECISION, health_score DOUBLE PRECISION, ts TIMESTAMPTZ DEFAULT now())
// alerts(id BIGSERIAL PRIMARY KEY, equipment_id TEXT REFERENCES equipment(id), severity TEXT, message TEXT, ts TIMESTAMPTZ DEFAULT now())

export async function createEquipment({ id, name, location }) {
  await sql`INSERT INTO equipment (id, name, location) VALUES (${id}, ${name}, ${location}) ON CONFLICT (id) DO NOTHING;`;
  return { id, name, location };
}

export async function getEquipment(id) {
  const { rows } = await sql`SELECT * FROM equipment WHERE id = ${id} LIMIT 1;`;
  return rows[0] || null;
}

export async function listEquipment() {
  const { rows } = await sql`SELECT * FROM equipment ORDER BY created_at DESC;`;
  return rows;
}

export async function upsertReading({ equipment_id, temperature, vibration, pressure, current, ts }) {
  const { rows } = await sql`
    INSERT INTO sensor_readings (equipment_id, temperature, vibration, pressure, current, ts)
    VALUES (${equipment_id}, ${temperature}, ${vibration}, ${pressure}, ${current}, ${ts || new Date()})
    RETURNING *;
  `;
  return rows[0];
}

export async function recentReadings({ equipment_id, limit = 100 }) {
  const { rows } = await sql`
    SELECT * FROM sensor_readings
    WHERE (${equipment_id} IS NULL) OR (equipment_id = ${equipment_id})
    ORDER BY ts DESC LIMIT ${limit};
  `;
  return rows;
}

export async function insertPrediction({ equipment_id, failure_probability, health_score, ts }) {
  const { rows } = await sql`
    INSERT INTO predictions (equipment_id, failure_probability, health_score, ts)
    VALUES (${equipment_id}, ${failure_probability}, ${health_score}, ${ts || new Date()})
    RETURNING *;
  `;
  return rows[0];
}

export async function listPredictions({ equipment_id, limit = 100 }) {
  const { rows } = await sql`
    SELECT * FROM predictions
    WHERE (${equipment_id} IS NULL) OR (equipment_id = ${equipment_id})
    ORDER BY ts DESC LIMIT ${limit};
  `;
  return rows;
}

export async function insertAlert({ equipment_id, severity, message, ts }) {
  const { rows } = await sql`
    INSERT INTO alerts (equipment_id, severity, message, ts)
    VALUES (${equipment_id}, ${severity}, ${message}, ${ts || new Date()})
    RETURNING *;
  `;
  return rows[0];
}

export async function listAlerts({ sinceMinutes = 1440 } = {}) {
  const { rows } = await sql`
    SELECT * FROM alerts WHERE ts >= now() - (${sinceMinutes}::text || ' minutes')::interval ORDER BY ts DESC;
  `;
  return rows;
}


