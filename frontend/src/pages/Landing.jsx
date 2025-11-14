import '../styles/Landing.css'

export default function Landing({ onNavigate }) {
  return (
    <div className="landing-container">
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-3d-container">
            <div className="hero-cube">
              <div className="cube-face">🌡️</div>
            </div>
          </div>
          <h1 className="landing-title">TempAI</h1>
          <p className="landing-subtitle">Smart Fever Detection & Management</p>
          <p className="landing-description">
            Monitor your health with AI-powered fever analysis and personalized recommendations
          </p>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon-3d">
              <span>📊</span>
            </div>
            <h3>Real-time Monitoring</h3>
            <p>Track temperature readings and symptoms in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-3d">
              <span>🧠</span>
            </div>
            <h3>AI Analysis</h3>
            <p>Get intelligent predictions using machine learning</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-3d">
              <span>💊</span>
            </div>
            <h3>Smart Recommendations</h3>
            <p>Receive personalized health recommendations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-3d">
              <span>📱</span>
            </div>
            <h3>Your Data, Your Control</h3>
            <p>All your health data is saved securely to your account</p>
          </div>
        </div>

        <div className="landing-cta">
          <button
            className="cta-button primary"
            onClick={() => onNavigate('signup')}
          >
            Get Started - Sign Up
          </button>
          <button
            className="cta-button secondary"
            onClick={() => onNavigate('login')}
          >
            Already a member? Sign In
          </button>
        </div>

        <div className="landing-info">
          <h2>How it Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Create Your Account</h4>
              <p>Sign up with your email and secure password</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Log Your Health</h4>
              <p>Enter temperature, symptoms, and other vitals</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Get AI Analysis</h4>
              <p>Receive intelligent predictions and recommendations</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Track Progress</h4>
              <p>Monitor your recovery with historical data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
