const taskService = require('../services/taskService')

const create = async (req, res) => {
  try {
    const taskData = { ...req.body, project: req.body.projectId }
    const task = await taskService.createTask(taskData)
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAll = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks()
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const listByProject = async (req, res) => {
  try {
    const tasks = await taskService.getTasksByProject(req.params.projectId)
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const task = await taskService.updateTask(req.params.id, { status })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.id)
    if (!result) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json({ message: 'Task deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { create, getAll, getById, listByProject, update, updateStatus, remove }
