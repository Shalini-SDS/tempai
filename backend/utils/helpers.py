# utils/helpers.py
from datetime import datetime, timezone

def now_iso():
    """Return current UTC time as ISO formatted string."""
    return datetime.now(timezone.utc).isoformat()

def iso_to_utc(dt_str: str):
    """
    Convert ISO datetime string to a naive UTC datetime object.
    Raises ValueError if format invalid.
    """
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

def pretty(obj):
    """Simple helper for debugging prints."""
    try:
        import json
        return json.dumps(obj, default=str, indent=2)
    except Exception:
        return str(obj)
