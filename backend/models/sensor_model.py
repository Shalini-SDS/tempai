# models/sensor_model.py
"""
sensor_model.py
Utilities for preparing and validating sensor documents before insertion into MongoDB.
MongoDB is schemaless, but keeping a consistent structure helps querying and AI.
"""

from typing import Tuple
import datetime

# Allowed keys and their expected types (simple checks)
EXPECTED_KEYS = {
    "temperature": (int, float),
    "humidity": (int, float),
    "pressure": (int, float),   # optional
    "co2": (int, float),        # optional air quality
    "device_id": (str,),        # optional identifier for device
    "meta": (dict,)             # optional nested metadata
}

def validate_sensor_doc(payload: dict) -> Tuple[bool, str]:
    """
    Validate incoming payload lightly.
    Returns (True, "") if ok, else (False, reason).
    """
    if not isinstance(payload, dict):
        return False, "Payload must be a JSON object"

    # Must have at least temperature
    if "temperature" not in payload:
        return False, "Missing required field: temperature"

    # Check types for present keys
    for k, v in payload.items():
        if k in EXPECTED_KEYS:
            expected = EXPECTED_KEYS[k]
            if not isinstance(v, expected):
                return False, f"Invalid type for '{k}'. Expected {expected}, got {type(v)}"
        else:
            # allow unknown keys but ensure they are basic types
            if not isinstance(v, (str, int, float, bool, dict, list, type(None))):
                return False, f"Unsupported value type for key '{k}'"

    return True, ""


def create_sensor_doc(payload: dict) -> dict:
    """
    Normalize the payload and return a consistent document to insert.
    Adds default fields if missing.
    """
    doc = {}

    # core fields
    doc["temperature"] = float(payload.get("temperature"))
    doc["humidity"] = float(payload.get("humidity")) if payload.get("humidity") is not None else None

    # optional fields
    if "pressure" in payload:
        doc["pressure"] = float(payload.get("pressure"))
    if "co2" in payload:
        doc["co2"] = float(payload.get("co2"))
    if "device_id" in payload:
        doc["device_id"] = str(payload.get("device_id"))
    if "meta" in payload and isinstance(payload.get("meta"), dict):
        doc["meta"] = payload.get("meta")

    # helpful derived fields
    doc["received_at"] = datetime.datetime.utcnow()
    # timestamp will be set in controller (UTC)
    return doc
