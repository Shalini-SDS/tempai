import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import '../styles/Auth.css'

export default function Signup({ onNavigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup, googleLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signup(email, password, name)
      onNavigate('dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      await googleLogin(credentialResponse.credential)
      onNavigate('dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Sign-up failed')
  }

  return (
    <div className="auth-container">
      <svg className="thermometer-svg" viewBox="0 0 50 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="thermGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff8e8e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4a4a4a" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d="M 20 5 L 30 5 L 30 40 C 30 50 25 55 20 55 C 15 55 10 50 10 40 L 10 5 Z" fill="none" stroke="url(#thermGrad)" strokeWidth="2" opacity="0.8"/>
        <circle cx="20" cy="60" r="12" fill="url(#thermGrad)" opacity="0.7"/>
        <line x1="20" y1="15" x2="20" y2="45" stroke="url(#thermGrad)" strokeWidth="3" opacity="0.9"/>
      </svg>
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>🌡️ TempAI - Fever Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="oauth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
          />
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
