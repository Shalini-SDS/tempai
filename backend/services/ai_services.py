# services/ai_service.py
"""
ai_service.py
Provides lightweight prediction and anomaly detection utilities.
- If you later train a model, save it as models/temp_model.pkl and joblib.load will be used.
- For now, we provide robust fallbacks:
    - predict_temp: simple moving-average-based forecast of next temperature
    - detect_anomaly_from_recent: z-score based anomaly detection on recent window
"""

import os
import numpy as np
import joblib
from config.db_config import db
import statistics
from typing import List, Dict

# Try to load a saved model if exists
MODEL_PATH = os.path.join("models", "temp_model.pkl")
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Loaded ML model from", MODEL_PATH)
    except Exception as e:
        print("Failed to load model:", e)
        model = None
else:
    print("No pre-trained model found; using default heuristics.")


def _fetch_recent_temperatures(window: int = 10) -> List[float]:
    """
    Fetch most recent `window` temperature values from DB.
    Returns list sorted oldest->newest.
    """
    cursor = db.sensor_data.find({}, {"temperature": 1, "timestamp": 1}).sort("timestamp", -1).limit(window)
    docs = list(cursor)
    temps = [float(d.get("temperature")) for d in docs]
    temps.reverse()  # to have chronological order
    return temps


def predict_temp(window: int = 10):
    """
    Predict next temperature.
    - If a model is available, use it (expects features you designed).
    - Else, use simple moving-average or linear-extrapolation.
    Returns numeric value or informative string.
    """
    try:
        temps = _fetch_recent_temperatures(window)
        if not temps:
            return "No data"

        if model:
            # If your model expects a 2D array of features, adjust here.
            # Example: model.predict(np.array(temps).reshape(1, -1))
            try:
                feat = np.array(temps).reshape(1, -1)
                pred = model.predict(feat)
                return float(pred[0])
            except Exception as e:
                # fallback to heuristic
                print("Model prediction failed, falling back:", e)

        # Heuristic: linear extrapolation using last two points if available
        if len(temps) >= 2:
            x = np.arange(len(temps))
            coef = np.polyfit(x, temps, 1)  # linear fit
            next_x = len(temps)
            pred = np.polyval(coef, next_x)
            return float(pred)
        else:
            # single value -> return same
            return float(temps[-1])

    except Exception as e:
        return f"prediction_error: {str(e)}"


def detect_anomaly_from_recent(window: int = 50, z_threshold: float = 2.5) -> List[Dict]:
    """
    Fetch the most recent `window` records and return those flagged as anomalies
    using z-score on temperature. Each returned dict includes the record and z_score.
    """
    try:
        cursor = db.sensor_data.find({}, {"temperature": 1, "humidity": 1, "timestamp": 1}).sort("timestamp", -1).limit(window)
        docs = list(cursor)
        if not docs:
            return []

        # Extract temperatures (newest->oldest), then reverse
        temps = [float(d.get("temperature", 0)) for d in docs]
        temps.reverse()  # oldest -> newest
        mean = statistics.mean(temps)
        stdev = statistics.pstdev(temps) if len(temps) > 1 else 0.0

        anomalies = []
        # iterate over original docs but need chronological ordering
        docs.reverse()  # now oldest->newest
        for i, doc in enumerate(docs):
            temp = float(doc.get("temperature", 0))
            z = 0.0
            if stdev > 0:
                z = (temp - mean) / stdev
            if abs(z) >= z_threshold:
                record = {
                    "id": str(doc.get("_id")),
                    "timestamp": doc.get("timestamp"),
                    "temperature": temp,
                    "z_score": z
                }
                anomalies.append(record)

        return anomalies

    except Exception as e:
        print("Anomaly detection error:", e)
        return []


