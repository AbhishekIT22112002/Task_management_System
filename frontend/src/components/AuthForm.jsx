import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register, login } from '../slices/authSlice'
import { Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState({})
  
  const dispatch = useDispatch()
  const { token, status, error } = useSelector((state) => state.auth)
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  
  // Redirect if already authenticated
  if (token) return <Navigate to={from} replace />

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (value.trim().length > 50) return 'Name must be less than 50 characters'
        return ''
      
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return ''
      
      case 'password':
        if (!value) return 'Password is required'
        if (value.length > 100) return 'Password must be less than 100 characters'
        
        // For register mode, enforce stronger password requirements
        if (mode === 'register') {
          if (value.length < 8) return 'Password must be at least 8 characters'
          
          const hasLowercase = /[a-z]/.test(value)
          const hasUppercase = /[A-Z]/.test(value)
          const hasNumber = /\d/.test(value)
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)
          
          if (!hasLowercase) return 'Password must contain at least one lowercase letter'
          if (!hasUppercase) return 'Password must contain at least one uppercase letter'
          if (!hasNumber) return 'Password must contain at least one number'
          if (!hasSpecialChar) return 'Password must contain at least one special character'
        }
        return ''
      
      case 'confirmPassword':
        if (mode === 'register') {
          if (!value) return 'Please confirm your password'
          if (value !== formData.password) return 'Passwords do not match'
        }
        return ''
      
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (mode === 'register') {
      newErrors.name = validateField('name', formData.name)
    }
    
    newErrors.email = validateField('email', formData.email)
    newErrors.password = validateField('password', formData.password)
    
    if (mode === 'register') {
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword)
    }
    
    // Filter out empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key]
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    // Check if there are any current errors
    if (Object.keys(errors).length > 0) return false
    
    // Check required fields are filled
    if (!formData.email.trim()) return false
    if (!formData.password) return false
    
    if (mode === 'register') {
      if (!formData.name.trim()) return false
      if (!formData.confirmPassword) return false
      
      // For register mode, ensure all password requirements are met
      if (passwordStrength.strength < 5) return false
    }
    
    return true
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const fieldError = validateField(field, formData[field])
    if (fieldError) {
      setErrors(prev => ({ ...prev, [field]: fieldError }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let result
      if (mode === 'login') {
        result = await dispatch(login({ 
          email: formData.email.trim(), 
          password: formData.password 
        }))
      } else {
        result = await dispatch(register({ 
          name: formData.name.trim(),
          email: formData.email.trim(), 
          password: formData.password 
        }))
      }
      
      // Only show toast after API response is received
      if (result.meta.requestStatus === 'fulfilled') {
        // Success toast will be shown after API completes successfully
        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!')
        
      } else if (result.meta.requestStatus === 'rejected') {
        // Error handling for rejected requests
        const errorMsg = result.payload
        if (typeof errorMsg === 'object' && errorMsg.details) {
          // Show detailed validation errors
          errorMsg.details.forEach(detail => toast.error(detail))
        } else {
          toast.error(errorMsg || 'Authentication failed')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setErrors({})
    setTouched({})
    setFormData({
      email: formData.email, // Keep email when switching
      password: '',
      name: '',
      confirmPassword: ''
    })
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '', requirements: [] }
    
    const requirements = [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /\d/.test(password), text: 'One number' },
      { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password), text: 'One special character' }
    ]
    
    const strength = requirements.filter(req => req.met).length
    
    let label, color
    if (strength < 2) {
      label = 'Very Weak'
      color = '#dc2626'
    } else if (strength < 3) {
      label = 'Weak'
      color = '#ef4444'
    } else if (strength < 4) {
      label = 'Fair'
      color = '#f59e0b'
    } else if (strength < 5) {
      label = 'Good'
      color = '#22c55e'
    } else {
      label = 'Strong'
      color = '#16a34a'
    }
    
    return { strength, label, color, requirements }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Sign in to your account to continue'
              : 'Get started with your task management'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Name field for register mode */}
          {mode === 'register' && (
            <div className="form-row">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  disabled={isSubmitting}
                  className={errors.name ? 'error' : ''}
                />
              </div>
              {errors.name && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  {errors.name}
                </div>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="form-row">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                disabled={isSubmitting}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={14} />
                {errors.email}
              </div>
            )}
          </div>

          {/* Password field */}
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'login' ? 'Enter your password' : 'Min 8 chars with uppercase, lowercase, number & special char'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                disabled={isSubmitting}
                className={errors.password ? 'error' : ''}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={14} />
                {errors.password}
              </div>
            )}
            {/* Password strength indicator for register mode */}
            {mode === 'register' && formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }}
                  />
                </div>
                <div className="strength-info">
                  <span className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                  <span className="strength-score">
                    {passwordStrength.strength}/5 requirements met
                  </span>
                </div>
                <div className="password-requirements">
                  {passwordStrength.requirements.map((req, index) => (
                    <div 
                      key={index} 
                      className={`requirement ${req.met ? 'met' : 'unmet'}`}
                    >
                      <span className="requirement-icon">
                        {req.met ? '✓' : '×'}
                      </span>
                      <span className="requirement-text">{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password field for register mode */}
          {mode === 'register' && (
            <div className="form-row">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={isSubmitting}
                  className={errors.confirmPassword ? 'error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </div>
              )}
              {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="form-success">
                  <CheckCircle size={14} />
                  Passwords match
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          <div className="auth-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Mode switch */}
        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={switchMode}
                disabled={isSubmitting}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={switchMode}
                disabled={isSubmitting}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
