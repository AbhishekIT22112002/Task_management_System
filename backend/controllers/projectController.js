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
    const userId = req.user?._id
    const projects = await projectService.getProjects(userId)
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const get = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    
    // Check if user owns the project
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
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
    
    // Check if user owns the project
    if (req.user && project.owner && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const tasks = await taskService.getTasksByProject(projectId)
    res.json({ project, tasks })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    const existingProject = await projectService.getProjectById(req.params.id)
    if (!existingProject) return res.status(404).json({ error: 'Project not found' })
    
    // Check if user owns the project
    if (req.user && existingProject.owner && existingProject.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const project = await projectService.updateProject(req.params.id, req.body)
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const existingProject = await projectService.getProjectById(req.params.id)
    if (!existingProject) return res.status(404).json({ error: 'Project not found' })
    
    // Check if user owns the project
    if (req.user && existingProject.owner && existingProject.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    const project = await projectService.deleteProject(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { create, list, get, board, update, remove }
