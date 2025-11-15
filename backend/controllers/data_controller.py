# controllers/data_controller.py
from flask import Blueprint, jsonify
from config.db_config import db
from bson.json_util import dumps

data_bp = Blueprint('data_bp', __name__)

@data_bp.route('/api/data/symptoms', methods=['GET'])
def get_symptoms():
    """Get available symptom options"""
    try:
        symptoms = list(db.symptoms.find({}, {"_id": 0}))
        symptom_names = [s["name"] for s in symptoms]
        return jsonify(symptom_names), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch symptoms", "details": str(e)}), 500

@data_bp.route('/api/data/recommendations', methods=['GET'])
def get_recommendations():
    """Get general health recommendations"""
    try:
        recommendations = list(db.recommendations.find({}, {"_id": 0}))
        return jsonify(recommendations), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch recommendations", "details": str(e)}), 500

@data_bp.route('/api/data/severity-probabilities', methods=['GET'])
def get_severity_probabilities():
    """Get severity probability data"""
    try:
        severity_data = list(db.severity_probabilities.find({}, {"_id": 0}))
        return jsonify(severity_data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch severity probabilities", "details": str(e)}), 500

@data_bp.route('/api/data/emergency-contacts', methods=['GET'])
def get_emergency_contacts():
    """Get emergency contact information"""
    try:
        contacts = list(db.emergency_contacts.find({}, {"_id": 0}))
        return jsonify(contacts), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch emergency contacts", "details": str(e)}), 500

@data_bp.route('/api/data/nearby-facilities', methods=['GET'])
def get_nearby_facilities():
    """Get nearby medical facilities"""
    try:
        facilities = list(db.facilities.find({}, {"_id": 0}))
        return jsonify(facilities), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch nearby facilities", "details": str(e)}), 500

@data_bp.route('/api/data/critical-symptoms', methods=['GET'])
def get_critical_symptoms():
    """Get critical symptoms list"""
    try:
        symptoms = list(db.critical_symptoms.find({}, {"_id": 0}))
        symptom_list = [s["symptom"] for s in symptoms]
        return jsonify(symptom_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch critical symptoms", "details": str(e)}), 500

@data_bp.route('/api/data/warning-signs', methods=['GET'])
def get_warning_signs():
    """Get warning signs list"""
    try:
        signs = list(db.warning_signs.find({}, {"_id": 0}))
        sign_list = [s["sign"] for s in signs]
        return jsonify(sign_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch warning signs", "details": str(e)}), 500

@data_bp.route('/api/data/current-vitals', methods=['GET'])
def get_current_vitals():
    """Get current vitals data"""
    try:
        vitals = list(db.vitals.find({}, {"_id": 0}))
        return jsonify(vitals), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch current vitals", "details": str(e)}), 500

@data_bp.route('/api/data/health-score', methods=['GET'])
def get_health_score():
    """Get health score data"""
    try:
        health_score = db.health_score.find_one({}, {"_id": 0})
        return jsonify(health_score), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch health score", "details": str(e)}), 500