def analyze_symptoms(temperature: float, age: int, days_since_onset: int, symptoms: List[str]) -> Dict:
    """
    Analyze symptoms and return prediction with confidence and recommendations.
    - Uses simple heuristics based on temperature, symptoms, and duration.
    - Returns dict with: prediction, confidence, recommendations, class_probabilities
    """
    try:
        recommendation_map = {
            'Viral': [
                {'title': 'Stay Hydrated', 'detail': 'Drink water, herbal tea, or electrolyte solutions.'},
                {'title': 'Rest Adequately', 'detail': 'Aim for 8-10 hours of sleep to aid recovery.'},
                {'title': 'Monitor Temperature', 'detail': 'Consult a doctor if fever persists beyond 3 days.'},
            ],
            'Bacterial': [
                {'title': 'Seek Medical Attention', 'detail': 'Bacterial infections may require antibiotics.'},
                {'title': 'Rest and Hydrate', 'detail': 'Drink plenty of fluids and rest well.'},
                {'title': 'Take Paracetamol', 'detail': 'Take 500mg every 6 hours if temperature exceeds 38°C.'},
                {'title': 'Follow Doctor Advice', 'detail': 'Take prescribed antibiotics as directed.'},
            ],
            'Dengue': [
                {'title': 'Immediate Medical Care', 'detail': 'Dengue requires medical supervision.'},
                {'title': 'Stay Hydrated', 'detail': 'Drink oral rehydration salts or fluids.'},
                {'title': 'Avoid NSAIDs', 'detail': 'Avoid aspirin or ibuprofen; use acetaminophen.'},
                {'title': 'Monitor Vitals', 'detail': 'Watch for warning signs and seek hospital care if needed.'},
            ],
            'Malaria': [
                {'title': 'Seek Urgent Care', 'detail': 'Malaria requires immediate medical treatment.'},
                {'title': 'Blood Tests Required', 'detail': 'Get tested for malaria parasites.'},
                {'title': 'Take Antimalarials', 'detail': 'Follow prescribed antimalarial medication.'},
                {'title': 'Prevent Mosquitoes', 'detail': 'Use mosquito nets and repellent to prevent spread.'},
            ],
        }
        
        symptom_keywords = {
            'Viral': ['Fatigue', 'Headache', 'Cough'],
            'Bacterial': ['Chills', 'Cough', 'Headache'],
            'Dengue': ['Headache', 'Body ache', 'Fatigue'],
            'Malaria': ['Chills', 'Fatigue', 'Headache'],
        }
        
        temp_severity = 0
        if temperature >= 40:
            temp_severity = 1.0
        elif temperature >= 39:
            temp_severity = 0.8
        elif temperature >= 38:
            temp_severity = 0.6
        elif temperature >= 37.5:
            temp_severity = 0.4
        else:
            temp_severity = 0.1
        
        symptom_counts = {disease: 0 for disease in symptom_keywords}
        for disease, keywords in symptom_keywords.items():
            symptom_counts[disease] = sum(1 for s in symptoms if s in keywords)
        
        class_scores = {}
        for disease in symptom_keywords:
            base_score = (symptom_counts[disease] / max(len(symptom_keywords[disease]), 1)) * 0.6 + temp_severity * 0.4
            
            if disease == 'Viral' and days_since_onset <= 5:
                base_score += 0.1
            elif disease == 'Bacterial' and temperature >= 38.5 and 'Chills' in symptoms:
                base_score += 0.15
            elif disease == 'Dengue' and temperature >= 39 and 'Headache' in symptoms:
                base_score += 0.1
            elif disease == 'Malaria' and 'Chills' in symptoms and temperature >= 39:
                base_score += 0.15
            
            if age < 5 or age > 65:
                base_score += 0.05
            
            class_scores[disease] = min(base_score, 1.0)
        
        total_score = sum(class_scores.values())
        probabilities = {}
        for disease, score in class_scores.items():
            if total_score > 0:
                probabilities[disease] = score / total_score
            else:
                probabilities[disease] = 0.25
        
        predicted_disease = max(class_scores, key=class_scores.get)
        confidence = probabilities[predicted_disease]
        
        class_probs = [
            {'class': disease, 'probability': prob}
            for disease, prob in sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
        ]
        
        recs = recommendation_map.get(predicted_disease, [])
        
        return {
            'prediction': predicted_disease,
            'confidence': confidence,
            'recommendations': recs,
            'class_probabilities': class_probs,
        }
    
    except Exception as e:
        print("Symptoms analysis error:", e)
        return {
            'prediction': 'Unknown',
            'confidence': 0.0,
            'recommendations': [],
            'class_probabilities': [],
            'error': str(e),
        }
