const Task = require('../models/Task')
const logger = require('../utils/logger')
const { getGeminiModel, mapGeminiError } = require('../services/aiService')

function buildTasksContext(tasks) {
  return tasks.map(t => ({
    title: t.title,
    description: t.description || '',
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
    assignee: t.assignee || null,
  }))
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

    logger.info(`AI summarize using model: ${modelName}`)
    const result = await model.generateContent(prompt)
    const text = result?.response?.text?.() || 'Unable to generate summary.'
    return res.json({ summary: text })
  } catch (err) {
    const { status, message } = mapGeminiError(err)
    logger.error('AI summarize failed', { message: err.message })
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
    const prompt = `You are a project management assistant. Based ONLY on these tasks (do not invent data), answer the user question clearly and briefly. If the answer is uncertain, say so and suggest next steps.

Tasks JSON:\n${JSON.stringify(context)}

Question: ${question}`

    logger.info(`AI ask using model: ${modelName}`)
    const result = await model.generateContent(prompt)
    const text = result?.response?.text?.() || 'Unable to answer the question.'
    return res.json({ answer: text })
  } catch (err) {
    const { status, message } = mapGeminiError(err)
    logger.error('AI ask failed', { message: err.message })
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
