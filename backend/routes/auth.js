const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/me', authMiddleware, userController.getCurrentUser)

module.exports = router
