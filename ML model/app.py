from flask import Flask, jsonify, render_template, request
from typing import List, Dict, Any
from datetime import datetime 
import os
import numpy as np

from predictive_model import (
    load_trained_model,
    train_model,
    generate_data,
    predict_failure,
)
from database import init_db, insert_reading, insert_predictions, get_historical, cleanup_old, export_csv
from flask import Response


def create_app() -> Flask:
    app = Flask(__name__)

    # Load or create the ML model at startup
    model_path = os.path.join("data", "model.pkl")
    try:
        if not os.path.exists(model_path):
            train_model(save_path=model_path)
        trained_model = load_trained_model(model_path)
        app.config["TRAINED_MODEL"] = trained_model
    except Exception as exc:
        # Fallback: create a dummy model in memory so routes still respond
        trained_model = train_model()
        app.config["TRAINED_MODEL"] = trained_model

    # Initialize database
    try:
        init_db()
    except Exception:
        pass

    # Global CORS headers
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    # Error handling
    @app.errorhandler(Exception)
    def handle_exception(error):
        status = getattr(error, "code", 500)
        return jsonify({"error": str(error)}), status

    @app.route("/")
    def dashboard():
        try:
            # Simple KPI placeholders; these might come from DB in real app
            total = 120
            healthy = 95
            at_risk = 18
            critical = 7
            return render_template(
                "dashboard.html",
                total=total,
                healthy=healthy,
                at_risk=at_risk,
                critical=critical,
            )
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.route("/api/sensor-data")
    def api_sensor_data():
        try:
            # Generate a single recent reading from the synthetic generator
            df = generate_data(num_points=20, days=1)
            row = df.iloc[-1]
            payload = {
                "timestamp": row["timestamp"].isoformat(),
                "temperature": float(row["temperature"]),
                "vibration": float(row["vibration"]),
                "pressure": float(row["pressure"]),
                "current": float(row["current"]),
            }
            try:
                insert_reading(
                    payload["timestamp"],
                    payload["temperature"],
                    payload["vibration"],
                    payload["pressure"],
                    payload["current"],
                )
                cleanup_old(90)
            except Exception:
                pass
            return jsonify(payload)
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.route("/api/predictions")
    def api_predictions():
        try:
            trained = app.config.get("TRAINED_MODEL")
            # Simulate 15 equipment readings right now
            df = generate_data(num_points=15, days=1)
            X = df[["temperature", "vibration", "pressure", "current"]]
            result = predict_failure(trained, X)
            result["equipment_id"] = [f"EQ-{i:03d}" for i in range(1, len(result) + 1)]
            result["timestamp"] = datetime.utcnow().isoformat()
            records: List[Dict[str, Any]] = result[
                [
                    "equipment_id",
                    "timestamp",
                    "temperature",
                    "vibration",
                    "pressure",
                    "current",
                    "failure_probability",
                    "health_score",
                ]
            ].to_dict(orient="records")
            try:
                insert_predictions(records)
                cleanup_old(90)
            except Exception:
                pass
            return jsonify({"predictions": records})
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.route("/api/alerts")
    def api_alerts():
        try:
            # Use predictions to derive alerts (e.g., health_score < 60 or failure_prob > 0.4)
            trained = app.config.get("TRAINED_MODEL")
            df = generate_data(num_points=20, days=1)
            X = df[["temperature", "vibration", "pressure", "current"]]
            result = predict_failure(trained, X)
            result["equipment_id"] = [f"EQ-{i:03d}" for i in range(1, len(result) + 1)]
            alerts_df = result[(result["health_score"] < 60) | (result["failure_probability"] > 0.4)]
            alerts = [
                {
                    "equipment_id": r["equipment_id"],
                    "severity": "critical" if r["health_score"] < 40 or r["failure_probability"] > 0.6 else "warning",
                    "message": "High failure probability detected",
                    "health_score": float(r["health_score"]),
                    "failure_probability": float(r["failure_probability"]),
                    "timestamp": datetime.utcnow().isoformat(),
                }
                for _, r in alerts_df.iterrows()
            ]
            return jsonify({"alerts": alerts})
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    # Health endpoint remains
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "time": datetime.utcnow().isoformat()})

    @app.route("/api/historical/<int:days>")
    def api_historical(days: int):
        try:
            days = max(1, min(days, 90))
            data = get_historical(days)
            return jsonify(data)
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @app.route("/api/export/<int:days>")
    def api_export(days: int):
        try:
            days = max(1, min(days, 90))
            csv_data = export_csv(days)
            filename = f"export_{days}d.csv"
            return Response(
                csv_data,
                mimetype="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                },
            )
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(host="0.0.0.0", port=5000, debug=True)


