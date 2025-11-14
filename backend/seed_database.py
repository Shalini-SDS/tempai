import datetime
from config.db_config import db

sample_readings = [
    {
        "temperature": 37.2,
        "humidity": 45,
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=4),
        "notes": "Baseline reading"
    },
    {
        "temperature": 37.8,
        "humidity": 48,
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=3),
        "notes": "Slight elevation"
    },
    {
        "temperature": 38.5,
        "humidity": 52,
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=2),
        "notes": "Fever started"
    },
    {
        "temperature": 39.2,
        "humidity": 55,
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(days=1),
        "notes": "High fever"
    },
    {
        "temperature": 38.8,
        "humidity": 50,
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=12),
        "notes": "Temperature declining"
    },
    {
        "temperature": 38.3,
        "humidity": 48,
        "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=6),
        "notes": "Continuing to improve"
    },
    {
        "temperature": 38.1,
        "humidity": 46,
        "timestamp": datetime.datetime.utcnow(),
        "notes": "Latest reading"
    },
]

try:
    db.sensor_data.insert_many(sample_readings)
    print(f"Successfully inserted {len(sample_readings)} sample readings")
except Exception as e:
    print(f"Error inserting data: {e}")
