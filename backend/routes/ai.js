const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const Task = require('../models/Task')
const logger = require('../utils/logger')

// Initialize Gemini client with multiple model fallbacks
let genAI
let model
let currentModelName = null

const MODEL_FALLBACKS = [
  // v1 models
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  // v2 models
  'gemini-2.5-flash',
  'gemini-2.5-pro'
]

async function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY is not set. AI routes will return 503 until configured.')
    return false
  }

  // Use v1 endpoint explicitly (some SDK versions default to v1beta)
  genAI = new GoogleGenerativeAI(apiKey, { baseUrl: 'https://generativelanguage.googleapis.com/v1' })
  
  // If explicit model is provided, try it first
  const preferred = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...MODEL_FALLBACKS] : MODEL_FALLBACKS

  // Try each model until one works
  for (const modelName of preferred) {
    try {
      logger.info(`Attempting to initialize Gemini with model: ${modelName}`)
      const testModel = genAI.getGenerativeModel({ model: modelName })
      
      // Test the model with a simple prompt
      const testResult = await testModel.generateContent('Say "OK" if you work')
      const testText = testResult.response.text()
      
      if (testText) {
        model = testModel
        currentModelName = modelName
        logger.info(`✅ Gemini AI Connected successfully with model: ${modelName}`)
        return true
      }
    } catch (err) {
      logger.warn(`Failed to initialize model ${modelName}: ${err.message}`)
      continue
    }
  }
  
  logger.error('All Gemini models failed to initialize')
  return false
}

// Initialize on startup
initializeGemini().catch(err => {
  logger.error('Failed to initialize Gemini AI', { error: err.message })
})

function ensureModel() {
  if (!model) {
    const err = new Error('AI model not configured. Please check your GEMINI_API_KEY.')
    err.status = 503
    throw err
  }
}

function buildTasksContext(tasks) {
  // Keep context compact to stay within token limits
  return tasks.map(t => ({
    title: t.title,
    description: t.description || '',
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
    assignee: t.assignee || null,
  }))
}

// POST /api/ai/summarize
router.post('/summarize', async (req, res) => {
  try {
    const { projectId } = req.body || {}
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' })
    }

    // Fetch tasks for project
    const tasks = await Task.find({ project: projectId }).lean()

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({ summary: 'No tasks found for this project.' })
    }

    ensureModel()

    const context = buildTasksContext(tasks)
    const prompt = `You are a project management assistant. Given the following project tasks as JSON, write a concise, actionable summary with:
- Overall task counts
- Status breakdown (To Do, In Progress, Review, Done)
- Priority highlights
- Imminent deadlines or risks
- 3 next-step recommendations (bulleted)
Keep it under 180 words. Use clear headings.

Tasks JSON:\n${JSON.stringify(context)}`

    logger.info(`Sending summarize request with model: ${currentModelName}`)
    const result = await model.generateContent(prompt)
    const text = result?.response?.text?.() || 'Unable to generate summary.'
    
    logger.info('Summary generated successfully')
    return res.json({ summary: text })
  } catch (err) {
    const status = err.status || 500
    logger.error('AI summarize failed', { 
      error: err.message, 
      stack: err.stack,
      model: currentModelName 
    })
    
    // Return detailed error for debugging
    return res.status(status).json({ 
      error: 'Failed to summarize tasks',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      model: currentModelName
    })
  }
})

// POST /api/ai/ask
router.post('/ask', async (req, res) => {
  try {
    const { projectId, question } = req.body || {}
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' })
    }
    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: 'question is required' })
    }

    const tasks = await Task.find({ project: projectId }).lean()
    if (!tasks || tasks.length === 0) {
      return res.status(200).json({ answer: 'No tasks available for this project.' })
    }

    ensureModel()

    const context = buildTasksContext(tasks)
    const prompt = `You are a project management assistant. Based ONLY on these tasks (do not invent data), answer the user question clearly and briefly. If the answer is uncertain, say so and suggest next steps.

Tasks JSON:\n${JSON.stringify(context)}

Question: ${question}`

    logger.info(`Sending ask request with model: ${currentModelName}`)
    const result = await model.generateContent(prompt)
    const text = result?.response?.text?.() || 'Unable to answer the question.'
    
    logger.info('Answer generated successfully')
    return res.json({ answer: text })
  } catch (err) {
    const status = err.status || 500
    logger.error('AI ask failed', { 
      error: err.message, 
      stack: err.stack,
      model: currentModelName 
    })
    
    return res.status(status).json({ 
      error: 'Failed to get AI answer',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      model: currentModelName
    })
  }
})

// GET /api/ai/status - Health check endpoint
router.get('/status', (req, res) => {
  res.json({
    configured: !!model,
    model: currentModelName,
    apiKeyPresent: !!process.env.GEMINI_API_KEY,
    apiKeyPrefix: process.env.GEMINI_API_KEY ? 
      process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 
      'not set'
  })
})

// POST /api/ai/reinitialize - Manual reinitialization endpoint (useful for debugging)
router.post('/reinitialize', async (req, res) => {
  try {
    logger.info('Manual reinitialization requested')
    const success = await initializeGemini()
    res.json({ 
      success, 
      model: currentModelName,
      message: success ? 'AI reinitialized successfully' : 'Failed to initialize AI'
    })
  } catch (err) {
    logger.error('Reinitialization failed', { error: err.message })
    res.status(500).json({ 
      success: false, 
      error: err.message 
    })
  }
})

// GET /api/ai/models - list available models from API (debugging aid)
router.get('/models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return res.status(503).json({ error: 'GEMINI_API_KEY not set' })

    const url = 'https://generativelanguage.googleapis.com/v1/models'
    const r = await fetch(`${url}?key=${apiKey}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await r.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to list models', details: err.message })
  }
})

module.exports = router
