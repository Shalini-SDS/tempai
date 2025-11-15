# controllers/user_data_controller.py
from flask import Blueprint, request, jsonify
from models.user_model import User
from controllers.auth_controller import token_required
from config.db_config import db
from bson.json_util import dumps
import datetime

user_data_bp = Blueprint('user_data_bp', __name__)

@user_data_bp.route('/api/user/timeline', methods=['GET'])
@token_required
def get_user_timeline(current_user_id):
    """Get user's health timeline from sensor data"""
    try:
        readings = list(db.sensor_data.find({}, {"_id": 0}).sort("timestamp", -1).limit(20))
        
        timeline = []
        for reading in readings:
            timestamp = reading.get('timestamp')
            temperature = reading.get('temperature')
            humidity = reading.get('humidity')
            
            if timestamp and temperature is not None:
                dt = timestamp if isinstance(timestamp, datetime.datetime) else datetime.datetime.fromisoformat(str(timestamp))
                time_str = dt.strftime("%b %d • %I:%M %p")
                
                temp_status = "High fever" if temperature >= 39 else "Moderate fever" if temperature >= 37.5 else "Normal"
                summary = f"Temperature: {temperature}°C - {temp_status}"
                if humidity is not None:
                    summary += f", Humidity: {humidity}%"
                
                timeline.append({
                    "time": time_str,
                    "temperature": f"{temperature}°C",
                    "summary": summary
                })
        
        return jsonify(timeline), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch timeline", "details": str(e)}), 500

@user_data_bp.route('/api/user/insights-history', methods=['GET'])
@token_required
def get_user_insights_history(current_user_id):
    """Get user's insights history"""
    try:
        insights = list(db.user_insights.find({}, {"_id": 0}))
        return jsonify(insights), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch insights history", "details": str(e)}), 500

@user_data_bp.route('/api/user/history-records', methods=['GET'])
@token_required
def get_user_history_records(current_user_id):
    """Get user's fever episode history"""
    try:
        history = list(db.user_histories.find({}, {"_id": 0}))
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch history records", "details": str(e)}), 500

@user_data_bp.route('/api/user/health-summary', methods=['GET'])
@token_required
def get_user_health_summary(current_user_id):
    """Get user's health summary data"""
    try:
        user = User.get_user_by_id(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        latest_reading = db.sensor_data.find().sort("timestamp", -1).limit(1)
        readings = list(latest_reading)

        summary = {
            "user_name": user.get('name', ''),
            "latest_temperature": readings[0]['temperature'] if readings else None,
            "total_readings": len(user.get('readings', [])),
            "last_updated": readings[0]['timestamp'].isoformat() if readings else None
        }

        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch health summary", "details": str(e)}), 500


@user_data_bp.route('/api/user/dynamic-insights', methods=['GET'])
@token_required
def get_dynamic_insights(current_user_id):
    """Generate dynamic insights based on current temperature and trends"""
    try:
        readings = list(db.sensor_data.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
        
        if not readings:
            return jsonify({"severity": [], "comparison": "", "tips": []}), 200
        
        latest_temp = readings[0].get('temperature', 37)
        latest_timestamp = readings[0].get('timestamp', datetime.datetime.utcnow())
        
        prev_temp = readings[1].get('temperature', 37) if len(readings) > 1 else latest_temp
        temp_trend = latest_temp - prev_temp
        
        avg_temp = sum(r.get('temperature', 0) for r in readings) / len(readings)
        max_temp = max(r.get('temperature', 0) for r in readings)
        
        severity_data = []
        if latest_temp >= 40:
            severity_data = [
                {"label": "Critical Fever", "value": 85, "description": "Very high temperature"},
                {"label": "Likely Severe Infection", "value": 70, "description": "Requires immediate attention"},
                {"label": "Possible Malaria", "value": 45, "description": "High fever pattern"},
                {"label": "Other Complications", "value": 30, "description": "Monitor closely"}
            ]
        elif latest_temp >= 39:
            severity_data = [
                {"label": "Viral Infection", "value": 75, "description": "Common viral illness"},
                {"label": "Bacterial Infection", "value": 60, "description": "Possible bacterial fever"},
                {"label": "Dengue Risk", "value": 35, "description": "High fever with symptoms"},
                {"label": "Malaria Risk", "value": 25, "description": "Monitor for pattern"}
            ]
        elif latest_temp >= 38:
            severity_data = [
                {"label": "Moderate Fever", "value": 65, "description": "Common viral infection"},
                {"label": "Flu-like Illness", "value": 55, "description": "Seasonal infection"},
                {"label": "Minor Infection", "value": 40, "description": "Usually self-limiting"},
                {"label": "Other Causes", "value": 20, "description": "Non-infectious causes"}
            ]
        else:
            severity_data = [
                {"label": "Mild Fever", "value": 40, "description": "Low-grade fever"},
                {"label": "Recovery Phase", "value": 75, "description": "Improving condition"},
                {"label": "Stable Condition", "value": 60, "description": "No significant change"},
                {"label": "Return to Normal", "value": 50, "description": "Approaching normal"}
            ]
        
        temp_change = f"{abs(temp_trend):.1f}°C"
        if temp_trend > 0:
            comparison = f"Current temperature is {temp_change} higher than last reading. Temperature increasing. Monitor closely and seek medical attention if it continues to rise."
        elif temp_trend < 0:
            comparison = f"Current temperature is {temp_change} lower than last reading. Good sign of recovery. Continue treatment and monitor."
        else:
            comparison = "Temperature remains stable. Continue current treatment plan and monitor for any changes."
        
        tips = []
        if latest_temp >= 40:
            tips = [
                "🚨 Temperature critically high - seek immediate medical attention",
                "Drink plenty of fluids to stay hydrated",
                "Cool sponging or cold compresses may help reduce fever",
                "Take antipyretics as prescribed by doctor",
                "Monitor for warning signs: severe headache, confusion, difficulty breathing"
            ]
        elif latest_temp >= 39:
            tips = [
                f"High fever detected ({latest_temp}°C). Consider consulting a doctor.",
                "Stay well hydrated - drink water, electrolyte solutions, or herbal teas",
                "Rest adequately to allow body to fight infection",
                "Take fever-reducing medication every 6 hours if needed",
                "Monitor temperature trends and maintain records"
            ]
        elif latest_temp >= 38:
            tips = [
                f"Moderate fever detected ({latest_temp}°C). Monitor closely.",
                "Increase fluid intake to prevent dehydration",
                "Get adequate rest - aim for 8-10 hours of sleep",
                "Avoid strenuous activities until fever subsides",
                "Watch for additional symptoms that may require medical attention"
            ]
        else:
            tips = [
                f"Temperature returning to normal ({latest_temp}°C) - good progress!",
                "Continue current care routine to maintain recovery",
                "Gradually increase physical activity as you feel better",
                "Maintain adequate nutrition and hydration",
                "Monitor temperature for next 24-48 hours to confirm full recovery"
            ]
        
        return jsonify({
            "severity": severity_data,
            "comparison": comparison,
            "tips": tips,
            "latest_temperature": latest_temp,
            "average_temperature": round(avg_temp, 1),
            "max_temperature": max_temp
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch insights", "details": str(e)}), 500