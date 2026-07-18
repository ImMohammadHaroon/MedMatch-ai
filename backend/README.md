# MedMatch AI — Backend

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 1. Train the model

Download the dataset from:
https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data/data

Place the CSV at `backend/ml/data/heart_disease.csv`, then:

```bash
cd ml
python train.py
```

This creates `model.pkl`, `scaler.pkl`, and `feature_columns.pkl` inside `ml/`.

## 2. Run the API

```bash
cd backend
uvicorn main:app --reload --port 8000
```

- Health check: `GET http://localhost:8000/health`
- Prediction: `POST http://localhost:8000/predict`

### Example request body

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

Values for the string fields (`sex`, `cp`, `restecg`, `slope`, `thal`) must match the category labels used in the dataset you trained on — check `feature_columns.pkl` / the raw CSV if predictions look off.
