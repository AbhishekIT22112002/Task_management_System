const taskService = require('../services/taskService')
const projectService = require('../services/projectService')

const create = async (req, res) => {
  try {
    const { projectId } = req.body
    
    // Check if project exists and user owns it
    const project = await projectService.getProjectById(projectId)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const taskData = { ...req.body, project: projectId }
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
    const projectId = req.params.projectId
    
    // Check if project exists and user owns it
    const project = await projectService.getProjectById(projectId)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const tasks = await taskService.getTasksByProject(projectId)
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    // Get existing task to check project ownership
    const existingTask = await taskService.getTaskById(req.params.id)
    if (!existingTask) return res.status(404).json({ error: 'Task not found' })
    
    const project = await projectService.getProjectById(existingTask.project._id || existingTask.project)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const task = await taskService.updateTask(req.params.id, req.body)
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    
    // Get existing task to check project ownership
    const existingTask = await taskService.getTaskById(req.params.id)
    if (!existingTask) return res.status(404).json({ error: 'Task not found' })
    
    const project = await projectService.getProjectById(existingTask.project._id || existingTask.project)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const task = await taskService.updateTask(req.params.id, { status })
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    // Get existing task to check project ownership
    const existingTask = await taskService.getTaskById(req.params.id)
    if (!existingTask) return res.status(404).json({ error: 'Task not found' })
    
    const project = await projectService.getProjectById(existingTask.project._id || existingTask.project)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
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
