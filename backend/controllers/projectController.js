const projectService = require('../services/projectService')
const taskService = require('../services/taskService')

const create = async (req, res) => {
  try {
    const payload = { ...req.body }
    if (req.user) payload.owner = req.user._id
    const project = await projectService.createProject(payload)
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const list = async (req, res) => {
  try {
    const projects = await projectService.getProjects()
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const get = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const board = async (req, res) => {
  try {
    const projectId = req.params.id
    const project = await projectService.getProjectById(projectId)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    const tasks = await taskService.getTasksByProject(projectId)
    res.json({ project, tasks })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { create, list, get, board, update, remove }
