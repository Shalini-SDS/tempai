# seed_static_data.py
from config.db_config import db

# Static data to be stored in database
SYMPTOM_DATA = [
    {"name": "Headache", "category": "neurological"},
    {"name": "Fatigue", "category": "general"},
    {"name": "Sore throat", "category": "respiratory"},
    {"name": "Rash", "category": "skin"},
    {"name": "Cough", "category": "respiratory"},
    {"name": "Body ache", "category": "musculoskeletal"},
    {"name": "Nausea", "category": "gastrointestinal"},
    {"name": "Chills", "category": "general"},
]

RECOMMENDATION_DATA = [
    {"title": "Stay Hydrated", "detail": "Drink water, herbal tea, or electrolyte solutions.", "priority": "high"},
    {"title": "Rest Adequately", "detail": "Aim for 8-10 hours of sleep to aid recovery.", "priority": "high"},
    {"title": "Take Paracetamol", "detail": "Take 500mg every 6 hours if temperature exceeds 38°C.", "priority": "medium"},
    {"title": "Monitor Temperature", "detail": "Consult a doctor if fever persists beyond 3 days.", "priority": "high"},
]

SEVERITY_DATA = [
    {"label": "Viral", "value": 85, "description": "Common viral infection"},
    {"label": "Bacterial", "value": 40, "description": "Bacterial infection"},
    {"label": "Dengue", "value": 20, "description": "Dengue fever"},
    {"label": "Malaria", "value": 10, "description": "Malaria infection"},
]

EMERGENCY_CONTACT_DATA = [
    {"label": "Emergency Services", "value": "911", "type": "primary", "country": "US"},
    {"label": "Family Doctor", "value": "+1 (555) 123-4567", "type": "secondary", "country": "US"},
    {"label": "Emergency Contact", "value": "+1 (555) 987-6543", "type": "secondary", "country": "US"},
]

FACILITY_DATA = [
    {"name": "City General Hospital", "distance": "1.2 km", "eta": "5 min", "type": "hospital"},
    {"name": "Metro Medical Center", "distance": "2.8 km", "eta": "10 min", "type": "medical_center"},
    {"name": "Community Health Clinic", "distance": "3.5 km", "eta": "12 min", "type": "clinic"},
]

CRITICAL_SYMPTOM_DATA = [
    {"symptom": "Temperature above 40°C (104°F)", "severity": "critical"},
    {"symptom": "Severe headache or stiff neck", "severity": "critical"},
    {"symptom": "Difficulty breathing", "severity": "critical"},
    {"symptom": "Persistent vomiting", "severity": "critical"},
]

WARNING_SIGN_DATA = [
    {"sign": "Confusion or altered consciousness", "severity": "warning"},
    {"sign": "Rapid heartbeat or chest pain", "severity": "warning"},
    {"sign": "Rash with purple spots", "severity": "warning"},
    {"sign": "Seizures or convulsions", "severity": "warning"},
]

VITAL_DATA = [
    {"label": "Heart Rate", "value": "78 bpm", "unit": "bpm", "normal_range": "60-100"},
    {"label": "Blood Pressure", "value": "120/80", "unit": "mmHg", "normal_range": "90/60-140/90"},
    {"label": "Oxygen Level", "value": "98 %", "unit": "%", "normal_range": "95-100"},
    {"label": "Respiratory Rate", "value": "16 /min", "unit": "/min", "normal_range": "12-20"},
]

USER_TIMELINE_DATA = [
    {"time": "Today • 11:27 PM", "temperature": "38.5°C", "summary": "High fever with headache and fatigue."},
    {"time": "Yesterday • 08:10 PM", "temperature": "38.1°C", "summary": "Moderate fever with fatigue."},
    {"time": "Apr 28 • 09:15 PM", "temperature": "37.2°C", "summary": "Temperature stabilised, symptoms light."},
]

USER_INSIGHTS_DATA = [
    {"title": "Recovery Phase", "detail": "Temperature held steady for 24h. Continue rest."},
    {"title": "Hydration Reminder", "detail": "Water intake below recommended. Increase fluid consumption."},
    {"title": "Medication Log", "detail": "Paracetamol taken twice today. Maintain dosage intervals."},
]

USER_HISTORY_DATA = [
    {"date": "Feb 13, 2025", "cause": "Viral", "severity": "Moderate", "outcome": "Recovered in 4 days"},
    {"date": "Oct 02, 2024", "cause": "Seasonal Flu", "severity": "Mild", "outcome": "Recovered in 3 days"},
    {"date": "Jul 19, 2024", "cause": "Bacterial", "severity": "Critical", "outcome": "Hospitalised, recovered"},
]

HEALTH_SCORE_DATA = {
    "overall_score": 78,
    "status": "Good",
    "components": {
        "temperature": 85,
        "symptoms": 60,
        "vitals": 95
    }
}

def seed_static_data():
    try:
        # Clear existing data
        db.symptoms.drop()
        db.recommendations.drop()
        db.severity_probabilities.drop()
        db.emergency_contacts.drop()
        db.facilities.drop()
        db.critical_symptoms.drop()
        db.warning_signs.drop()
        db.vitals.drop()
        db.user_timelines.drop()
        db.user_insights.drop()
        db.user_histories.drop()
        db.health_score.drop()

        # Insert new data
        db.symptoms.insert_many(SYMPTOM_DATA)
        db.recommendations.insert_many(RECOMMENDATION_DATA)
        db.severity_probabilities.insert_many(SEVERITY_DATA)
        db.emergency_contacts.insert_many(EMERGENCY_CONTACT_DATA)
        db.facilities.insert_many(FACILITY_DATA)
        db.critical_symptoms.insert_many(CRITICAL_SYMPTOM_DATA)
        db.warning_signs.insert_many(WARNING_SIGN_DATA)
        db.vitals.insert_many(VITAL_DATA)
        db.user_timelines.insert_many(USER_TIMELINE_DATA)
        db.user_insights.insert_many(USER_INSIGHTS_DATA)
        db.user_histories.insert_many(USER_HISTORY_DATA)
        db.health_score.insert_one(HEALTH_SCORE_DATA)

        print("Successfully seeded all static data into database")
        print(f"Symptoms: {len(SYMPTOM_DATA)}")
        print(f"Recommendations: {len(RECOMMENDATION_DATA)}")
        print(f"Severity probabilities: {len(SEVERITY_DATA)}")
        print(f"Emergency contacts: {len(EMERGENCY_CONTACT_DATA)}")
        print(f"Facilities: {len(FACILITY_DATA)}")
        print(f"Critical symptoms: {len(CRITICAL_SYMPTOM_DATA)}")
        print(f"Warning signs: {len(WARNING_SIGN_DATA)}")
        print(f"Vitals: {len(VITAL_DATA)}")
        print(f"User timelines: {len(USER_TIMELINE_DATA)}")
        print(f"User insights: {len(USER_INSIGHTS_DATA)}")
        print(f"User histories: {len(USER_HISTORY_DATA)}")
        print("Health score: 1")

    except Exception as e:
        print(f"Error seeding data: {e}")

if __name__ == "__main__":
    seed_static_data()