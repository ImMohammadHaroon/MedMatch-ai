from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

from recommend import generate_recommendation

app = FastAPI(title="MedMatch AI API", version="1.0.0")

# Allow the React frontend (Vite default port) to call this API.
# Restrict allow_origins to your real frontend domain before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml")

model = None
scaler = None
feature_columns = None


@app.on_event("startup")
def load_artifacts():
    """Load the trained model artifacts on startup.
    These files only exist after running ml/train.py.
    """
    global model, scaler, feature_columns
    try:
        model = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
        scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
        feature_columns = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
    except FileNotFoundError:
        # Server still starts so /health works, but /predict will error until trained.
        model = None


class PatientInput(BaseModel):
    age: int
    sex: str          # "Male" / "Female"
    cp: str            # chest pain type, e.g. "typical angina"
    trestbps: float     # resting blood pressure
    chol: float          # serum cholesterol
    fbs: bool             # fasting blood sugar > 120 mg/dl
    restecg: str            # resting ECG results
    thalch: float             # max heart rate achieved
    exang: bool                 # exercise induced angina
    oldpeak: float                # ST depression
    slope: str                     # slope of peak exercise ST segment
    ca: float                       # number of major vessels colored by flourosopy
    thal: str                        # thalassemia result


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
def predict(data: PatientInput):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not trained yet. Run ml/train.py first to generate model.pkl.",
        )

    df = pd.DataFrame([data.dict()])
    df = pd.get_dummies(df)
    # Align incoming columns with the exact columns used during training.
    df = df.reindex(columns=feature_columns, fill_value=0)

    scaled = scaler.transform(df)
    prediction = int(model.predict(scaled)[0])
    probability = float(model.predict_proba(scaled)[0][1])

    recommendation = generate_recommendation(data.dict(), prediction, probability)

    return {
        "prediction": prediction,
        "risk_probability": round(probability, 3),
        "recommendation": recommendation,
    }
