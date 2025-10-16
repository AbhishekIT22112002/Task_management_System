require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Routes
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const tasksRoutes = require('./routes/tasks')
const authMiddleware = require('./middleware/authMiddleware')

app.use('/api/auth', authRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)
app.use('/api/tasks', authMiddleware, tasksRoutes)

// Connect to MongoDB then start server
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management_db'
connectDB(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`)
  })
})
