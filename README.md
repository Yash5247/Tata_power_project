# Tata Power Predictive Maintenance System

An end-to-end machine learning system for industrial equipment failure prediction, built for **Amazon ML Summer School 2026**. Inspired by Tata Power energy infrastructure operations, this project combines a production-grade ML pipeline with a real-time Next.js monitoring dashboard.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![XGBoost](https://img.shields.io/badge/Model-XGBoost-green)
![Accuracy](https://img.shields.io/badge/Accuracy-98.15%25-brightgreen)

---

## Problem Statement

Unplanned equipment failures in power generation and industrial infrastructure cause costly downtime, safety risks, and operational inefficiencies. This project addresses predictive maintenance by:

- Predicting machine failures before they occur
- Assigning risk categories to equipment (Healthy → Critical)
- Generating actionable maintenance recommendations
- Visualizing equipment health in a real-time dashboard

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI4I 2020 Dataset (10,000 records)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   notebooks/eda.ipynb        │
              │   EDA & Feature Analysis     │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   train.py / evaluate.py     │
              │   4 Model Comparison         │
              │   → best_model.pkl (XGBoost) │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   predict.py                 │
              │   Equipment Predictions JSON │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   Next.js API Routes         │
              │   /api/predictions           │
              │   /api/alerts                │
              │   /api/ml-metrics            │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   React Dashboard (UI)       │
              │   Health Score • Risk Score  │
              │   Maintenance Engine         │
              └─────────────────────────────┘
```

---

## Dataset Description

**AI4I 2020 Predictive Maintenance Dataset** (UCI Machine Learning Repository)

| Attribute | Description |
|-----------|-------------|
| **Size** | 10,000 records |
| **Features** | Air temperature, Process temperature, Rotational speed, Torque, Tool wear, Equipment Type (L/M/H) |
| **Target** | Machine failure (binary) |
| **Failure Rate** | 3.39% (339 failures) |
| **Failure Modes** | TWF, HDF, PWF, OSF, RNF |

**Location:** `ai4i+2020+predictive+maintenance+dataset/ai4i2020.csv`

---

## ML Pipeline

### Phase 1 — Exploratory Data Analysis
```bash
jupyter notebook notebooks/eda.ipynb
```

- Missing value analysis (0 missing values)
- Outlier detection (IQR method)
- Correlation heatmap
- Feature distribution analysis
- Failure class distribution
- Feature importance baseline

### Phase 2 — Model Training
```bash
pip install -r requirements.txt
python train.py
```

Trains and compares 4 classifiers with stratified 80/20 split:
- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost

### Phase 3 — Evaluation
```bash
python evaluate.py
```

### Phase 4 — Prediction & Dashboard Integration
```bash
python predict.py
npm run dev
```

---

## Model Comparison

| Model | Accuracy | Precision | Recall | F1 Score | ROC AUC |
|-------|----------|-----------|--------|----------|---------|
| Logistic Regression | 0.8245 | 0.1418 | 0.8235 | 0.2419 | 0.9069 |
| Decision Tree | 0.9595 | 0.4414 | 0.7206 | 0.5475 | 0.8533 |
| Random Forest | 0.9745 | 0.6076 | 0.7059 | 0.6531 | 0.9569 |
| **XGBoost (Best)** | **0.9815** | **0.7183** | **0.7500** | **0.7338** | **0.9712** |

**Best Model Selection:** XGBoost (highest F1 Score and ROC AUC)

Artifacts saved in `models/artifacts/`:
- Confusion matrices per model
- ROC curves per model
- Classification reports
- Feature importance plots
- Model comparison chart

---

## Results

- **98.15% accuracy** on held-out test set (2,000 samples)
- **97.12% ROC AUC** — excellent discrimination on imbalanced data
- **73.38% F1 Score** — strong balance of precision and recall for rare failure class
- **Top predictors:** Rotational speed, Torque, Tool wear

### Industrial Features

| Feature | Description |
|---------|-------------|
| **Equipment Health Score** | 0–100% derived from failure probability |
| **Failure Risk Category** | Healthy / Low Risk / Medium Risk / High Risk / Critical |
| **Maintenance Recommendation Engine** | Priority, action, schedule based on risk tier |
| **Real-time Dashboard** | 24 equipment units with live ML predictions |

---

## Project Structure

```
├── notebooks/eda.ipynb          # EDA notebook
├── train.py                     # Model training pipeline
├── evaluate.py                  # Model evaluation
├── predict.py                   # Prediction & JSON export
├── ml/                          # ML modules
│   ├── config.py
│   ├── preprocessing.py
│   └── recommendation.py
├── models/
│   ├── best_model.pkl           # Trained XGBoost model
│   ├── model_metadata.json      # Metrics & comparison
│   └── artifacts/               # Visualizations
├── data/
│   ├── equipment_predictions.json
│   └── alerts.json
├── app/api/                     # Next.js API routes
├── components/                  # Dashboard UI
├── lib/ml-service.ts            # ML data service
└── requirements.txt
```

---

## Quick Start

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Train models
python train.py

# 3. Generate predictions
python predict.py

# 4. Start dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Screenshots

> Run `npm run dev` and capture screenshots of:
> - System Overview with KPI cards
> - Equipment Status Distribution chart
> - AI Predictive Insights panel
> - Equipment table with risk categories
> - Model comparison artifacts in `models/artifacts/`

---

## Resume Bullets (ATS-Optimized)

- Developed an end-to-end machine learning pipeline for industrial equipment failure prediction using the AI4I 2020 Predictive Maintenance dataset, comparing four classification algorithms and achieving optimal performance with XGBoost (98.15% accuracy, 97.12% ROC AUC).

- Engineered a predictive maintenance recommendation engine with five-tier risk categorization (Healthy to Critical), generating actionable maintenance schedules and reducing unplanned downtime for 24 monitored equipment units.

- Built a full-stack predictive maintenance dashboard integrating trained ML models with Next.js API routes, delivering real-time failure predictions, health scores, and maintenance alerts for energy infrastructure monitoring.

- Conducted comprehensive exploratory data analysis including correlation analysis, outlier detection, and feature importance visualization on 10,000 industrial sensor records with 3.39% failure rate, informing model feature selection and preprocessing strategy.

- Implemented production-grade MLOps workflow with automated model selection, serialized model persistence (joblib), evaluation reports, and JSON-based inference serving for dashboard integration.

---

## Future Scope

- [ ] Deploy ML inference API on AWS SageMaker
- [ ] Real-time streaming with Apache Kafka for live sensor ingestion
- [ ] SHAP-based model explainability for maintenance engineers
- [ ] Multi-class failure mode classification (TWF, HDF, PWF, OSF, RNF)
- [ ] Time-series LSTM for degradation trend forecasting
- [ ] CI/CD pipeline with automated model retraining
- [ ] Integration with Tata Power SCADA systems

---

## License

MIT License — Built for educational and portfolio purposes.

**Author:** Tata Power Predictive Maintenance Project | Amazon MLSS 2026
