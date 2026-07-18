"""
Train the MedMatch AI heart disease classifier.

1. Download the dataset from:
   https://www.kaggle.com/datasets/redwankarimsony/heart-disease-data/data
2. Place the CSV at: backend/ml/data/heart_disease.csv
3. Run: python train.py   (from inside backend/ml/)

Produces model.pkl, scaler.pkl, feature_columns.pkl in this same folder,
which backend/main.py loads at startup.
"""

import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from sklearn.impute import SimpleImputer

BASE_DIR = os.path.dirname(__file__)
# Dataset on disk is heart_disease_uci.csv (UCI / Kaggle heart-disease-data release).
DATA_PATH = os.path.join(BASE_DIR, "data", "heart_disease_uci.csv")
# Fall back to the README name if someone places heart_disease.csv instead.
_ALT_DATA_PATH = os.path.join(BASE_DIR, "data", "heart_disease.csv")


def main():
    data_path = DATA_PATH if os.path.exists(DATA_PATH) else _ALT_DATA_PATH
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH} or {_ALT_DATA_PATH}.\n"
            "Download it from Kaggle and place it there before running this script."
        )

    df = pd.read_csv(data_path)
    print(f"Loaded {data_path}")
    print(f"Columns: {list(df.columns)}")

    # Drop non-feature identifier columns if present in this dataset release.
    df = df.drop(columns=["id", "dataset"], errors="ignore")

    # This dataset release uses "num" (0-4 severity). Binarize: 0 = no disease, 1 = disease present.
    target_col = "num" if "num" in df.columns else "target"
    df["target"] = df[target_col].apply(lambda x: 1 if x > 0 else 0)
    if target_col != "target":
        df = df.drop(columns=[target_col])
    else:
        pass

    # One-hot encode categorical/string columns (sex, cp, restecg, slope, thal, etc.)
    categorical_cols = df.select_dtypes(include="object").columns
    df = pd.get_dummies(df, columns=list(categorical_cols), drop_first=True)

    # Impute any remaining missing numeric values with the median.
    imputer = SimpleImputer(strategy="median")
    df[df.columns] = imputer.fit_transform(df)

    X = df.drop(columns=["target"])
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(n_estimators=300, max_depth=8, random_state=42)
    model.fit(X_train_scaled, y_train)

    preds = model.predict(X_test_scaled)
    probs = model.predict_proba(X_test_scaled)[:, 1]

    print("Accuracy:", accuracy_score(y_test, preds))
    print("ROC-AUC:", roc_auc_score(y_test, probs))
    print(classification_report(y_test, preds))

    joblib.dump(model, os.path.join(BASE_DIR, "model.pkl"))
    joblib.dump(scaler, os.path.join(BASE_DIR, "scaler.pkl"))
    joblib.dump(list(X.columns), os.path.join(BASE_DIR, "feature_columns.pkl"))
    print(f"\nSaved model.pkl, scaler.pkl, feature_columns.pkl to {BASE_DIR}")


if __name__ == "__main__":
    main()
