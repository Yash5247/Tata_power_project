"""
Evaluate trained predictive maintenance models.
Loads best_model.pkl and generates evaluation reports.
"""
import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

from ml.config import ARTIFACTS_DIR, MODELS_DIR
from ml.preprocessing import prepare_data

sns.set_theme(style="whitegrid")


def evaluate_saved_model(model_path: Path | None = None):
    """Evaluate the saved best model on the test set."""
    model_path = model_path or MODELS_DIR / "best_model.pkl"

    if not model_path.exists():
        raise FileNotFoundError(f"Model not found at {model_path}. Run train.py first.")

    print("=" * 60)
    print("Tata Power Predictive Maintenance — Model Evaluation")
    print("=" * 60)

    model = joblib.load(model_path)
    _, X_test, _, y_test = prepare_data()

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
    }

    print("\nBest Model Metrics:")
    for k, v in metrics.items():
        print(f"  {k.replace('_', ' ').title()}: {v}")

    eval_dir = ARTIFACTS_DIR / "evaluation"
    eval_dir.mkdir(parents=True, exist_ok=True)

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=["No Failure", "Failure"], yticklabels=["No Failure", "Failure"])
    plt.title("Best Model — Confusion Matrix")
    plt.ylabel("Actual")
    plt.xlabel("Predicted")
    plt.tight_layout()
    plt.savefig(eval_dir / "confusion_matrix.png", dpi=150)
    plt.close()

    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"AUC = {metrics['roc_auc']:.4f}", linewidth=2, color="#2563eb")
    plt.plot([0, 1], [0, 1], "k--", alpha=0.5)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Best Model — ROC Curve")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(eval_dir / "roc_curve.png", dpi=150)
    plt.close()

    report = classification_report(y_test, y_pred, target_names=["No Failure", "Failure"])
    print("\nClassification Report:")
    print(report)

    with open(eval_dir / "classification_report.txt", "w") as f:
        f.write(report)

    with open(eval_dir / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Load and display comparison if available
    comparison_path = ARTIFACTS_DIR / "model_comparison.csv"
    if comparison_path.exists():
        print("\nFull Model Comparison:")
        print(pd.read_csv(comparison_path).to_string(index=False))

    print(f"\nEvaluation artifacts saved to {eval_dir}")
    return metrics


if __name__ == "__main__":
    evaluate_saved_model()
