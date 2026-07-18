# MedMatch AI

Heart disease risk assessment app that combines a machine learning classifier with rule-based clinical guidance. Users enter patient vitals in a React form; a FastAPI backend scores heart-disease risk and returns urgency level, doctor advice, and lifestyle tips.

> **Disclaimer:** MedMatch AI is an educational / demo project. It is **not** a medical device and must not be used for real clinical decisions.

---

## Features

- **Risk prediction** — Random Forest classifier trained on UCI / Kaggle heart-disease data
- **Explainable recommendations** — Rule-based tips tied to cholesterol, blood pressure, fasting sugar, angina, age, and heart rate
- **Web UI** — Patient intake form with results shown in a separate tab
- **REST API** — Health check and predict endpoints with CORS for local Vite development

---

## Architecture

```
┌─────────────────┐         POST /predict          ┌──────────────────────┐
│  React + Vite   │  ─────────────────────────────► │  FastAPI (port 8000) │
│  (port 5173)    │  ◄───────────────────────────── │  + Random Forest     │
│  PatientForm    │   prediction, probability,      │  + recommend.py      │
│  ResultCard     │   urgency / advice / tips       │  model.pkl / scaler  │
└─────────────────┘                                 └──────────────────────┘
```

1. Frontend collects clinical features and calls `POST /predict`.
2. Backend one-hot encodes and aligns features, scales them, and runs the model.
3. `recommend.py` builds urgency, doctor advice, and lifestyle tips from the inputs and prediction.
4. Results open in a new browser tab (`/?view=result`).

---

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Uvicorn, Pydantic, Pandas |
| ML | scikit-learn (RandomForestClassifier, StandardScaler, SimpleImputer), joblib |
| Data | [Heart Disease Data (UCI / Kaggle)](https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data/data) |

---

## Project structure

```
medmatch-ai/
├── README.md
├── .gitignore
├── backend/
│   ├── main.py              # FastAPI app: /health, /predict
│   ├── recommend.py         # Rule-based recommendations
│   ├── requirements.txt
│   ├── README.md            # Backend-specific notes
│   └── ml/
│       ├── train.py         # Train & export model artifacts
│       ├── requirements.txt
│       ├── model.pkl        # Trained classifier (after train)
│       ├── scaler.pkl
│       ├── feature_columns.pkl
│       └── data/
│           └── heart_disease_uci.csv
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx          # Form view + result view
        ├── api.js           # Axios client → localhost:8000
        ├── index.css
        └── components/
            ├── PatientForm.jsx
            └── ResultCard.jsx
```

---

## Prerequisites

- Python 3.10+ (recommended)
- Node.js 18+ and npm
- (Optional) Kaggle account if you need to re-download the dataset

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/ImMohammadHaroon/MedMatch-ai.git
cd MedMatch-ai
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
```

### 3. Train the model (if artifacts are missing)

Dataset should live at `backend/ml/data/heart_disease_uci.csv` (already included in this repo). You can also place a file named `heart_disease.csv` in the same folder.

```bash
cd ml
python train.py
```

This writes `model.pkl`, `scaler.pkl`, and `feature_columns.pkl` into `backend/ml/`.

### 4. Start the API

From `backend/` (with the venv activated):

```bash
uvicorn main:app --reload --port 8000
```

- Health: [http://localhost:8000/health](http://localhost:8000/health)
- Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 5. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## API

### `GET /health`

```json
{ "status": "ok", "model_loaded": true }
```

### `POST /predict`

**Request body**

```json
{
  "age": 58,
  "sex": "Male",
  "cp": "typical angina",
  "trestbps": 145,
  "chol": 260,
  "fbs": true,
  "restecg": "normal",
  "thalch": 120,
  "exang": true,
  "oldpeak": 2.3,
  "slope": "flat",
  "ca": 1,
  "thal": "fixed defect"
}
```

| Field | Type | Description |
|--------|------|-------------|
| `age` | int | Age in years |
| `sex` | string | `"Male"` / `"Female"` |
| `cp` | string | Chest pain type (e.g. `"typical angina"`) |
| `trestbps` | float | Resting blood pressure (mm Hg) |
| `chol` | float | Serum cholesterol (mg/dl) |
| `fbs` | bool | Fasting blood sugar &gt; 120 mg/dl |
| `restecg` | string | Resting ECG result |
| `thalch` | float | Max heart rate achieved |
| `exang` | bool | Exercise-induced angina |
| `oldpeak` | float | ST depression induced by exercise |
| `slope` | string | Slope of peak exercise ST segment |
| `ca` | float | Number of major vessels (0–3) |
| `thal` | string | Thalassemia result |

**Response**

```json
{
  "prediction": 1,
  "risk_probability": 0.82,
  "recommendation": {
    "urgency": "high",
    "doctor_advice": "Consult a cardiologist promptly for further diagnostic tests (ECG, angiography).",
    "lifestyle_tips": [
      "Cholesterol is above the healthy range (>240 mg/dl) -- reduce saturated fat and increase fiber intake."
    ]
  }
}
```

- `prediction`: `0` = low / no disease signal, `1` = disease risk present  
- `risk_probability`: model probability for class `1`  
- `recommendation.urgency`: `low` | `moderate` | `high`

String categories (`sex`, `cp`, `restecg`, `slope`, `thal`) should match labels used in the training CSV.

---

## How the ML pipeline works

1. Load CSV; drop `id` / `dataset` if present.
2. Binarize target: `num` (0–4) → `0` (no disease) / `1` (disease).
3. One-hot encode categorical columns; median-impute numerics.
4. Stratified train/test split (80/20), `StandardScaler`, Random Forest (`n_estimators=300`, `max_depth=8`).
5. Persist model, scaler, and feature column list for inference.

Recommendations stay rule-based so each tip maps to a concrete patient value (e.g. chol &gt; 240, trestbps &gt; 140).

---

## Scripts reference

| Command | Where | Purpose |
|---------|--------|---------|
| `python train.py` | `backend/ml/` | Train and save model artifacts |
| `uvicorn main:app --reload --port 8000` | `backend/` | Run API |
| `npm run dev` | `frontend/` | Vite dev server |
| `npm run build` | `frontend/` | Production build |

---

## License

This project is provided for learning and demonstration purposes. Review the [dataset license](https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data/data) before redistributing the CSV.
