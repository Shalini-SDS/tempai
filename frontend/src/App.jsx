import { useMemo, useState } from 'react'
import './App.css'

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'health', label: 'My Health' },
  { id: 'insights', label: 'AI Insights' },
  { id: 'history', label: 'History' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'settings', label: 'Settings' },
]

const symptomOptions = [
  'Headache',
  'Fatigue',
  'Sore throat',
  'Rash',
  'Cough',
  'Body ache',
  'Nausea',
  'Chills',
]

const recommendations = [
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

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache', 'Fatigue'])

  const temperatureReadings = useMemo(
    () => [
      { date: 'Apr 15', value: 37 },
      { date: 'Apr 16', value: 38 },
      { date: 'Apr 17', value: 37.5 },
      { date: 'Apr 18', value: 39 },
      { date: 'Apr 19', value: 38.2 },
    ],
    [],
  )

  const temperature = 38.5
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

  const renderHome = () => (
    <div className="dashboard-grid">
      <section className="card highlight">
        <div className="card-header">
          <span className="icon">🌡️</span>
          <div>
            <p className="subtitle">Current Temperature</p>
            <p className="timestamp">Last updated: Nov 2, 11:27 PM</p>
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
          {symptomOptions.map((symptom) => (
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
            <p className="status-label">Confidence 85%</p>
          </div>
        </div>
        <div className="prediction-details">
          <div>
            <span>Probable Cause</span>
            <strong>Viral</strong>
          </div>
          <div>
            <span>Severity</span>
            <span className="severity moderate">Moderate</span>
          </div>
          <div className="advice">Stay hydrated and rest.</div>
        </div>
      </section>

      <section className="card temperature-trend">
        <div className="card-header">
          <span className="icon">📈</span>
          <div>
            <p className="subtitle">Temperature Trend</p>
            <p className="timestamp">Apr 15 - Apr 19</p>
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
          {recommendations.map((item) => (
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
      <button className="action-button" type="button">Download Summary PDF</button>
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
    <div className="panel">
      <h2>Profile & Settings</h2>
      <form className="settings-form">
        <label>
          Name
          <input type="text" defaultValue="Avery Taylor" />
        </label>
        <label>
          Age
          <input type="number" defaultValue="29" />
        </label>
        <label>
          Region
          <input type="text" defaultValue="San Francisco, CA" />
        </label>
        <label className="toggle">
          Connect IoT Thermometer
          <input type="checkbox" defaultChecked />
          <span />
        </label>
        <label className="toggle">
          Dark Theme
          <input type="checkbox" defaultChecked />
          <span />
        </label>
        <button className="action-button" type="button">Save Changes</button>
      </form>
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
            <p>AI-powered fever assistant</p>
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

export default App
