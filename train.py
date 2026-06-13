"""
Train and compare ML models for Tata Power Predictive Maintenance.
Models: Logistic Regression, Decision Tree, Random Forest, XGBoost
"""
import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
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
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

from ml.config import ARTIFACTS_DIR, MODELS_DIR, MODEL_NAMES, RANDOM_STATE
from ml.preprocessing import build_preprocessor, get_feature_names, load_dataset, prepare_data

sns.set_theme(style="whitegrid")


def get_models():
    """Return dictionary of model pipelines."""
    preprocessor = build_preprocessor()

    models = {
        "Logistic Regression": Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, random_state=RANDOM_STATE, class_weight="balanced")),
        ]),
        "Decision Tree": Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", DecisionTreeClassifier(max_depth=10, random_state=RANDOM_STATE, class_weight="balanced")),
        ]),
        "Random Forest": Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", RandomForestClassifier(
                n_estimators=200, max_depth=12, random_state=RANDOM_STATE, class_weight="balanced", n_jobs=-1
            )),
        ]),
        "XGBoost": Pipeline([
            ("preprocessor", build_preprocessor()),
            ("classifier", XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                random_state=RANDOM_STATE,
                eval_metric="logloss",
                scale_pos_weight=10,
            )),
        ]),
    }
    return models


def evaluate_model(name: str, model, X_test, y_test, artifacts_dir: Path) -> dict:
    """Evaluate a single model and save visualizations."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    metrics = {
        "model": name,
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
    }

    model_slug = name.lower().replace(" ", "_")
    model_dir = artifacts_dir / model_slug
    model_dir.mkdir(parents=True, exist_ok=True)

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=["No Failure", "Failure"], yticklabels=["No Failure", "Failure"])
    plt.title(f"Confusion Matrix — {name}")
    plt.ylabel("Actual")
    plt.xlabel("Predicted")
    plt.tight_layout()
    plt.savefig(model_dir / "confusion_matrix.png", dpi=150)
    plt.close()

    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"AUC = {metrics['roc_auc']:.4f}", linewidth=2)
    plt.plot([0, 1], [0, 1], "k--", alpha=0.5)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC Curve — {name}")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(model_dir / "roc_curve.png", dpi=150)
    plt.close()

    # Classification report
    report = classification_report(y_test, y_pred, target_names=["No Failure", "Failure"])
    with open(model_dir / "classification_report.txt", "w") as f:
        f.write(report)

    metrics["classification_report"] = report
    return metrics


def extract_feature_importance(name: str, model, artifacts_dir: Path) -> dict:
    """Extract and visualize feature importance where available."""
    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]
    feature_names = get_feature_names(preprocessor)

    importance = None
    if hasattr(classifier, "feature_importances_"):
        importance = classifier.feature_importances_
    elif hasattr(classifier, "coef_"):
        importance = np.abs(classifier.coef_[0])

    if importance is None:
        return {}

    imp_df = pd.DataFrame({"feature": feature_names, "importance": importance})
    imp_df = imp_df.sort_values("importance", ascending=False)

    model_slug = name.lower().replace(" ", "_")
    model_dir = artifacts_dir / model_slug

    plt.figure(figsize=(8, 5))
    sns.barplot(data=imp_df.head(10), x="importance", y="feature", palette="viridis")
    plt.title(f"Top 10 Feature Importance — {name}")
    plt.tight_layout()
    plt.savefig(model_dir / "feature_importance.png", dpi=150)
    plt.close()

    return imp_df.to_dict(orient="records")


def select_best_model(comparison: list[dict]) -> str:
    """Select best model by F1 score, then ROC AUC."""
    return max(comparison, key=lambda x: (x["f1_score"], x["roc_auc"]))["model"]


def main():
    print("=" * 60)
    print("Tata Power Predictive Maintenance — Model Training")
    print("=" * 60)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    df = load_dataset()
    print(f"\nDataset loaded: {len(df)} records, {df['Machine failure'].sum()} failures ({df['Machine failure'].mean()*100:.2f}%)")

    X_train, X_test, y_train, y_test = prepare_data(df)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    models = get_models()
    comparison = []
    trained_models = {}

    for name in MODEL_NAMES:
        print(f"\nTraining {name}...")
        model = models[name]
        model.fit(X_train, y_train)
        metrics = evaluate_model(name, model, X_test, y_test, ARTIFACTS_DIR)
        importance = extract_feature_importance(name, model, ARTIFACTS_DIR)
        metrics["feature_importance"] = importance
        comparison.append(metrics)
        trained_models[name] = model
        print(f"  Accuracy: {metrics['accuracy']:.4f} | F1: {metrics['f1_score']:.4f} | ROC AUC: {metrics['roc_auc']:.4f}")

    best_name = select_best_model(comparison)
    best_model = trained_models[best_name]
    print(f"\nBest Model: {best_name}")

    # Save best model
    joblib.dump(best_model, MODELS_DIR / "best_model.pkl")
    joblib.dump(best_model, MODELS_DIR / f"best_model_{best_name.lower().replace(' ', '_')}.pkl")

    # Comparison table
    comparison_df = pd.DataFrame(comparison)
    comparison_df = comparison_df[["model", "accuracy", "precision", "recall", "f1_score", "roc_auc"]]
    comparison_df.to_csv(ARTIFACTS_DIR / "model_comparison.csv", index=False)

    # Comparison visualization
    metrics_melt = comparison_df.melt(id_vars=["model"], var_name="metric", value_name="score")
    plt.figure(figsize=(10, 6))
    sns.barplot(data=metrics_melt, x="metric", y="score", hue="model", palette="Set2")
    plt.title("Model Comparison — Classification Metrics")
    plt.ylim(0, 1.05)
    plt.legend(bbox_to_anchor=(1.02, 1), loc="upper left")
    plt.tight_layout()
    plt.savefig(ARTIFACTS_DIR / "model_comparison.png", dpi=150)
    plt.close()

    # Save metadata for dashboard integration
    metadata = {
        "best_model": best_name,
        "dataset": "AI4I 2020 Predictive Maintenance",
        "dataset_size": len(df),
        "failure_rate": round(df["Machine failure"].mean(), 4),
        "comparison": comparison_df.to_dict(orient="records"),
        "feature_importance": comparison[-1].get("feature_importance", []),
    }

    best_metrics = next(m for m in comparison if m["model"] == best_name)
    metadata["best_metrics"] = {
        k: best_metrics[k] for k in ["accuracy", "precision", "recall", "f1_score", "roc_auc"]
    }

    with open(MODELS_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nArtifacts saved to {ARTIFACTS_DIR}")
    print(f"Best model saved to {MODELS_DIR / 'best_model.pkl'}")
    print("\nModel Comparison:")
    print(comparison_df.to_string(index=False))


if __name__ == "__main__":
    main()
