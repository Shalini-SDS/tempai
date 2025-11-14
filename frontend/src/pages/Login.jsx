import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import '../styles/Auth.css'

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, googleLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
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
    setError('Google Sign-in failed')
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
          <h1>Welcome Back</h1>
          <p>🌡️ TempAI - Fever Management</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="oauth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
          />
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('signup')}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
