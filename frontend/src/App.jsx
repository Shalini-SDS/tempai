import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Landing from './pages/Landing'
import Dashboard from './components/Dashboard'
import './App.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing')
  const { user, token, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (token && user) {
        setCurrentPage('dashboard')
      } else {
        setCurrentPage('landing')
      }
    }
  }, [token, user, loading])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleLogout = () => {
    setCurrentPage('landing')
  }

  return (
    <>
      {currentPage === 'landing' && <Landing onNavigate={handleNavigate} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <Signup onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
    </>
  )
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
