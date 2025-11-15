import axios from 'axios';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2);
};

const estimateETA = (distanceKm) => {
  const avgSpeed = 40;
  const minutes = Math.round((distanceKm / avgSpeed) * 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const getNearbyHospitals = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: 'Latitude and longitude must be valid numbers'
      });
    }

    const radiusKm = parseInt(radius) / 1000;
    const overpassQuery = `
      [bbox:${parseFloat(lng) - (radiusKm / 111)},${parseFloat(lat) - (radiusKm / 111)},${parseFloat(lng) + (radiusKm / 111)},${parseFloat(lat) + (radiusKm / 111)}];
      (
        node["amenity"="hospital"];
        way["amenity"="hospital"];
        relation["amenity"="hospital"];
      );
      out center;
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.data.elements || response.data.elements.length === 0) {
      return res.status(404).json({
        success: true,
        count: 0,
        message: 'No hospitals found in the specified radius',
        data: []
      });
    }

    const hospitals = response.data.elements
      .filter(el => el.center || (el.lat && el.lon))
      .map((hospital) => {
        const hospitalLat = hospital.center?.lat || hospital.lat;
        const hospitalLon = hospital.center?.lon || hospital.lon;
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          hospitalLat,
          hospitalLon
        );

        return {
          name: hospital.tags?.name || 'Unknown Hospital',
          address: hospital.tags?.['addr:street'] 
            ? `${hospital.tags['addr:street']}, ${hospital.tags['addr:city'] || ''}`
            : 'Address not available',
          distance: `${distance} km`,
          eta: estimateETA(distance),
          coordinates: {
            lat: hospitalLat,
            lng: hospitalLon
          },
          type: hospital.tags?.['healthcare:speciality'] || 'General Hospital',
          phone: hospital.tags?.['contact:phone'] || 'N/A',
          website: hospital.tags?.website || 'N/A',
          operatorType: hospital.tags?.operator || 'Not specified',
          beds: hospital.tags?.['beds:number'] || 'Not available'
        };
      })
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    res.status(200).json({
      success: true,
      count: hospitals.length,
      userLocation: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      data: hospitals,
      note: 'Data from OpenStreetMap (free & open source)'
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalDetails = async (req, res, next) => {
  try {
    const { lat, lng, name } = req.query;

    if (!lat || !lng || !name) {
      return res.status(400).json({
        error: 'lat, lng, and name are required'
      });
    }

    const overpassQuery = `
      [bbox:${parseFloat(lng) - 0.01},${parseFloat(lat) - 0.01},${parseFloat(lng) + 0.01},${parseFloat(lat) + 0.01}];
      (
        node["amenity"="hospital"]["name"="${name}"];
        way["amenity"="hospital"]["name"="${name}"];
        relation["amenity"="hospital"]["name"="${name}"];
      );
      out center;
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.data.elements || response.data.elements.length === 0) {
      return res.status(404).json({
        error: 'Hospital details not found'
      });
    }

    const hospital = response.data.elements[0];

    res.status(200).json({
      success: true,
      data: {
        name: hospital.tags?.name || 'Unknown',
        address: `${hospital.tags?.['addr:street'] || ''}, ${hospital.tags?.['addr:city'] || ''}`,
        phone: hospital.tags?.['contact:phone'] || 'N/A',
        website: hospital.tags?.website || 'N/A',
        type: hospital.tags?.['healthcare:speciality'] || 'General Hospital',
        operatorType: hospital.tags?.operator || 'Not specified',
        beds: hospital.tags?.['beds:number'] || 'Not available',
        coordinates: {
          lat: hospital.center?.lat || hospital.lat,
          lng: hospital.center?.lon || hospital.lon
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyAmbulances = async (req, res, next) => {
  try {
    const { lat, lng, radius = 2000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const radiusKm = parseInt(radius) / 1000;
    const overpassQuery = `
      [bbox:${parseFloat(lng) - (radiusKm / 111)},${parseFloat(lat) - (radiusKm / 111)},${parseFloat(lng) + (radiusKm / 111)},${parseFloat(lat) + (radiusKm / 111)}];
      (
        node["amenity"="ambulance_station"];
        way["amenity"="ambulance_station"];
        relation["amenity"="ambulance_station"];
      );
      out center;
    `;

    const response = await axios.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.data.elements || response.data.elements.length === 0) {
      return res.status(404).json({
        success: true,
        count: 0,
        message: 'No ambulance stations found in the specified radius',
        data: []
      });
    }

    const ambulances = response.data.elements
      .filter(el => el.center || (el.lat && el.lon))
      .map((ambulance) => {
        const ambLat = ambulance.center?.lat || ambulance.lat;
        const ambLon = ambulance.center?.lon || ambulance.lon;
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          ambLat,
          ambLon
        );

        return {
          name: ambulance.tags?.name || 'Ambulance Station',
          address: ambulance.tags?.['addr:street'] 
            ? `${ambulance.tags['addr:street']}, ${ambulance.tags['addr:city'] || ''}`
            : 'Address not available',
          distance: `${distance} km`,
          eta: estimateETA(distance),
          coordinates: {
            lat: ambLat,
            lng: ambLon
          },
          phone: ambulance.tags?.['contact:phone'] || 'N/A',
          operator: ambulance.tags?.operator || 'Not specified'
        };
      })
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    res.status(200).json({
      success: true,
      count: ambulances.length,
      data: ambulances,
      note: 'Data from OpenStreetMap (free & open source)'
    });
  } catch (error) {
    next(error);
  }
};
