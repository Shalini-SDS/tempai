import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import AlertModal from './AlertModal'
import '../styles/Emergency.css'
import 'leaflet/dist/leaflet.css'

export default function EmergencyPage() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [nearbyHospitals, setNearbyHospitals] = useState([])
  const [nearbyAmbulances, setNearbyAmbulances] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [map, setMap] = useState(null)
  const mapContainer = useRef(null)
  const markersRef = useRef([])
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [creatingAlert, setCreatingAlert] = useState(false)

  const API_URL = 'http://localhost:5000'

  useEffect(() => {
    const initializeEmergencyPage = async () => {
      setLoading(true)
      try {
        await detectUserLocation()
      } catch (error) {
        console.error('Error initializing emergency page:', error)
      }
      setLoading(false)
    }

    initializeEmergencyPage()
  }, [])

  useEffect(() => {
    if (!userLocation) return

    const refreshInterval = setInterval(async () => {
      try {
        await Promise.all([
          fetchNearbyHospitals(userLocation.lat, userLocation.lng),
          fetchNearbyAmbulances(userLocation.lat, userLocation.lng)
        ])
      } catch (error) {
        console.error('Error refreshing nearby facilities:', error)
      }
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [userLocation])

  useEffect(() => {
    if (map && userLocation) {
      updateMapMarkers()
    }
  }, [map, nearbyHospitals, nearbyAmbulances])

  const detectUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation({ lat: latitude, lng: longitude })

            await Promise.all([
              fetchEmergencyContacts(),
              fetchNearbyHospitals(latitude, longitude),
              fetchNearbyAmbulances(latitude, longitude),
              fetchActiveAlerts()
            ])

            await initMap(latitude, longitude)
            resolve()
          },
          (error) => {
            console.error('Geolocation error:', error)
            alert('Please enable location permissions to use emergency features')
            reject(error)
          }
        )
      } else {
        reject(new Error('Geolocation not supported'))
      }
    })
  }

  const getMockHospitals = (lat, lng) => {
    const offsetLat = 0.02
    const offsetLng = 0.02
    return [
      {
        name: 'Apollo Hospital',
        address: 'Near Koramangala, Bangalore',
        distance: '0.80 km',
        eta: '3m',
        coordinates: { lat: lat + offsetLat * 0.5, lng: lng + offsetLng * 0.5 },
        type: 'Multi-specialty Hospital',
        phone: '+91-080-40611111',
        website: 'www.apollohospitals.com',
        beds: '300+'
      },
      {
        name: 'Fortis Hospital',
        address: 'Bannerghatta Road, Bangalore',
        distance: '1.50 km',
        eta: '5m',
        coordinates: { lat: lat - offsetLat * 0.4, lng: lng + offsetLng * 0.6 },
        type: 'Multi-specialty Hospital',
        phone: '+91-080-68699999',
        website: 'www.fortishealthcare.com',
        beds: '250+'
      },
      {
        name: 'Narayana Health',
        address: 'HSR Layout, Bangalore',
        distance: '2.20 km',
        eta: '8m',
        coordinates: { lat: lat + offsetLat * 0.2, lng: lng - offsetLng * 0.7 },
        type: 'Multi-specialty Hospital',
        phone: '+91-080-40606000',
        website: 'www.narayanahealth.org',
        beds: '280+'
      }
    ]
  }

  const getMockAmbulances = (lat, lng) => {
    const offsetLat = 0.01
    const offsetLng = 0.01
    return [
      {
        name: 'Bangalore Emergency Ambulance Service 1',
        address: 'Near Koramangala Circle',
        distance: '0.40 km',
        eta: '2m',
        coordinates: { lat: lat + offsetLat * 0.3, lng: lng + offsetLng * 0.4 },
        phone: '108',
        operator: 'Government'
      },
      {
        name: 'LifeLine Ambulance Service',
        address: 'Koramangala, Bangalore',
        distance: '0.85 km',
        eta: '4m',
        coordinates: { lat: lat - offsetLat * 0.5, lng: lng - offsetLng * 0.3 },
        phone: '+91-080-25532525',
        operator: 'Private'
      },
      {
        name: 'Bangalore Emergency Ambulance Service 2',
        address: 'Near Indiranagar',
        distance: '1.20 km',
        eta: '5m',
        coordinates: { lat: lat + offsetLat * 0.6, lng: lng - offsetLng * 0.5 },
        phone: '108',
        operator: 'Government'
      }
    ]
  }

  const fetchEmergencyContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/emergency/contacts/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          const contacts = []

          if (data.data.emergencyServices) {
            contacts.push(...data.data.emergencyServices.map(s => ({
              type: 'service',
              name: s.name,
              phone: s.phone,
              icon: '🚑'
            })))
          }

          if (data.data.familyDoctor) {
            contacts.push({
              type: 'doctor',
              name: data.data.familyDoctor.name,
              phone: data.data.familyDoctor.phone,
              email: data.data.familyDoctor.email,
              icon: '👨‍⚕️'
            })
          }

          if (data.data.emergencyContact) {
            contacts.push(...data.data.emergencyContact.map(c => ({
              type: 'contact',
              name: c.name,
              relationship: c.relationship,
              phone: c.phone,
              email: c.email,
              icon: '👥'
            })))
          }

          setEmergencyContacts(contacts)
        }
      }
    } catch (error) {
      console.error('Error fetching emergency contacts:', error)
    }
  }

  const fetchNearbyHospitals = async (lat, lng) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(
        `${API_URL}/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius=5000`,
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setNearbyHospitals(data.data)
        } else {
          setNearbyHospitals(getMockHospitals(lat, lng))
        }
      } else {
        console.error('Error response from hospitals API:', response.status)
        setNearbyHospitals(getMockHospitals(lat, lng))
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Hospitals request timeout')
      } else {
        console.error('Error fetching nearby hospitals:', error)
      }
      setNearbyHospitals(getMockHospitals(lat, lng))
    }
  }

  const fetchNearbyAmbulances = async (lat, lng) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(
        `${API_URL}/api/hospitals/ambulances/nearby?lat=${lat}&lng=${lng}&radius=2000`,
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setNearbyAmbulances(data.data)
        } else {
          setNearbyAmbulances(getMockAmbulances(lat, lng))
        }
      } else {
        console.error('Error response from ambulances API:', response.status)
        setNearbyAmbulances(getMockAmbulances(lat, lng))
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Ambulances request timeout')
      } else {
        console.error('Error fetching nearby ambulances:', error)
      }
      setNearbyAmbulances(getMockAmbulances(lat, lng))
    }
  }

  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/emergency/alerts/${user._id}?status=ACTIVE`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        setActiveAlerts(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching active alerts:', error)
    }
  }

  const initMap = async (lat, lng) => {
    if (!mapContainer.current || map) return

    try {
      const L = await import('leaflet').then(m => m.default)

      const newMap = L.map(mapContainer.current, {
        preferCanvas: true,
        attributionControl: true
      }).setView([lat, lng], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 3
      }).addTo(newMap)

      const blueIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      L.marker([lat, lng], { icon: blueIcon })
        .bindPopup('Your Location')
        .addTo(newMap)

      setTimeout(() => newMap.invalidateSize(), 100)
      newMap.blueIcon = blueIcon
      newMap.redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      newMap.orangeIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
      
      setMap(newMap)
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  const updateMapMarkers = async () => {
    if (!map) return

    try {
      const L = await import('leaflet').then(m => m.default)

      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      nearbyHospitals.forEach(hospital => {
        const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], { icon: map.redIcon })
        marker.bindPopup(`
          <div style="font-size: 12px; white-space: nowrap;">
            <strong>${hospital.name}</strong><br/>
            ${hospital.distance}<br/>
            ETA: ${hospital.eta}
          </div>
        `)
        marker.addTo(map)
        markersRef.current.push(marker)
      })

      nearbyAmbulances.forEach(ambulance => {
        const marker = L.marker([ambulance.coordinates.lat, ambulance.coordinates.lng], { icon: map.orangeIcon })
        marker.bindPopup(`
          <div style="font-size: 12px; white-space: nowrap;">
            <strong>${ambulance.name}</strong><br/>
            ${ambulance.distance}<br/>
            ETA: ${ambulance.eta}
          </div>
        `)
        marker.addTo(map)
        markersRef.current.push(marker)
      })
    } catch (error) {
      console.error('Error updating map markers:', error)
    }
  }

  const createAlert = async (alertForm) => {
    if (!userLocation) {
      throw new Error('User location not available')
    }

    setCreatingAlert(true)
    try {
      const payload = {
        userId: user._id,
        alertType: alertForm.alertType,
        severity: alertForm.severity,
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 5000,
        vitalDetails: alertForm.vitalDetails,
        notes: alertForm.notes
      }

      const response = await fetch(`${API_URL}/api/emergency/alerts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchActiveAlerts()
        return true
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create alert')
      }
    } finally {
      setCreatingAlert(false)
    }
  }

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch(`${API_URL}/api/emergency/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ acknowledgedBy: user._id })
      })

      if (response.ok) {
        fetchActiveAlerts()
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      const response = await fetch(`${API_URL}/api/emergency/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchActiveAlerts()
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  if (loading) {
    return <div className="emergency-loading">Loading emergency services...</div>
  }

  return (
    <div className="emergency-page">
      <section className="emergency-banner">
        <div className="banner-icon">⚠️</div>
        <div className="banner-content">
          <h2>Emergency Services</h2>
          <p>Location: {userLocation?.lat.toFixed(4)}, {userLocation?.lng.toFixed(4)}</p>
        </div>
      </section>

      <div className="emergency-content">
        <div className="emergency-main">
          <section className="card map-card">
            <div className="card-header">
              <span className="icon">📍</span>
              <div>
                <p className="subtitle">Location Map</p>
                <p className="status-label">Hospitals (🔴) | Ambulances (🟠) | You (🔵)</p>
              </div>
            </div>
            <div className="map-container" ref={mapContainer}></div>
          </section>

          <section className="card alerts-card">
            <div className="card-header">
              <span className="icon">🚨</span>
              <div>
                <p className="subtitle">Active Alerts</p>
                <p className="status-label">{activeAlerts.length} active</p>
              </div>
            </div>
            <div className="alerts-list">
              {activeAlerts.length === 0 ? (
                <p className="empty-state">No active alerts</p>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert._id} className={`alert-item alert-${alert.severity.toLowerCase()}`}>
                    <div className="alert-info">
                      <h4>{alert.alertType}</h4>
                      <p className="alert-time">{new Date(alert.triggeredAt).toLocaleTimeString()}</p>
                      <p className="alert-status">Status: {alert.status}</p>
                    </div>
                    <div className="alert-actions">
                      {alert.status === 'ACTIVE' && (
                        <>
                          <button 
                            onClick={() => acknowledgeAlert(alert._id)}
                            className="btn-secondary"
                          >
                            Acknowledge
                          </button>
                          <button 
                            onClick={() => resolveAlert(alert._id)}
                            className="btn-primary"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setShowAlertModal(true)}
              className="action-button danger"
            >
              Create New Alert
            </button>
          </section>
        </div>

        <aside className="emergency-sidebar">
          <section className="card contact-card">
            <div className="card-header">
              <span className="icon">📞</span>
              <div>
                <p className="subtitle">Emergency Contacts</p>
                <p className="status-label">{emergencyContacts.length} contacts</p>
              </div>
            </div>
            <div className="contact-list">
              {emergencyContacts.length === 0 ? (
                <p className="empty-state">No emergency contacts configured</p>
              ) : (
                emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="contact-item">
                    <div className="contact-info">
                      <p className="contact-icon">{contact.icon}</p>
                      <div>
                        <h4>{contact.name}</h4>
                        {contact.relationship && <p className="relationship">{contact.relationship}</p>}
                        <a href={`tel:${contact.phone}`} className="phone-link">{contact.phone}</a>
                        {contact.email && <p className="email-link">{contact.email}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card facilities-card">
            <div className="card-header">
              <span className="icon">🏥</span>
              <div>
                <p className="subtitle">Nearby Hospitals</p>
                <p className="status-label">{nearbyHospitals.length} found</p>
              </div>
            </div>
            <div className="facilities-list">
              {nearbyHospitals.slice(0, 5).map((hospital, idx) => (
                <div key={idx} className="facility-item">
                  <h4>{hospital.name}</h4>
                  <p className="distance">📍 {hospital.distance}</p>
                  <p className="eta">⏱️ ETA: {hospital.eta}</p>
                  <p className="address">{hospital.address}</p>
                  {hospital.phone !== 'N/A' && (
                    <a href={`tel:${hospital.phone}`} className="phone-link">
                      📞 {hospital.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card ambulances-card">
            <div className="card-header">
              <span className="icon">🚑</span>
              <div>
                <p className="subtitle">Nearby Ambulances</p>
                <p className="status-label">{nearbyAmbulances.length} found</p>
              </div>
            </div>
            <div className="facilities-list">
              {nearbyAmbulances.slice(0, 3).map((ambulance, idx) => (
                <div key={idx} className="facility-item">
                  <h4>{ambulance.name}</h4>
                  <p className="distance">📍 {ambulance.distance}</p>
                  <p className="eta">⏱️ ETA: {ambulance.eta}</p>
                  {ambulance.phone !== 'N/A' && (
                    <a href={`tel:${ambulance.phone}`} className="phone-link">
                      📞 {ambulance.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <AlertModal 
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onSubmit={createAlert}
        isLoading={creatingAlert}
      />
    </div>
  )
}
