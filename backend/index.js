require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const logger = require('./utils/logger')
const path = require('path');

const app = express()

// Require environment variables (no hardcoded fallbacks)
const port = process.env.PORT
if (!port) {
  logger.error('PORT environment variable is required')
  process.exit(1)
}

const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  logger.error('MONGODB_URI environment variable is required')
  process.exit(1)
}

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Conditional CORS: allow browser requests originating from port 3000 (development frontend)
// and allow non-browser / server-to-server requests which don't send an Origin header.
// For any other origin, the Access-Control-Allow-* headers will not be set and the
// browser will block the request.
// Optional CORS with env-configured allowed origins
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

if (allowedOrigins.length > 0) {
  app.use(cors({
    origin: function (origin, callback) {
      // No origin (curl, server-to-server) -> allow
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }))
}
app.use(express.json())

// Request logging
const requestLogger = require('./middleware/requestLogger')
app.use(requestLogger)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Routes
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const tasksRoutes = require('./routes/tasks')
const aiRoutes = require('./routes/ai')
const authMiddleware = require('./middleware/authMiddleware')

// API routes must be before the SPA fallback
app.use('/api/auth', authRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)
app.use('/api/tasks', authMiddleware, tasksRoutes)
app.use('/api/ai', authMiddleware, aiRoutes)

// SPA fallback (after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Connect to MongoDB then start server
connectDB(mongoUri).then(() => {
  app.listen(port, () => {
    logger.info(`Backend listening on port ${port}`)
  })
})

// Error handler (logs error details)
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack })
  res.status(500).json({ error: 'Internal server error' })
})
