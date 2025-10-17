const Task = require('../models/Task')
const logger = require('../utils/logger')
const { getGeminiModel, mapGeminiError } = require('../services/aiService')

function buildTasksContext(tasks, { limit = 150, maxDescription = 300 } = {}) {
  const safe = Array.isArray(tasks) ? tasks : []
  return safe.slice(0, limit).map(t => ({
    title: String(t.title || '').slice(0, 120),
    description: String(t.description || '').slice(0, maxDescription),
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
    assignee: t.assignee || null,
  }))
}

function capContextLength(jsonStr, hardMax = 30000) {
  if (jsonStr.length <= hardMax) return jsonStr
  // Attempt to reduce by dropping middle portion
  const head = jsonStr.slice(0, Math.floor(hardMax * 0.6))
  const tail = jsonStr.slice(-Math.floor(hardMax * 0.3))
  return `${head}\n/* …truncated for size… */\n${tail}`
}

function withTimeout(promise, ms = 45000) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('AI request timed out')
      err.status = 504
      reject(err)
    }, ms)
  })
  return Promise.race([promise.finally(() => clearTimeout(timer)), timeout])
}

async function summarize(req, res) {
  try {
    const { projectId } = req.body || {}
    if (!projectId) return res.status(400).json({ error: 'projectId is required' })

    const tasks = await Task.find({ project: projectId }).lean()
    if (!tasks || tasks.length === 0) return res.json({ summary: 'No tasks found for this project.' })

    const { model, modelName } = getGeminiModel()

    const context = buildTasksContext(tasks)
    const prompt = `You are a project management assistant. Given the following project tasks as JSON, write a concise, actionable summary with:
- Overall task counts
- Status breakdown (To Do, In Progress, Review, Done)
- Priority highlights
- Imminent deadlines or risks
- 3 next-step recommendations (bulleted)
Keep it under 180 words. Use clear headings.

Tasks JSON:\n${JSON.stringify(context)}`

    logger.info(`AI summarize using model: ${modelName}`, { tasks: tasks.length, promptChars: prompt.length })
    const result = await withTimeout(model.generateContent(prompt))
    const text = result?.response?.text?.() || 'Unable to generate summary.'
    return res.json({ summary: text })
  } catch (err) {
    const { status, message } = mapGeminiError(err)
    // Log full error details for debugging in console
    console.error('AI summarize error:', err)
    logger.error('AI summarize failed', {
      message: err.message,
      name: err.name,
      code: err.code || err.status || err.statusCode,
      stack: err.stack,
      responseStatus: err.response?.status,
      responseData: err.response?.data,
      cause: err.cause ? { message: err.cause.message, stack: err.cause.stack } : undefined,
    })
    return res.status(status).json({ error: message })
  }
}

async function ask(req, res) {
  try {
    const { projectId, question } = req.body || {}
    if (!projectId) return res.status(400).json({ error: 'projectId is required' })
    if (!question || !String(question).trim()) return res.status(400).json({ error: 'question is required' })

    const tasks = await Task.find({ project: projectId }).lean()
    if (!tasks || tasks.length === 0) return res.json({ answer: 'No tasks available for this project.' })

    const { model, modelName } = getGeminiModel()

    const context = buildTasksContext(tasks)
    const contextStr = capContextLength(JSON.stringify(context))
    const prompt = `You are a project management assistant. Based ONLY on these tasks (do not invent external data), answer the user question clearly and briefly. If uncertain, say so and suggest next steps.

Also include a "Relevant tasks" section (up to 8) that best address the question. For each task include:
  • Task: <title> (status, priority)
  • What it is: <one short sentence; infer from title/description if missing>
  • Next action: <one imperative sentence>
Keep the answer focused and under 220 words total.

Tasks JSON:\n${contextStr}

Question: ${question}`

    logger.info(`AI ask using model: ${modelName}`, { tasks: tasks.length, questionChars: String(question).length, promptChars: prompt.length })
    const result = await withTimeout(model.generateContent(prompt))
    const text = result?.response?.text?.() || 'Unable to answer the question.'
    return res.json({ answer: text })
  } catch (err) {
    const { status, message } = mapGeminiError(err)
    // Log full error details for debugging in console
    console.error('AI ask error:', err)
    logger.error('AI ask failed', {
      message: err.message,
      name: err.name,
      code: err.code || err.status || err.statusCode,
      stack: err.stack,
      responseStatus: err.response?.status,
      responseData: err.response?.data,
      cause: err.cause ? { message: err.cause.message, stack: err.cause.stack } : undefined,
    })
    return res.status(status).json({ error: message })
  }
}

function status(req, res) {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL
  res.json({
    configured: !!apiKey && !!modelName,
    model: modelName || null,
    apiKeyPresent: !!apiKey,
  })
}

module.exports = { summarize, ask, status }
