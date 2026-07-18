def generate_recommendation(patient: dict, prediction: int, probability: float) -> dict:
    """Rule-based, explainable recommendation logic.
    Kept rule-based (rather than a second ML model) so every suggestion
    is traceable to a specific patient value -- important for a healthcare
    context and easy to justify in a report or demo.
    """
    lifestyle_tips = []
    urgency = "low"

    if patient.get("chol", 0) > 240:
        lifestyle_tips.append(
            "Cholesterol is above the healthy range (>240 mg/dl) -- reduce saturated fat and increase fiber intake."
        )
    if patient.get("trestbps", 0) > 140:
        lifestyle_tips.append(
            "Resting blood pressure is elevated -- monitor regularly and reduce sodium intake."
        )
    if patient.get("fbs"):
        lifestyle_tips.append(
            "Fasting blood sugar is above 120 mg/dl -- consider a diabetes screening."
        )
    if patient.get("age", 0) > 50 and prediction == 1:
        lifestyle_tips.append(
            "Age combined with detected risk markers suggests scheduling regular cardiac checkups."
        )
    if patient.get("exang"):
        lifestyle_tips.append(
            "Exercise-induced angina reported -- avoid high-intensity exertion without medical clearance."
        )
    if patient.get("thalch", 999) < 100:
        lifestyle_tips.append(
            "Maximum heart rate achieved is relatively low -- a supervised cardiac stress test is advisable."
        )

    if prediction == 1 and probability > 0.7:
        urgency = "high"
        doctor_advice = "Consult a cardiologist promptly for further diagnostic tests (ECG, angiography)."
    elif prediction == 1:
        urgency = "moderate"
        doctor_advice = "Schedule a check-up with a physician within the next few weeks."
    else:
        doctor_advice = "No immediate concern detected, but maintain routine annual heart checkups."

    if not lifestyle_tips:
        lifestyle_tips.append("No major risk factors detected -- maintain current healthy habits.")

    return {
        "urgency": urgency,
        "doctor_advice": doctor_advice,
        "lifestyle_tips": lifestyle_tips,
    }
