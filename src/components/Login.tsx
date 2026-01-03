import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; submit?: string }>({})
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch profile picture when email changes (debounced)
  useEffect(() => {
    if (email && /\S+@\S+\.\S+/.test(email)) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/user/${encodeURIComponent(email)}`)
          if (response.ok) {
            const data = await response.json()
            setProfilePicture(data.profilePicture)
          } else {
            setProfilePicture(null)
          }
        } catch (error) {
          setProfilePicture(null)
        }
      }, 500) // Debounce for 500ms

      return () => clearTimeout(timer)
    } else {
      setProfilePicture(null)
    }
  }, [email])

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getDefaultProfileIcon = () => {
    return (
      <svg width="80" height="80" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" fill="#e0e0e0"/>
        <rect x="0" y="0" width="30" height="30" fill="#b0b0b0"/>
        <rect x="30" y="0" width="30" height="30" fill="#d0d0d0"/>
        <rect x="60" y="0" width="30" height="30" fill="#b0b0b0"/>
        <rect x="90" y="0" width="30" height="30" fill="#d0d0d0"/>
        <rect x="0" y="30" width="30" height="30" fill="#d0d0d0"/>
        <rect x="30" y="30" width="30" height="30" fill="#b0b0b0"/>
        <rect x="60" y="30" width="30" height="30" fill="#d0d0d0"/>
        <rect x="90" y="30" width="30" height="30" fill="#b0b0b0"/>
        <rect x="0" y="60" width="30" height="30" fill="#b0b0b0"/>
        <rect x="30" y="60" width="30" height="30" fill="#d0d0d0"/>
        <rect x="60" y="60" width="30" height="30" fill="#b0b0b0"/>
        <rect x="90" y="60" width="30" height="30" fill="#d0d0d0"/>
        <rect x="0" y="90" width="30" height="30" fill="#d0d0d0"/>
        <rect x="30" y="90" width="30" height="30" fill="#b0b0b0"/>
        <rect x="60" y="90" width="30" height="30" fill="#d0d0d0"/>
        <rect x="90" y="90" width="30" height="30" fill="#b0b0b0"/>
        <circle cx="40" cy="45" r="8" fill="#666"/>
        <circle cx="80" cy="45" r="8" fill="#666"/>
        <path d="M 35 70 Q 60 80 85 70" stroke="#666" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (response.ok) {
          // Store user data in localStorage or context
          localStorage.setItem('user', JSON.stringify(data.user))
          // Redirect to dashboard or home page
          alert('Login successful!')
          // window.location.href = '/dashboard' // Uncomment when you have a dashboard
        } else {
          setErrors({ submit: data.error || 'Login failed' })
        }
      } catch (error) {
        console.error('Login error:', error)
        setErrors({ submit: 'Failed to connect to server. Please try again.' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="gradient-bg"></div>
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to manage your travel plans</p>
        
        {/* Profile Picture Display */}
        {email && (
          <div className="profile-picture-container" style={{ marginBottom: '24px' }}>
            <div className="profile-picture-wrapper" style={{ width: '80px', height: '80px', border: '2px solid #667eea', cursor: 'default' }}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="profile-picture" />
              ) : (
                <div className="profile-picture-default">
                  {getDefaultProfileIcon()}
                </div>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'input-error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          {errors.submit && (
            <div className="error-message" style={{ textAlign: 'center', marginTop: '8px' }}>
              {errors.submit}
            </div>
          )}

          <button type="submit" className="auth-button primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

