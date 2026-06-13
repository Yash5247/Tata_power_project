"""
Generate predictions for equipment using the trained ML model.
Outputs JSON for dashboard integration.
"""
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from ml.config import DATA_DIR, FAILURE_TYPE_COLS, MODELS_DIR
from ml.preprocessing import load_dataset
from ml.recommendation import (
    get_health_score,
    get_maintenance_recommendation,
    get_risk_category,
    map_status,
)


def ai4i_to_dashboard_sensors(row: pd.Series) -> dict:
    """Map AI4I sensor readings to dashboard-compatible sensor format."""
    air_temp_c = row["Air temperature [K]"] - 273.15
    process_temp_c = row["Process temperature [K]"] - 273.15
    temp_delta = process_temp_c - air_temp_c

    return {
        "temperature": round(process_temp_c, 1),
        "vibration": round(row["Rotational speed [rpm]"] / 500, 2),
        "pressure": round(row["Torque [Nm]"] * 2.5, 1),
        "current": round(row["Tool wear [min]"] / 5 + 8, 2),
        "airTemperature": round(air_temp_c, 1),
        "rotationalSpeed": int(row["Rotational speed [rpm]"]),
        "torque": round(row["Torque [Nm]"], 1),
        "toolWear": int(row["Tool wear [min]"]),
        "tempDelta": round(temp_delta, 1),
        "timestamp": datetime.now().isoformat(),
    }


def predict_single(model, features: dict) -> dict:
    """Predict failure for a single equipment record."""
    df = pd.DataFrame([features])
    prob = float(model.predict_proba(df)[0][1])
    pred = int(model.predict(df)[0])

    failure_types = {col: int(features.get(col, 0)) for col in FAILURE_TYPE_COLS if col in features}
    recommendation = get_maintenance_recommendation(prob, failure_types)

    return {
        "failure_prediction": pred,
        "failure_probability": round(prob * 100, 1),
        "risk_score": round(prob * 100, 1),
        "health_score": get_health_score(prob),
        "risk_category": get_risk_category(prob),
        "status": map_status(get_risk_category(prob)),
        "recommendation": recommendation,
    }


def generate_equipment_predictions(count: int = 24, model_path: Path | None = None) -> dict:
    """Generate predictions for dashboard equipment from AI4I dataset samples."""
    model_path = model_path or MODELS_DIR / "best_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}. Run train.py first.")

    model = joblib.load(model_path)
    df = load_dataset()

    feature_cols = [
        "Air temperature [K]", "Process temperature [K]",
        "Rotational speed [rpm]", "Torque [Nm]", "Tool wear [min]", "Type",
    ]

    # Stratified sample: mix of failures and non-failures
    failures = df[df["Machine failure"] == 1]
    healthy = df[df["Machine failure"] == 0]
    n_failures = min(count // 6, len(failures))
    n_healthy = count - n_failures

    samples = pd.concat([
        failures.sample(n=n_failures, random_state=42) if n_failures > 0 else pd.DataFrame(),
        healthy.sample(n=n_healthy, random_state=42),
    ]).reset_index(drop=True)

    equipment = []
    for i, (_, row) in enumerate(samples.iterrows()):
        features = {col: row[col] for col in feature_cols}
        prediction = predict_single(model, features)

        failure_types = {col: int(row[col]) for col in FAILURE_TYPE_COLS}
        rec = prediction["recommendation"]

        next_maintenance = None
        if rec["schedule_days"] < 90:
            next_maintenance = (datetime.now() + timedelta(days=rec["schedule_days"])).isoformat()

        equipment.append({
            "equipmentId": f"EQ-{i + 1}",
            "productId": row.get("Product ID", f"P{i + 1}"),
            "type": row["Type"],
            "healthScore": prediction["health_score"],
            "failureProbability": prediction["failure_probability"],
            "riskScore": prediction["risk_score"],
            "riskCategory": prediction["risk_category"],
            "status": prediction["status"],
            "failurePrediction": prediction["failure_prediction"],
            "nextMaintenance": next_maintenance,
            "maintenanceAction": rec["action"],
            "maintenancePriority": rec["priority"],
            "maintenanceDescription": rec["description"],
            "sensorData": ai4i_to_dashboard_sensors(row),
            "failureTypes": failure_types,
            "actualFailure": int(row["Machine failure"]),
        })

    return {
        "generated_at": datetime.now().isoformat(),
        "equipment_count": len(equipment),
        "equipment": equipment,
    }


def generate_alerts(equipment: list) -> dict:
    """Generate alerts from equipment predictions."""
    alerts = []
    for eq in equipment:
        if eq["riskCategory"] in ("High Risk", "Critical"):
            alerts.append({
                "id": f"alert-{eq['equipmentId']}",
                "equipmentId": eq["equipmentId"],
                "type": "critical" if eq["riskCategory"] == "Critical" else "warning",
                "message": f"{eq['equipmentId']}: {eq['maintenanceDescription']}",
                "timestamp": datetime.now().isoformat(),
                "riskCategory": eq["riskCategory"],
            })
        elif eq["riskCategory"] == "Medium Risk" and eq["failureProbability"] > 30:
            alerts.append({
                "id": f"alert-{eq['equipmentId']}",
                "equipmentId": eq["equipmentId"],
                "type": "warning",
                "message": f"{eq['equipmentId']}: Elevated failure risk ({eq['failureProbability']}%)",
                "timestamp": datetime.now().isoformat(),
                "riskCategory": eq["riskCategory"],
            })

    return {
        "alerts": sorted(alerts, key=lambda x: x["type"] == "critical", reverse=True),
        "criticalCount": sum(1 for a in alerts if a["type"] == "critical"),
        "warningCount": sum(1 for a in alerts if a["type"] == "warning"),
        "totalCount": len(alerts),
    }


def main():
    output_dir = DATA_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    predictions = generate_equipment_predictions()
    alerts = generate_alerts(predictions["equipment"])

    pred_path = output_dir / "equipment_predictions.json"
    alert_path = output_dir / "alerts.json"

    with open(pred_path, "w") as f:
        json.dump(predictions, f, indent=2)
    with open(alert_path, "w") as f:
        json.dump(alerts, f, indent=2)

    print(f"Predictions saved to {pred_path}")
    print(f"Alerts saved to {alert_path}")
    print(f"Equipment: {predictions['equipment_count']}")
    print(f"Critical alerts: {alerts['criticalCount']}, Warnings: {alerts['warningCount']}")

    if len(sys.argv) > 1 and sys.argv[1] == "--stdout":
        print(json.dumps(predictions))


if __name__ == "__main__":
    main()
