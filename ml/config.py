"""Configuration for Tata Power Predictive Maintenance ML pipeline."""
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT_DIR / "ai4i+2020+predictive+maintenance+dataset" / "ai4i2020.csv"
MODELS_DIR = ROOT_DIR / "models"
ARTIFACTS_DIR = MODELS_DIR / "artifacts"
DATA_DIR = ROOT_DIR / "data"

TARGET_COL = "Machine failure"
FEATURE_COLS = [
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
]
CATEGORICAL_COLS = ["Type"]
FAILURE_TYPE_COLS = ["TWF", "HDF", "PWF", "OSF", "RNF"]

RISK_CATEGORIES = {
    "Healthy": (0.0, 0.10),
    "Low Risk": (0.10, 0.25),
    "Medium Risk": (0.25, 0.50),
    "High Risk": (0.50, 0.75),
    "Critical": (0.75, 1.01),
}

MODEL_NAMES = [
    "Logistic Regression",
    "Decision Tree",
    "Random Forest",
    "XGBoost",
]

RANDOM_STATE = 42
TEST_SIZE = 0.2
