# controllers/sensor_controller.py
from flask import Blueprint, request, jsonify
from config.db_config import db
from models.sensor_model import create_sensor_doc, validate_sensor_doc
from utils.helpers import now_iso
from bson.json_util import dumps
from bson.objectid import ObjectId
import datetime

sensor_bp = Blueprint('sensor_bp', __name__)

# POST: receive data from IoT device
@sensor_bp.route('/api/uploadData', methods=['POST'])
def upload_data():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON payload received"}), 400

        # Basic validation & normalization
        is_valid, msg = validate_sensor_doc(data)
        if not is_valid:
            return jsonify({"error": "Invalid payload", "details": msg}), 400

        doc = create_sensor_doc(data)
        doc['timestamp'] = datetime.datetime.utcnow()
        result = db.sensor_data.insert_one(doc)

        return jsonify({
            "message": "Data saved successfully",
            "inserted_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"error": "Failed to save data", "details": str(e)}), 500


# GET: latest reading
@sensor_bp.route('/api/latestData', methods=['GET'])
def get_latest_data():
    try:
        doc = db.sensor_data.find().sort("timestamp", -1).limit(1)
        docs = list(doc)
        if not docs:
            return jsonify({}), 200
        # dumps produces JSON-friendly output for ObjectId/Date
        return dumps(docs[0]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch latest data", "details": str(e)}), 500


# GET: historical data, optional query params: limit, from, to (ISO dates)
@sensor_bp.route('/api/history', methods=['GET'])
def get_history():
    try:
        # parse query params
        limit = int(request.args.get('limit', 100))
        from_ts = request.args.get('from', None)
        to_ts = request.args.get('to', None)

        query = {}
        if from_ts:
            try:
                query['timestamp'] = {"$gte": datetime.datetime.fromisoformat(from_ts)}
            except Exception:
                return jsonify({"error": "Invalid 'from' datetime format. Use ISO format."}), 400
        if to_ts:
            try:
                t = datetime.datetime.fromisoformat(to_ts)
                if 'timestamp' in query:
                    query['timestamp']['$lte'] = t
                else:
                    query['timestamp'] = {"$lte": t}
            except Exception:
                return jsonify({"error": "Invalid 'to' datetime format. Use ISO format."}), 400

        cursor = db.sensor_data.find(query).sort("timestamp", -1).limit(limit)
        docs = list(cursor)
        return dumps(docs), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch history", "details": str(e)}), 500
