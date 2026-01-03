import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: '',
  })
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'Image size must be less than 5MB' }))
        return
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please select a valid image file' }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.profilePicture
          return newErrors
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const getDefaultProfileIcon = () => {
    // Create a pixelated default icon using SVG
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
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
        {/* Simple face icon */}
        <circle cx="40" cy="45" r="8" fill="#666"/>
        <circle cx="80" cy="45" r="8" fill="#666"/>
        <path d="M 35 70 Q 60 80 85 70" stroke="#666" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setIsLoading(true)
      try {
        const success = await signup(formData)
        
        if (success) {
          navigate('/home')
        } else {
          setErrors({ submit: 'Registration failed. Username or email may already exist.' })
        }
      } catch (error) {
        console.error('Registration error:', error)
        setErrors({ submit: 'Failed to connect to server. Please try again.' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="gradient-bg"></div>
      <div className="auth-card signup-card">
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-subtitle">Join Globe Trotter and start planning your adventures</p>
        
        <div className="profile-picture-container">
          <div className="profile-picture-wrapper" onClick={() => fileInputRef.current?.click()}>
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-default">
                {getDefaultProfileIcon()}
              </div>
            )}
            <div className="profile-picture-overlay">
              <span>Change Photo</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
          />
          {errors.profilePicture && (
            <span className="error-message">{errors.profilePicture}</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'input-error' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'input-error' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'input-error' : ''}
              placeholder="Choose a username"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'input-error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'input-error' : ''}
                placeholder="Enter your phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? 'input-error' : ''}
                placeholder="Enter your city"
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={errors.country ? 'input-error' : ''}
                placeholder="Enter your country"
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us about yourself (optional)"
              className="textarea-input"
            />
          </div>

          {errors.submit && (
            <div className="error-message" style={{ textAlign: 'center', marginTop: '8px' }}>
              {errors.submit}
            </div>
          )}

          <button type="submit" className="auth-button primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register User'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup

