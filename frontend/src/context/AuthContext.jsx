/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    const data = await response.json()
    setToken(data.token)
    setUser({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
    }))
    return data
  }

  const signup = async (email, password, name) => {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }
    
    const data = await response.json()
    setToken(data.token)
    setUser({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
    }))
    return data
  }

  const googleLogin = async (googleToken) => {
    const response = await fetch('http://localhost:5000/api/auth/google-oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Google login failed')
    }
    
    const data = await response.json()
    setToken(data.token)
    setUser({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
    }))
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getUserSettings = async () => {
    if (!token) throw new Error('No token available')
    
    const response = await fetch('http://localhost:5000/api/auth/user-settings', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch settings')
    }
    
    return await response.json()
  }

  const updateUserSettings = async (settings) => {
    if (!token) throw new Error('No token available')
    
    const response = await fetch('http://localhost:5000/api/auth/user-settings', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(settings),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update settings')
    }
    
    const data = await response.json()
    setUser({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      age: data.age,
      allergies: data.allergies
    })
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      age: data.age,
      allergies: data.allergies
    }))
    return data
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, googleLogin, loading, getUserSettings, updateUserSettings }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
