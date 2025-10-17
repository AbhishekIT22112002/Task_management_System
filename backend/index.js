require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const logger = require('./utils/logger')

const app = express()
const port = process.env.PORT || 4000

// Conditional CORS: allow browser requests originating from port 3000 (development frontend)
// and allow non-browser / server-to-server requests which don't send an Origin header.
// For any other origin, the Access-Control-Allow-* headers will not be set and the
// browser will block the request.
app.use(cors({
  origin: function (origin, callback) {
    // No origin (curl, server-to-server) -> allow
    if (!origin) return callback(null, true)
    // Allow any origin that includes :3000 (e.g. http://localhost:3000)
    try {
      if (origin.includes(':3000')) return callback(null, true)
    } catch (e) {
      // ignore
    }
    // Otherwise disallow by not setting CORS headers
    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))
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

app.use('/api/auth', authRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)
app.use('/api/tasks', authMiddleware, tasksRoutes)
app.use('/api/ai', authMiddleware, aiRoutes)

// Connect to MongoDB then start server
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management_db'
connectDB(mongoUri).then(() => {
  app.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`)
  })
})

// Error handler (logs error details)
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack })
  res.status(500).json({ error: 'Internal server error' })
})
