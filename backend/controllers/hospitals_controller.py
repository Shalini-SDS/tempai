import requests
from flask import Blueprint, request, jsonify
import math

hospitals_bp = Blueprint('hospitals_bp', __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula"""
    R = 6371
    d_lat = (lat2 - lat1) * math.pi / 180
    d_lon = (lon2 - lon1) * math.pi / 180
    a = (
        math.sin(d_lat / 2) * math.sin(d_lat / 2) +
        math.cos(lat1 * math.pi / 180) * math.cos(lat2 * math.pi / 180) *
        math.sin(d_lon / 2) * math.sin(d_lon / 2)
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def estimate_eta(distance_km):
    """Estimate ETA based on distance"""
    avg_speed = 40
    minutes = round((distance_km / avg_speed) * 60)
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours}h {mins}m" if hours > 0 else f"{mins}m"

@hospitals_bp.route('/api/hospitals/nearby', methods=['GET'])
def get_nearby_hospitals():
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        radius = request.args.get('radius', 5000, type=int)
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return jsonify({'error': 'Latitude and longitude must be valid numbers'}), 400
        
        radius_km = radius / 1000
        
        overpass_query = f"""
        [bbox:{float(lng) - (radius_km / 111)},{float(lat) - (radius_km / 111)},{float(lng) + (radius_km / 111)},{float(lat) + (radius_km / 111)}];
        (
          node["amenity"="hospital"];
          way["amenity"="hospital"];
          relation["amenity"="hospital"];
        );
        out center;
        """
        
        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data=overpass_query,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=15
        )
        
        if response.status_code != 200:
            return jsonify({
                'success': True,
                'count': 0,
                'message': 'No hospitals found',
                'data': []
            }), 200
        
        data = response.json()
        
        if not data.get('elements'):
            return jsonify({
                'success': True,
                'count': 0,
                'message': 'No hospitals found in the specified radius',
                'data': []
            }), 200
        
        hospitals = []
        for element in data['elements']:
            if element.get('center') or (element.get('lat') and element.get('lon')):
                hosp_lat = element.get('center', {}).get('lat') or element.get('lat')
                hosp_lon = element.get('center', {}).get('lon') or element.get('lon')
                
                distance = calculate_distance(lat, lng, hosp_lat, hosp_lon)
                tags = element.get('tags', {})
                
                hospitals.append({
                    'name': tags.get('name', 'Unknown Hospital'),
                    'address': f"{tags.get('addr:street', '')}, {tags.get('addr:city', '')}".strip(', '),
                    'distance': f"{distance} km",
                    'eta': estimate_eta(distance),
                    'coordinates': {
                        'lat': hosp_lat,
                        'lng': hosp_lon
                    },
                    'type': tags.get('healthcare:speciality', 'General Hospital'),
                    'phone': tags.get('contact:phone', 'N/A'),
                    'website': tags.get('website', 'N/A'),
                    'beds': tags.get('beds:number', 'Not available')
                })
        
        hospitals.sort(key=lambda x: float(x['distance'].split()[0]))
        
        return jsonify({
            'success': True,
            'count': len(hospitals),
            'userLocation': {'lat': lat, 'lng': lng},
            'data': hospitals,
            'note': 'Data from OpenStreetMap (free & open source)'
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({
            'success': True,
            'count': 0,
            'message': 'Request timeout - please try again',
            'data': []
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch hospitals',
            'details': str(e)
        }), 500

@hospitals_bp.route('/api/hospitals/ambulances/nearby', methods=['GET'])
def get_nearby_ambulances():
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        radius = request.args.get('radius', 2000, type=int)
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return jsonify({'error': 'Latitude and longitude must be valid numbers'}), 400
        
        radius_km = radius / 1000
        
        overpass_query = f"""
        [bbox:{float(lng) - (radius_km / 111)},{float(lat) - (radius_km / 111)},{float(lng) + (radius_km / 111)},{float(lat) + (radius_km / 111)}];
        (
          node["amenity"="ambulance_station"];
          way["amenity"="ambulance_station"];
          relation["amenity"="ambulance_station"];
        );
        out center;
        """
        
        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data=overpass_query,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=15
        )
        
        if response.status_code != 200:
            return jsonify({
                'success': True,
                'count': 0,
                'message': 'No ambulance stations found',
                'data': []
            }), 200
        
        data = response.json()
        
        if not data.get('elements'):
            return jsonify({
                'success': True,
                'count': 0,
                'message': 'No ambulance stations found in the specified radius',
                'data': []
            }), 200
        
        ambulances = []
        for element in data['elements']:
            if element.get('center') or (element.get('lat') and element.get('lon')):
                amb_lat = element.get('center', {}).get('lat') or element.get('lat')
                amb_lon = element.get('center', {}).get('lon') or element.get('lon')
                
                distance = calculate_distance(lat, lng, amb_lat, amb_lon)
                tags = element.get('tags', {})
                
                ambulances.append({
                    'name': tags.get('name', 'Ambulance Station'),
                    'address': f"{tags.get('addr:street', '')}, {tags.get('addr:city', '')}".strip(', '),
                    'distance': f"{distance} km",
                    'eta': estimate_eta(distance),
                    'coordinates': {
                        'lat': amb_lat,
                        'lng': amb_lon
                    },
                    'phone': tags.get('contact:phone', 'N/A'),
                    'operator': tags.get('operator', 'Not specified')
                })
        
        ambulances.sort(key=lambda x: float(x['distance'].split()[0]))
        
        return jsonify({
            'success': True,
            'count': len(ambulances),
            'data': ambulances,
            'note': 'Data from OpenStreetMap (free & open source)'
        }), 200
        
    except requests.exceptions.Timeout:
        return jsonify({
            'success': True,
            'count': 0,
            'message': 'Request timeout - please try again',
            'data': []
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch ambulances',
            'details': str(e)
        }), 500
