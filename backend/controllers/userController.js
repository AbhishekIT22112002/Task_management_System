const jwt = require('jsonwebtoken')
const userService = require('../services/userService')

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await userService.createUser({ email, password, name })
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await userService.findUserByEmail(email)
    const ok = await userService.verifyPassword(password, user)
    if (!ok) return res.status(400).json({ error: 'invalid credentials' })
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { register, login }
