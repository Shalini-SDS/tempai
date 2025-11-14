import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../App.css'

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'health', label: 'My Health' },
  { id: 'insights', label: 'AI Insights' },
  { id: 'history', label: 'History' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'settings', label: 'Settings' },
]

// These will be loaded dynamically
let symptomOptions = [
  'Headache',
  'Fatigue',
  'Sore throat',
  'Rash',
  'Cough',
  'Body ache',
  'Nausea',
  'Chills',
]

let recommendations = [
  { title: 'Stay Hydrated', detail: 'Drink water, herbal tea, or electrolyte solutions.' },
  { title: 'Rest Adequately', detail: 'Aim for 8-10 hours of sleep to aid recovery.' },
  { title: 'Take Paracetamol', detail: 'Take 500mg every 6 hours if temperature exceeds 38°C.' },
  { title: 'Monitor Temperature', detail: 'Consult a doctor if fever persists beyond 3 days.' },
]

const timeline = [
  { time: 'Today • 11:27 PM', temperature: '38.5°C', summary: 'High fever with headache and fatigue.' },
  { time: 'Yesterday • 08:10 PM', temperature: '38.1°C', summary: 'Moderate fever with fatigue.' },
  { time: 'Apr 28 • 09:15 PM', temperature: '37.2°C', summary: 'Temperature stabilised, symptoms light.' },
]

const insightsHistory = [
  { title: 'Recovery Phase', detail: 'Temperature held steady for 24h. Continue rest.' },
  { title: 'Hydration Reminder', detail: 'Water intake below recommended. Increase fluid consumption.' },
  { title: 'Medication Log', detail: 'Paracetamol taken twice today. Maintain dosage intervals.' },
]

const severityProbabilities = [
  { label: 'Viral', value: 85 },
  { label: 'Bacterial', value: 40 },
  { label: 'Dengue', value: 20 },
  { label: 'Malaria', value: 10 },
]

const historyRecords = [
  { date: 'Feb 13, 2025', cause: 'Viral', severity: 'Moderate', outcome: 'Recovered in 4 days' },
  { date: 'Oct 02, 2024', cause: 'Seasonal Flu', severity: 'Mild', outcome: 'Recovered in 3 days' },
  { date: 'Jul 19, 2024', cause: 'Bacterial', severity: 'Critical', outcome: 'Hospitalised, recovered' },
]

const emergencyContacts = [
  { label: 'Emergency Services', value: '911', type: 'primary' },
  { label: 'Family Doctor', value: '+1 (555) 123-4567', type: 'secondary' },
  { label: 'Emergency Contact', value: '+1 (555) 987-6543', type: 'secondary' },
]

const nearbyFacilities = [
  { name: 'City General Hospital', distance: '1.2 km', eta: '5 min' },
  { name: 'Metro Medical Center', distance: '2.8 km', eta: '10 min' },
  { name: 'Community Health Clinic', distance: '3.5 km', eta: '12 min' },
]

const criticalSymptoms = ['Temperature above 40°C (104°F)', 'Severe headache or stiff neck', 'Difficulty breathing', 'Persistent vomiting']

const warningSigns = ['Confusion or altered consciousness', 'Rapid heartbeat or chest pain', 'Rash with purple spots', 'Seizures or convulsions']

const currentVitals = [
  { label: 'Heart Rate', value: '78 bpm' },
  { label: 'Blood Pressure', value: '120/80' },
  { label: 'Oxygen Level', value: '98 %' },
  { label: 'Respiratory Rate', value: '16 /min' },
]

