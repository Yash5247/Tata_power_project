# Amazon ML Summer School 2026 — Application Content

## Project Title

**Tata Power Predictive Maintenance System: End-to-End ML Pipeline for Industrial Equipment Failure Prediction**

---

## Project Domain

Industrial AI / Predictive Maintenance / Energy Infrastructure Monitoring

---

## Dataset Used

**AI4I 2020 Predictive Maintenance Dataset** (UCI Machine Learning Repository)

Simulates industrial equipment sensor data from a manufacturing process with multiple failure modes relevant to power generation and heavy machinery operations.

---

## Dataset Size

- **Total Records:** 10,000
- **Features:** 6 (5 numeric sensors + equipment type)
- **Target Variable:** Machine failure (binary classification)
- **Failure Rate:** 3.39% (339 positive cases)
- **Train/Test Split:** 8,000 / 2,000 (stratified)

---

## Models Used

| Model | Purpose |
|-------|---------|
| Logistic Regression | Baseline linear classifier |
| Decision Tree | Interpretable non-linear model |
| Random Forest | Ensemble bagging classifier |
| **XGBoost (Selected)** | **Gradient boosting — best performer** |

**Selection Criteria:** Highest F1 Score, then ROC AUC

---

## Frameworks Used

| Framework | Role |
|-----------|------|
| **scikit-learn** | Preprocessing, model training, evaluation metrics |
| **XGBoost** | Best-performing gradient boosting classifier |
| **Next.js 14** | Full-stack dashboard and API routes |
| **React 18** | Real-time monitoring UI |
| **Tailwind CSS** | Industrial dashboard styling |

---

## Libraries Used

**Python:** pandas, numpy, scikit-learn, xgboost, matplotlib, seaborn, joblib, imbalanced-learn

**TypeScript/JavaScript:** next, react, recharts, swr

---

## Metrics Achieved

### Best Model: XGBoost

| Metric | Score |
|--------|-------|
| **Accuracy** | 98.15% |
| **Precision** | 71.83% |
| **Recall** | 75.00% |
| **F1 Score** | 73.38% |
| **ROC AUC** | 97.12% |

### Full Comparison

| Model | Accuracy | Precision | Recall | F1 | ROC AUC |
|-------|----------|-----------|--------|-----|---------|
| Logistic Regression | 82.45% | 14.18% | 82.35% | 24.19% | 90.69% |
| Decision Tree | 95.95% | 44.14% | 72.06% | 54.75% | 85.33% |
| Random Forest | 97.45% | 60.76% | 70.59% | 65.31% | 95.69% |
| **XGBoost** | **98.15%** | **71.83%** | **75.00%** | **73.38%** | **97.12%** |

---

## System Components

1. **EDA Notebook** (`notebooks/eda.ipynb`) — Missing values, outliers, correlation heatmap, failure distribution, feature importance
2. **Training Pipeline** (`train.py`) — Automated 4-model comparison with artifact generation
3. **Evaluation Module** (`evaluate.py`) — Confusion matrix, ROC curve, classification report
4. **Prediction Service** (`predict.py`) — Batch inference with maintenance recommendations
5. **Model Artifacts** (`models/best_model.pkl`) — Serialized XGBoost pipeline
6. **Recommendation Engine** (`ml/recommendation.py`) — 5-tier risk categorization
7. **Next.js API Layer** (`app/api/`) — Predictions, alerts, sensor data, ML metrics
8. **Dashboard UI** — Real-time health scores, risk categories, maintenance schedules

### Risk Categories

| Category | Failure Probability Range | Action |
|----------|--------------------------|--------|
| Healthy | 0% – 10% | Routine monitoring |
| Low Risk | 10% – 25% | Preventive inspection (60 days) |
| Medium Risk | 25% – 50% | Component inspection (30 days) |
| High Risk | 50% – 75% | Urgent maintenance (7 days) |
| Critical | 75% – 100% | Emergency shutdown (1 day) |

---

## GitHub Description

> End-to-end predictive maintenance ML system for industrial equipment failure prediction. Trained on AI4I 2020 dataset (10K records), comparing Logistic Regression, Decision Tree, Random Forest, and XGBoost. Achieved 98.15% accuracy and 97.12% ROC AUC with XGBoost. Features EDA notebook, automated model selection, maintenance recommendation engine, and Next.js real-time dashboard inspired by Tata Power energy infrastructure operations. Built for Amazon ML Summer School 2026.

**Suggested GitHub Topics:** `machine-learning` `predictive-maintenance` `xgboost` `nextjs` `industrial-ai` `classification` `data-science` `amazon-mlss` `tata-power` `scikit-learn`

---

## One-Line Pitch

Built a production-grade predictive maintenance system that predicts industrial equipment failures with 98% accuracy, powering a real-time Tata Power-inspired dashboard with automated maintenance recommendations.

---

## Resume Bullet (Primary)

Developed an end-to-end machine learning pipeline for transformer and industrial equipment fault prediction using the AI4I 2020 Predictive Maintenance dataset, comparing four classification algorithms (Logistic Regression, Decision Tree, Random Forest, XGBoost) and achieving optimal performance with XGBoost at 98.15% accuracy and 97.12% ROC AUC, integrated with a Next.js real-time monitoring dashboard featuring five-tier risk categorization and automated maintenance scheduling.
