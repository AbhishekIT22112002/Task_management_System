const express = require('express')
const router = express.Router()
const aiController = require('../controllers/aiController')

// AI routes
router.post('/summarize', aiController.summarize)
router.post('/ask', aiController.ask)
router.get('/status', aiController.status)

module.exports = router
