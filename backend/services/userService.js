const User = require('../models/User')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const createUser = async ({ email, password, name }) => {
  const existing = await User.findOne({ email })
  if (existing) throw new Error('User already exists')
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = new User({ email, passwordHash: hash, name })
  return await user.save()
}

const findUserByEmail = async (email) => {
  return await User.findOne({ email })
}

const verifyPassword = async (password, user) => {
  if (!user) return false
  return await bcrypt.compare(password, user.passwordHash)
}

module.exports = { createUser, findUserByEmail, verifyPassword }
