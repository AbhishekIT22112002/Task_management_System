const jwt = require('jsonwebtoken')
const authService = require('../services/authService')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

// Password validation helper
const validatePassword = (password) => {
  const errors = []
  
  if (!password) {
    errors.push('Password is required')
    return errors
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?~`)')
  }
  
  return errors
}

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' })
    }
    
    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' })
    }
    
    // Validate password
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Password requirements not met',
        details: passwordErrors
      })
    }

    const existing = await authService.findUserByEmail(email)
    if (existing) return res.status(400).json({ error: 'An account with this email already exists' })

    const user = await authService.createUser({ email, password, name })
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' })
    }

    const user = await authService.findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const ok = await authService.verifyPassword(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { register, login }
