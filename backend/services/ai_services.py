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
