const User = require('../models/User')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

const findUserByEmail = async (email) => {
  return await User.findOne({ email })
}

const createUser = async ({ email, password, name }) => {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = new User({
    email,
    passwordHash,
    name
  })
  const savedUser = await user.save()
  return {
    id: savedUser._id,
    email: savedUser.email,
    name: savedUser.name,
    createdAt: savedUser.createdAt
  }
}

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

module.exports = { findUserByEmail, createUser, verifyPassword }