export default function Dashboard({ onLogout }) {
  const { user, token, logout, updateUserSettings } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache', 'Fatigue'])

  const [formData, setFormData] = useState({
    temperature: '',
    age: '',
    daysInOnset: '',
    symptoms: [],
  })
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [displayedRecommendations, setDisplayedRecommendations] = useState(recommendations)

  const [currentReading, setCurrentReading] = useState(null)
  const [historyReadings, setHistoryReadings] = useState([])

  // Dynamic data states
  const [dynamicSymptomOptions, setDynamicSymptomOptions] = useState(symptomOptions)
  const [dynamicRecommendations, setDynamicRecommendations] = useState(recommendations)
  const [severityProbabilities, setSeverityProbabilities] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [nearbyFacilities, setNearbyFacilities] = useState([])
  const [criticalSymptoms, setCriticalSymptoms] = useState([])
  const [warningSigns, setWarningSigns] = useState([])
  const [currentVitals, setCurrentVitals] = useState([])
  const [timeline, setTimeline] = useState([])
  const [insightsHistory, setInsightsHistory] = useState([])
  const [historyRecords, setHistoryRecords] = useState([])

  const [settingsData, setSettingsData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    allergies: user?.allergies || ''
  })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    setSettingsData({
      name: user?.name || '',
      age: user?.age || '',
      allergies: user?.allergies || ''
    })
  }, [user])

  // Fetch static data
  useEffect(() => {
    const fetchStaticData = async () => {
      const API = ''
      try {
        const [symptomsRes, recommendationsRes, severityRes, contactsRes, facilitiesRes, criticalRes, warningRes, vitalsRes] = await Promise.all([
          fetch(`${API}/api/data/symptoms`),
          fetch(`${API}/api/data/recommendations`),
          fetch(`${API}/api/data/severity-probabilities`),
          fetch(`${API}/api/data/emergency-contacts`),
          fetch(`${API}/api/data/nearby-facilities`),
          fetch(`${API}/api/data/critical-symptoms`),
          fetch(`${API}/api/data/warning-signs`),
          fetch(`${API}/api/data/current-vitals`)
        ])

        if (symptomsRes.ok) setDynamicSymptomOptions(await symptomsRes.json())
        if (recommendationsRes.ok) {
          const recs = await recommendationsRes.json()
          setDynamicRecommendations(recs)
          setDisplayedRecommendations(recs)
        }
        if (severityRes.ok) setSeverityProbabilities(await severityRes.json())
        if (contactsRes.ok) setEmergencyContacts(await contactsRes.json())
        if (facilitiesRes.ok) setNearbyFacilities(await facilitiesRes.json())
        if (criticalRes.ok) setCriticalSymptoms(await criticalRes.json())
        if (warningRes.ok) setWarningSigns(await warningRes.json())
        if (vitalsRes.ok) setCurrentVitals(await vitalsRes.json())
      } catch (error) {
        console.error('Error fetching static data:', error)
      }
    }

    fetchStaticData()
  }, [])

  // Fetch user-specific data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return

      const API = ''
      try {
        const [timelineRes, insightsRes, historyRes] = await Promise.all([
          fetch(`${API}/api/user/timeline`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API}/api/user/insights-history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API}/api/user/history-records`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        if (timelineRes.ok) setTimeline(await timelineRes.json())
        if (insightsRes.ok) setInsightsHistory(await insightsRes.json())
        if (historyRes.ok) setHistoryRecords(await historyRes.json())
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [token])

  useEffect(() => {
    const fetchLatestReading = async () => {
      const API = ''
      try {
        const res = await fetch(`${API}/api/latestData`)
        const data = await res.json()
        if (data && data.temperature !== undefined) {
          setCurrentReading(data)
        }
      } catch (error) {
        console.error('Error fetching latest reading:', error)
      }
    }
    
    const fetchHistory = async () => {
      const API = ''
      try {
        const res = await fetch(`${API}/api/history?limit=50`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setHistoryReadings(data)
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      }
    }

    fetchLatestReading()
    fetchHistory()

    const interval = setInterval(() => {
      fetchLatestReading()
      fetchHistory()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const temperatureReadings = useMemo(
    () => {
      if (historyReadings && historyReadings.length > 0) {
        return historyReadings
          .slice(0, 5)
          .reverse()
          .map((reading, idx) => ({
            date: reading.timestamp ? new Date(reading.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Day ${idx}`,
            value: reading.temperature,
          }))
      }
      return [
        { date: 'Apr 15', value: 37 },
        { date: 'Apr 16', value: 38 },
        { date: 'Apr 17', value: 37.5 },
        { date: 'Apr 18', value: 39 },
        { date: 'Apr 19', value: 38.2 },
      ]
    },
    [historyReadings],
  )

  const temperature = currentReading?.temperature || 38.5
  const status = temperature >= 39 ? 'high' : temperature >= 37.5 ? 'moderate' : 'normal'

  const chartPath = useMemo(() => {
    const width = 280
    const height = 140
    const max = Math.max(...temperatureReadings.map((d) => d.value))
    const min = Math.min(...temperatureReadings.map((d) => d.value))
    const range = max - min || 1
    const step = width / (temperatureReadings.length - 1)
    return temperatureReadings
      .map((point, index) => {
        const x = index * step
        const y = height - ((point.value - min) / range) * height
        return `${index === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')
  }, [temperatureReadings])

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom],
    )
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleFormSymptom = (symptom) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }))
  }

  const analyze = async () => {
    const API = ''
    setLoading(true)
    try {
      const payload = {
        temperature: parseFloat(formData.temperature),
        age: parseInt(formData.age),
        days_since_onset: parseInt(formData.daysInOnset),
        symptoms: formData.symptoms,
      }
      const res = await fetch(`${API}/api/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setPrediction({
        prediction: json.prediction,
        confidence: json.confidence,
      })
      setDisplayedRecommendations(json.recommendations || [])
    } catch (error) {
      console.error('Error analyzing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    onLogout()
  }

  const handleSettingsSave = async () => {
    setSettingsLoading(true)
    setSettingsMessage('')
    try {
      await updateUserSettings({
        name: settingsData.name,
        age: settingsData.age ? parseInt(settingsData.age) : null,
        allergies: settingsData.allergies
      })
      setSettingsMessage('Settings saved successfully!')
      setTimeout(() => setSettingsMessage(''), 3000)
    } catch (err) {
      setSettingsMessage(err.message || 'Failed to save settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      const authToken = token || localStorage.getItem('token')
      if (!authToken) {
        alert('Authentication token not found. Please log in again.')
        return
      }

      const response = await fetch('/api/report/health-summary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          temperature: currentReading?.temperature || 'N/A',
          symptoms: selectedSymptoms,
          prediction: prediction?.prediction || 'Not analyzed',
          confidence: prediction?.confidence || 0
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `health_summary_${new Date().getTime()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json()
        alert(`Failed to download PDF: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert(`Error downloading PDF: ${error.message}`)
    } finally {
      setPdfLoading(false)
    }
  }

  const renderHome = () => (
    <div className="dashboard-grid">
      <section className="card highlight">
        <div className="card-header">
          <span className="icon">🌡️</span>
          <div>
            <p className="subtitle">Current Temperature</p>
            <p className="timestamp">Last updated: {currentReading?.timestamp ? new Date(currentReading.timestamp).toLocaleString() : 'Loading...'}</p>
          </div>
        </div>
        <div className="temperature-display">
          <span className="temperature-value">{temperature.toFixed(1)}°C</span>
          <span className={`status-pill ${status}`}>{status === 'high' ? 'High Fever' : status === 'moderate' ? 'Mild Fever' : 'Normal'}</span>
        </div>
      </section>

      <section className="card health-score">
        <div className="card-header">
          <span className="icon">🛡️</span>
          <div>
            <p className="subtitle">Health Score</p>
            <p className="status-label">Good</p>
          </div>
        </div>
        <div className="gauge">
          <div className="gauge-circle">
            <div className="gauge-inner">78</div>
          </div>
          <div className="gauge-metrics">
            <div>
              <span>Temperature</span>
              <span>85%</span>
            </div>
            <div>
              <span>Symptoms</span>
              <span>60%</span>
            </div>
            <div>
              <span>Vitals</span>
              <span>95%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card symptom-log">
        <div className="card-header">
          <span className="icon">🤒</span>
          <div>
            <p className="subtitle">Symptom Log</p>
            <p className="status-label">{selectedSymptoms.length} selected</p>
          </div>
        </div>
        <div className="symptom-list">
          {dynamicSymptomOptions.map((symptom) => (
            <button
              key={symptom}
              className={`symptom-item${selectedSymptoms.includes(symptom) ? ' active' : ''}`}
              onClick={() => toggleSymptom(symptom)}
              type="button"
            >
              {symptom}
            </button>
          ))}
        </div>
      </section>

      <section className="card ai-prediction">
        <div className="card-header">
          <span className="icon">🧠</span>
          <div>
            <p className="subtitle">AI Prediction</p>
            <p className="status-label">{prediction ? `Confidence ${(prediction.confidence * 100).toFixed(0)}%` : 'Fill form & analyze'}</p>
          </div>
        </div>
        
        <div className="prediction-form">
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 38.5"
              value={formData.temperature}
              onChange={(e) => handleFormChange('temperature', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              placeholder="e.g., 29"
              value={formData.age}
              onChange={(e) => handleFormChange('age', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Days Since Onset</label>
            <input
              type="number"
              placeholder="e.g., 2"
              value={formData.daysInOnset}
              onChange={(e) => handleFormChange('daysInOnset', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Symptoms</label>
            <div className="symptom-checkboxes">
              {dynamicSymptomOptions.slice(0, 4).map((symptom) => (
                <label key={symptom} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={() => toggleFormSymptom(symptom)}
                  />
                  {symptom}
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              className="action-button"
              onClick={analyze}
              disabled={loading}
              type="button"
            >
              {loading ? '⏳ Analyzing...' : '📊 Analyze'}
            </button>
          </div>
        </div>

        {prediction && (
          <div className="prediction-details">
            <div>
              <span>Probable Cause</span>
              <strong>{prediction.prediction}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <span className="severity moderate">{(prediction.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </section>

      <section className="card temperature-trend">
        <div className="card-header">
          <span className="icon">📈</span>
          <div>
            <p className="subtitle">Temperature Trend</p>
            <p className="timestamp">Last 5 readings</p>
          </div>
        </div>
        <svg viewBox="0 0 280 160" className="trend-chart">
          <defs>
            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4dd0e1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1f2838" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${chartPath}`} fill="none" stroke="#4dd0e1" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          <path d={`${chartPath} L280,160 L0,160 Z`} fill="url(#trendGradient)" opacity="0.2" />
          {temperatureReadings.map((point, index) => {
            const width = 280
            const height = 140
            const max = Math.max(...temperatureReadings.map((d) => d.value))
            const min = Math.min(...temperatureReadings.map((d) => d.value))
            const range = max - min || 1
            const step = width / (temperatureReadings.length - 1)
            const x = index * step
            const y = height - ((point.value - min) / range) * height
            return <circle key={point.date} cx={x} cy={y} r="6" className="trend-point" />
          })}
        </svg>
        <div className="trend-labels">
          {temperatureReadings.map((point) => (
            <span key={point.date}>{point.date}</span>
          ))}
        </div>
      </section>

      <section className="card recommendations">
        <div className="card-header">
          <span className="icon">🩺</span>
          <div>
            <p className="subtitle">Recommendations</p>
            <p className="status-label">AI guided care plan</p>
          </div>
        </div>
        <div className="recommendation-list">
          {displayedRecommendations.map((item) => (
            <div key={item.title} className="recommendation-item">
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderHealth = () => (
    <div className="panel">
      <h2>My Health Timeline</h2>
      <div className="timeline">
        {timeline.map((entry) => (
          <div key={entry.time} className="timeline-item">
            <span className="timeline-time">{entry.time}</span>
            <span className="timeline-temp">{entry.temperature}</span>
            <p>{entry.summary}</p>
          </div>
        ))}
      </div>
      <h3>Insights History</h3>
      <div className="insight-history">
        {insightsHistory.map((item) => (
          <div key={item.title} className="insight-card">
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </div>
        ))}
      </div>
      <button className="action-button" type="button" onClick={handleDownloadPDF} disabled={pdfLoading}>
        {pdfLoading ? '⏳ Generating PDF...' : '📄 Download Summary PDF'}
      </button>
    </div>
  )

  const renderInsights = () => (
    <div className="panel">
      <h2>AI Insights Overview</h2>
      <div className="severity-grid">
        {severityProbabilities.map((item) => (
          <div key={item.label} className="severity-item">
            <div className="probability-circle">
              <span>{item.value}%</span>
            </div>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
      <div className="comparison-card">
        <h3>Comparison</h3>
        <p>Current temperature is 0.3°C higher than yesterday. Symptom intensity reduced by 15%.</p>
      </div>
      <div className="smart-tips">
        <h3>Smart Tips</h3>
        <ul>
          <li>Your temperature has been stable for 24 hours — likely recovery phase.</li>
          <li>Headache frequency decreased compared to last week.</li>
          <li>Maintain hydration to support faster recovery.</li>
        </ul>
      </div>
    </div>
  )

  const renderHistory = () => (
    <div className="panel">
      <h2>Fever Episodes</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Cause</th>
              <th>Severity</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {historyRecords.map((record) => (
              <tr key={record.date}>
                <td>{record.date}</td>
                <td>{record.cause}</td>
                <td>{record.severity}</td>
                <td>{record.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="filters">
        <button type="button">Filter by Date</button>
        <button type="button">Filter by Severity</button>
      </div>
    </div>
  )

  const renderEmergency = () => (
    <div className="emergency-layout">
      <section className="emergency-banner">
        <div className="banner-icon">⚠️</div>
        <div>
          <h2>Emergency Mode Active</h2>
          <p>Quick access to emergency contacts and nearby medical facilities.</p>
        </div>
      </section>
      <div className="emergency-grid">
        <section className="card emergency-card">
          <div className="card-header">
            <span className="icon">🚑</span>
            <div>
              <p className="subtitle">Quick Actions</p>
              <p className="status-label">Tap to call instantly</p>
            </div>
          </div>
          <div className="contact-list">
            {emergencyContacts.map((contact) => (
              <div key={contact.label} className={`contact-item${contact.type === 'primary' ? ' primary' : ''}`}>
                <div>
                  <h4>{contact.label}</h4>
                  <p>{contact.value}</p>
                </div>
                <button type="button">📞</button>
              </div>
            ))}
          </div>
          <button className="action-button danger" type="button">Call Emergency Now</button>
        </section>
        <section className="card emergency-card">
          <div className="card-header">
            <span className="icon">🩺</span>
            <div>
              <p className="subtitle">Current Vitals</p>
              <p className="status-label">All vitals within normal range</p>
            </div>
          </div>
          <div className="vitals-grid">
            {currentVitals.map((vital) => (
              <div key={vital.label} className="vital-item">
                <span>{vital.label}</span>
                <strong>{vital.value}</strong>
              </div>
            ))}
          </div>
          <div className="vital-footer">Last updated: Just now</div>
        </section>
      </div>
      <section className="card facility-card">
        <div className="card-header">
          <span className="icon">📍</span>
          <div>
            <p className="subtitle">Nearby Medical Facilities</p>
            <p className="status-label">Auto sorted by distance</p>
          </div>
        </div>
        <div className="facility-grid">
          {nearbyFacilities.map((facility) => (
            <div key={facility.name} className="facility-item">
              <div className="facility-meta">
                <h4>{facility.name}</h4>
                <div>
                  <span>{facility.distance}</span>
                  <span>{facility.eta}</span>
                </div>
              </div>
              <button type="button">Get Directions</button>
            </div>
          ))}
        </div>
      </section>
      <section className="card emergency-guidance">
        <div className="guidance-columns">
          <div>
            <h3>When to Seek Immediate Medical Attention</h3>
            <ul>
              {criticalSymptoms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Warning Signs</h3>
            <ul>
              {warningSigns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )

  const renderSettings = () => (
    <div className="settings-container">
      {settingsMessage && (
        <div className={`settings-message ${settingsMessage.includes('successfully') ? 'success' : 'error'}`}>
          {settingsMessage}
        </div>
      )}
      
      <div className="settings-grid">
        <div className="settings-card profile-card">
          <div className="profile-header">
            <h2>Profile Settings</h2>
          </div>
          
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar">
                <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div className="avatar-info">
                <p className="avatar-name">{user?.name || 'User'}</p>
                <p className="avatar-email">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>

          <form className="profile-form" onSubmit={(e) => {
            e.preventDefault()
            handleSettingsSave()
          }}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({...settingsData, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Age</label>
                <input 
                  type="number" 
                  placeholder="29" 
                  value={settingsData.age || ''}
                  onChange={(e) => setSettingsData({...settingsData, age: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
              />
            </div>

            <div className="form-group full-width">
              <label>Allergies & Medical Notes</label>
              <textarea 
                placeholder="Enter any allergies or medical conditions (e.g., Penicillin allergy, Diabetes)" 
                value={settingsData.allergies || ''}
                onChange={(e) => setSettingsData({...settingsData, allergies: e.target.value})}
              />
            </div>

            <div className="button-group">
              <button 
                className="btn-primary" 
                type="submit"
                disabled={settingsLoading}
              >
                <span className="btn-glow"></span>
                {settingsLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="settings-card preferences-card">
          <div className="preferences-header">
            <h2>Device & Preferences</h2>
          </div>

          <div className="preferences-section">
            <div className="preference-item">
              <div className="preference-info">
                <h3>IoT Thermometer</h3>
                <p>Connect your smart thermometer device</p>
              </div>
              <label className="toggle-modern">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Real-time Monitoring</h3>
                <p>Continuous health tracking</p>
              </div>
              <label className="toggle-modern">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>AI Predictions</h3>
                <p>Enable AI-powered health insights</p>
              </div>
              <label className="toggle-modern">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Dark Theme</h3>
                <p>Premium dark interface</p>
              </div>
              <label className="toggle-modern">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Notifications</h3>
                <p>Receive health alerts</p>
              </div>
              <label className="toggle-modern">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-logout" type="button" onClick={handleLogout}>
          <span className="btn-glow logout"></span>
          Logout
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    if (activeTab === 'home') return renderHome()
    if (activeTab === 'health') return renderHealth()
    if (activeTab === 'insights') return renderInsights()
    if (activeTab === 'history') return renderHistory()
    if (activeTab === 'emergency') return renderEmergency()
    return renderSettings()
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">🤖</span>
          <div>
            <h1>TempAI</h1>
            <p>{user?.name || 'Welcome'} - AI-powered fever assistant</p>
          </div>
        </div>
        <nav className="tab-group">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="content-area">{renderContent()}</main>
    </div>
  )
}
