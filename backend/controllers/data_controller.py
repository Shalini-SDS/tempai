# controllers/data_controller.py
from flask import Blueprint, jsonify

data_bp = Blueprint('data_bp', __name__)

# Static data that was previously hardcoded in frontend
SYMPTOM_OPTIONS = [
    'Headache',
    'Fatigue',
    'Sore throat',
    'Rash',
    'Cough',
    'Body ache',
    'Nausea',
    'Chills',
]

RECOMMENDATIONS = [
    { "title": "Stay Hydrated", "detail": "Drink water, herbal tea, or electrolyte solutions." },
    { "title": "Rest Adequately", "detail": "Aim for 8-10 hours of sleep to aid recovery." },
    { "title": "Take Paracetamol", "detail": "Take 500mg every 6 hours if temperature exceeds 38°C." },
    { "title": "Monitor Temperature", "detail": "Consult a doctor if fever persists beyond 3 days." },
]

SEVERITY_PROBABILITIES = [
    { "label": "Viral", "value": 85 },
    { "label": "Bacterial", "value": 40 },
    { "label": "Dengue", "value": 20 },
    { "label": "Malaria", "value": 10 },
]

EMERGENCY_CONTACTS = [
    { "label": "Emergency Services", "value": "911", "type": "primary" },
    { "label": "Family Doctor", "value": "+1 (555) 123-4567", "type": "secondary" },
    { "label": "Emergency Contact", "value": "+1 (555) 987-6543", "type": "secondary" },
]

NEARBY_FACILITIES = [
    { "name": "City General Hospital", "distance": "1.2 km", "eta": "5 min" },
    { "name": "Metro Medical Center", "distance": "2.8 km", "eta": "10 min" },
    { "name": "Community Health Clinic", "distance": "3.5 km", "eta": "12 min" },
]

CRITICAL_SYMPTOMS = [
    "Temperature above 40°C (104°F)",
    "Severe headache or stiff neck",
    "Difficulty breathing",
    "Persistent vomiting"
]

WARNING_SIGNS = [
    "Confusion or altered consciousness",
    "Rapid heartbeat or chest pain",
    "Rash with purple spots",
    "Seizures or convulsions"
]

CURRENT_VITALS = [
    { "label": "Heart Rate", "value": "78 bpm" },
    { "label": "Blood Pressure", "value": "120/80" },
    { "label": "Oxygen Level", "value": "98 %" },
    { "label": "Respiratory Rate", "value": "16 /min" },
]

@data_bp.route('/api/data/symptoms', methods=['GET'])
def get_symptoms():
    """Get available symptom options"""
    return jsonify(SYMPTOM_OPTIONS), 200

@data_bp.route('/api/data/recommendations', methods=['GET'])
def get_recommendations():
    """Get general health recommendations"""
    return jsonify(RECOMMENDATIONS), 200

@data_bp.route('/api/data/severity-probabilities', methods=['GET'])
def get_severity_probabilities():
    """Get severity probability data"""
    return jsonify(SEVERITY_PROBABILITIES), 200

@data_bp.route('/api/data/emergency-contacts', methods=['GET'])
def get_emergency_contacts():
    """Get emergency contact information"""
    return jsonify(EMERGENCY_CONTACTS), 200

@data_bp.route('/api/data/nearby-facilities', methods=['GET'])
def get_nearby_facilities():
    """Get nearby medical facilities"""
    return jsonify(NEARBY_FACILITIES), 200

@data_bp.route('/api/data/critical-symptoms', methods=['GET'])
def get_critical_symptoms():
    """Get critical symptoms list"""
    return jsonify(CRITICAL_SYMPTOMS), 200

@data_bp.route('/api/data/warning-signs', methods=['GET'])
def get_warning_signs():
    """Get warning signs list"""
    return jsonify(WARNING_SIGNS), 200

@data_bp.route('/api/data/current-vitals', methods=['GET'])
def get_current_vitals():
    """Get current vitals data"""
    return jsonify(CURRENT_VITALS), 200