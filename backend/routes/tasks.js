const express = require('express')
const router = express.Router()
const taskCtrl = require('../controllers/taskController')

// GET /api/tasks - Get all tasks
router.get('/', taskCtrl.getAll)

// GET /api/tasks/:id - Get specific task
router.get('/:id', taskCtrl.getById)

// GET /api/tasks/project/:projectId - Get tasks by project
router.get('/project/:projectId', taskCtrl.listByProject)

// POST /api/tasks - Create new task
router.post('/', taskCtrl.create)

// PUT /api/tasks/:id - Update task
router.put('/:id', taskCtrl.update)

// PATCH /api/tasks/:id/status - Update task status (for drag & drop)
router.patch('/:id/status', taskCtrl.updateStatus)

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskCtrl.remove)

module.exports = router
