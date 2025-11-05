import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Iterable, List, Tuple, Dict, Any

DB_PATH = os.path.join("data", "app.db")


def _ensure_dir(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)


@contextmanager
def get_conn():
    _ensure_dir(DB_PATH)
    conn = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS sensor_readings (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ts TEXT NOT NULL,
              temperature REAL,
              vibration REAL,
              pressure REAL,
              current REAL
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ts TEXT NOT NULL,
              equipment_id TEXT NOT NULL,
              temperature REAL,
              vibration REAL,
              pressure REAL,
              current REAL,
              failure_probability REAL,
              health_score REAL
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS maintenance_records (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              equipment_id TEXT NOT NULL,
              action TEXT NOT NULL,
              notes TEXT,
              ts TEXT NOT NULL
            )
            """
        )


def insert_reading(ts: str, temperature: float, vibration: float, pressure: float, current: float) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO sensor_readings (ts, temperature, vibration, pressure, current) VALUES (?, ?, ?, ?, ?)",
            (ts, temperature, vibration, pressure, current),
        )


def insert_predictions(records: Iterable[Dict[str, Any]]) -> None:
    with get_conn() as conn:
        conn.executemany(
            """
            INSERT INTO predictions (
              ts, equipment_id, temperature, vibration, pressure, current, failure_probability, health_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    r["timestamp"],
                    r["equipment_id"],
                    r["temperature"],
                    r["vibration"],
                    r["pressure"],
                    r["current"],
                    r["failure_probability"],
                    r["health_score"],
                )
                for r in records
            ],
        )


def insert_maintenance(equipment_id: str, action: str, notes: str = "") -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO maintenance_records (equipment_id, action, notes, ts) VALUES (?, ?, ?, ?)",
            (equipment_id, action, notes, datetime.utcnow().isoformat()),
        )


def get_historical(days: int) -> Dict[str, List[Dict[str, Any]]]:
    cutoff = datetime.utcnow() - timedelta(days=days)
    with get_conn() as conn:
        cur = conn.cursor()
        # Sensor readings
        cur.execute(
            "SELECT ts, temperature, vibration, pressure, current FROM sensor_readings WHERE ts >= ? ORDER BY ts ASC",
            (cutoff.isoformat(),),
        )
        readings = [dict(row) for row in cur.fetchall()]

        # Latest predictions per equipment within window
        cur.execute(
            """
            SELECT p.* FROM predictions p
            WHERE ts >= ?
            ORDER BY ts ASC
            """,
            (cutoff.isoformat(),),
        )
        preds = [dict(row) for row in cur.fetchall()]

    return {"readings": readings, "predictions": preds}


def cleanup_old(days: int = 90) -> None:
    cutoff = datetime.utcnow() - timedelta(days=days)
    with get_conn() as conn:
        conn.execute("DELETE FROM sensor_readings WHERE ts < ?", (cutoff.isoformat(),))
        conn.execute("DELETE FROM predictions WHERE ts < ?", (cutoff.isoformat(),))


def export_csv(days: int) -> str:
    import csv
    from io import StringIO

    data = get_historical(days)
    buf = StringIO()
    writer = csv.writer(buf)
    writer.writerow(["type", "ts", "equipment_id", "temperature", "vibration", "pressure", "current", "failure_probability", "health_score"]) 
    for r in data["readings"]:
        writer.writerow(["reading", r["ts"], "", r["temperature"], r["vibration"], r["pressure"], r["current"], "", ""])
    for p in data["predictions"]:
        writer.writerow(["prediction", p["ts"], p["equipment_id"], p["temperature"], p["vibration"], p["pressure"], p["current"], p["failure_probability"], p["health_score"]])
    return buf.getvalue()


