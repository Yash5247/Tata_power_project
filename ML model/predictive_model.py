from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable, List, Tuple

import numpy as np
import pandas as pd
from joblib import dump, load
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


FEATURE_COLUMNS: List[str] = [
    "temperature",  # degrees C
    "vibration",    # mm/s
    "pressure",     # bar
    "current",      # A
]


@dataclass
class TrainedModel:
    model: RandomForestClassifier
    feature_columns: List[str]


def generate_data(
    num_points: int = 1000,
    days: int = 30,
    anomaly_rate: float = 0.05,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Generate synthetic sensor data for energy equipment with labeled failures.

    The data simulates daily cycles and trends, plus random noise and anomalies.

    Columns:
      - timestamp
      - temperature, vibration, pressure, current
      - failure (0/1)
    """
    rng = np.random.default_rng(random_state)

    start_time = datetime.now() - timedelta(days=days)
    timestamps = [start_time + timedelta(minutes=(i * (days * 24 * 60) / num_points)) for i in range(num_points)]

    # Base signals with diurnal cycles and slight drift
    t = np.linspace(0.0, 2.0 * np.pi * (num_points / (24 * 6)), num_points)
    temperature = 60 + 5 * np.sin(t) + rng.normal(0, 0.8, num_points)
    vibration = 2.0 + 0.6 * np.sin(t / 2) + rng.normal(0, 0.15, num_points)
    pressure = 12 + 1.0 * np.cos(t / 3) + rng.normal(0, 0.25, num_points)
    current = 110 + 8 * np.sin(t / 1.5) + rng.normal(0, 1.8, num_points)

    # Inject anomalies in a subset of points to represent impending failures
    num_anomalies = int(max(1, np.floor(anomaly_rate * num_points)))
    anomaly_indices = rng.choice(num_points, size=num_anomalies, replace=False)

    temperature[anomaly_indices] += rng.normal(10, 2.0, num_anomalies)
    vibration[anomaly_indices] += rng.normal(1.5, 0.3, num_anomalies)
    pressure[anomaly_indices] -= rng.normal(2.5, 0.6, num_anomalies)
    current[anomaly_indices] += rng.normal(15, 3.0, num_anomalies)

    # Failure labels: higher probability around anomalies, low base rate otherwise
    base_logit = -3.2  # ~4% baseline
    risk_score = (
        0.08 * (temperature - np.median(temperature))
        + 0.9 * (vibration - np.median(vibration))
        - 0.12 * (pressure - np.median(pressure))
        + 0.04 * (current - np.median(current))
    )
    logit = base_logit + risk_score

    # Increase failure odds strongly for anomaly points
    logit[anomaly_indices] += 2.5

    prob_fail = 1.0 / (1.0 + np.exp(-logit))
    failures = (rng.uniform(0, 1, num_points) < prob_fail).astype(int)

    df = pd.DataFrame(
        {
            "timestamp": timestamps,
            "temperature": temperature,
            "vibration": vibration,
            "pressure": pressure,
            "current": current,
            "failure": failures,
        }
    )

    # Ensure approximate failure rate near requested anomaly influence
    return df.sort_values("timestamp").reset_index(drop=True)


def _ensure_dataframe(X: Iterable) -> pd.DataFrame:
    if isinstance(X, pd.DataFrame):
        # Reorder/select expected columns; missing columns raise KeyError
        return X.loc[:, FEATURE_COLUMNS]
    # Attempt to coerce from array-like
    X_df = pd.DataFrame(X, columns=FEATURE_COLUMNS)
    return X_df


def train_model(
    df: pd.DataFrame | None = None,
    save_path: str = os.path.join("data", "model.pkl"),
    random_state: int = 42,
    n_estimators: int = 200,
    max_depth: int | None = None,
) -> TrainedModel:
    """
    Train a RandomForest classifier for failure prediction and save it to disk.
    If df is None, synthetic data is generated.
    """
    if df is None:
        df = generate_data(random_state=random_state)

    X = df[FEATURE_COLUMNS]
    y = df["failure"].astype(int)

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=random_state
    )

    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=random_state,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )
    model.fit(X_train, y_train)

    # Persist model
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    dump({"model": model, "features": FEATURE_COLUMNS}, save_path)

    return TrainedModel(model=model, feature_columns=FEATURE_COLUMNS)


def load_trained_model(path: str = os.path.join("data", "model.pkl")) -> TrainedModel:
    obj = load(path)
    model: RandomForestClassifier = obj["model"]
    features: List[str] = list(obj["features"])  # type: ignore[assignment]
    return TrainedModel(model=model, feature_columns=features)


def predict_failure(
    model: RandomForestClassifier | TrainedModel,
    X: Iterable,
) -> pd.DataFrame:
    """
    Return failure probabilities and health scores (0-100, higher is healthier).

    Input X can be a DataFrame with feature columns or array-like in the order
    of FEATURE_COLUMNS.
    """
    if isinstance(model, TrainedModel):
        clf = model.model
    else:
        clf = model

    X_df = _ensure_dataframe(X)
    proba = clf.predict_proba(X_df)  # shape (n, 2) -> [:, 1] is failure prob
    failure_prob = proba[:, 1]
    health_score = np.clip((1.0 - failure_prob) * 100.0, 0.0, 100.0)

    result = X_df.copy()
    result["failure_probability"] = failure_prob
    result["health_score"] = health_score
    return result


if __name__ == "__main__":
    # Train and save a model to data/model.pkl when executed directly
    trained = train_model()
    print("Model trained and saved to:", os.path.join("data", "model.pkl"))

