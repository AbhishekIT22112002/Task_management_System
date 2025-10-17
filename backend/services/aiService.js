const { GoogleGenerativeAI } = require('@google/generative-ai')

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL

  if (!apiKey) {
    const err = new Error('Gemini not connected: GEMINI_API_KEY is missing')
    err.status = 503
    throw err
  }
  if (!modelName) {
    const err = new Error('Gemini model not connected: GEMINI_MODEL is missing')
    err.status = 503
    throw err
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  return { model: genAI.getGenerativeModel({ model: modelName }), modelName }
}

function mapGeminiError(err) {
  let status = 500
  let message = 'AI request failed'

  const code = err.status || err.code || err.statusCode
  const text = String(err.message || '').toLowerCase()

  if (!code && (text.includes('fetch failed') || text.includes('network'))) {
    status = 503
    message = 'Gemini not reachable'
  } else if (code === 401 || code === 403 || text.includes('permission') || text.includes('unauthorized') || text.includes('invalid api key')) {
    status = 401
    message = 'Gemini token invalid or expired'
  } else if (code === 404 || text.includes('not found') || (text.includes('model') && text.includes('not'))) {
    status = 503
    message = 'Gemini model defined in env is not connected'
  } else if (code === 429 || text.includes('quota') || text.includes('exceed') || text.includes('rate limit')) {
    status = 429
    message = 'Token limit exceeded'
  } else if (code === 400 && (text.includes('token') && text.includes('limit'))) {
    status = 413
    message = 'Token limit exceeded'
  }

  return { status, message }
}

module.exports = { getGeminiModel, mapGeminiError }
