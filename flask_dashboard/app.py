from flask import Flask, jsonify, render_template, request
from typing import Any, Dict
import os
import json
from datetime import datetime
import importlib.util

app = Flask(__name__)


# ------------------------------------------------------------
# CORS headers for all responses
# ------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


# ------------------------------------------------------------
# Load predictive_model dynamically from ML model/predictive_model.py
# ------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRED_MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "ML model", "predictive_model.py"))

predictive_model = None
if os.path.exists(PRED_MODEL_PATH):
    spec = importlib.util.spec_from_file_location("predictive_model", PRED_MODEL_PATH)
    if spec and spec.loader:
        predictive_model = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(predictive_model)  # type: ignore[attr-defined]


# ------------------------------------------------------------
# Initialize / load trained model
# ------------------------------------------------------------
MODEL_FILE = os.path.join(BASE_DIR, "data", "model.pkl")
os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)

TRAINED_MODEL = None
if predictive_model:
    try:
        if os.path.exists(MODEL_FILE):
            TRAINED_MODEL = predictive_model.load_trained_model(MODEL_FILE)
        else:
            TRAINED_MODEL = predictive_model.train_model(save_path=MODEL_FILE)
    except Exception:
        # As a fallback, try training in-memory
        try:
            TRAINED_MODEL = predictive_model.train_model(save_path=MODEL_FILE)
        except Exception:
            TRAINED_MODEL = None


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
def _ok(data: Dict[str, Any]):
    return jsonify(data)


def _error(message: str, status: int = 500):
    return jsonify({"error": message}), status


# ------------------------------------------------------------
# Routes
# ------------------------------------------------------------
@app.route("/")
def dashboard():
    # Sample KPI data (could be computed from DB in a real app)
    kpis = {
        "total": 120,
        "healthy": 95,
        "risk": 18,
        "critical": 7,
    }
    return render_template("dashboard.html", **kpis)


@app.route("/api/sensor-data", methods=["GET", "OPTIONS"])
def api_sensor_data():
    if request.method == "OPTIONS":
        return _ok({"ok": True})
    try:
        if predictive_model:
            df = predictive_model.generate_data(num_points=1, days=1)
            row = df.iloc[0]
            data = {
                "timestamp": row["timestamp"].isoformat() if hasattr(row["timestamp"], "isoformat") else str(row["timestamp"]),
                "temperature": float(row["temperature"]),
                "vibration": float(row["vibration"]),
                "pressure": float(row["pressure"]),
                "current": float(row["current"]),
            }
        else:
            # Fallback synthetic values
            data = {
                "timestamp": datetime.utcnow().isoformat(),
                "temperature": 65.0,
                "vibration": 2.4,
                "pressure": 5.2,
                "current": 108.0,
            }
        return _ok(data)
    except Exception as exc:
        return _error(str(exc), 500)


@app.route("/api/predictions", methods=["POST", "OPTIONS"])
def api_predictions():
    if request.method == "OPTIONS":
        return _ok({"ok": True})
    try:
        payload = request.get_json(silent=True) or {}
        metrics = {
            "temperature": float(payload.get("temperature", 65.0)),
            "vibration": float(payload.get("vibration", 2.4)),
            "pressure": float(payload.get("pressure", 5.2)),
            "current": float(payload.get("current", 108.0)),
        }

        if predictive_model and TRAINED_MODEL is not None:
            import pandas as pd  # local import to avoid hard dependency in absence of module
            X = pd.DataFrame([metrics])
            pred_df = predictive_model.predict_failure(TRAINED_MODEL, X)
            failure_prob = float(pred_df["failure_probability"].iloc[0])
            health_score = float(pred_df["health_score"].iloc[0])
        else:
            # Fallback heuristic
            failure_prob = 0.2
            health_score = 80.0

        status = "critical" if failure_prob >= 0.7 else ("warning" if failure_prob >= 0.4 else "healthy")
        return _ok({
            "metrics": metrics,
            "failure_probability": failure_prob,
            "health_score": health_score,
            "status": status,
        })
    except Exception as exc:
        return _error(str(exc), 400)


@app.route("/api/alerts", methods=["GET", "OPTIONS"])
def api_alerts():
    if request.method == "OPTIONS":
        return _ok({"ok": True})
    try:
        # Example: construct alerts. In production, derive from DB/model outputs
        alerts = [
            {"id": 1, "equipment": "Transformer T-42", "severity": "critical", "message": "Overheat and high vibration detected", "time": datetime.utcnow().isoformat()},
            {"id": 2, "equipment": "Turbine G-7", "severity": "warning", "message": "Pressure drop noted", "time": datetime.utcnow().isoformat()},
        ]
        return _ok({"alerts": alerts})
    except Exception as exc:
        return _error(str(exc), 500)


# ------------------------------------------------------------
# Global error handler
# ------------------------------------------------------------
@app.errorhandler(Exception)
def handle_exception(error: Exception):
    return _error(str(error), 500)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


