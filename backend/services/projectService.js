const Project = require('../models/Project')

const createProject = async (data) => {
  const project = new Project(data)
  return await project.save()
}

const getProjects = async () => {
  return await Project.find().sort({ createdAt: -1 })
}

const getProjectById = async (id) => {
  return await Project.findById(id)
}

const updateProject = async (id, data) => {
  return await Project.findByIdAndUpdate(id, data, { new: true })
}

const deleteProject = async (id) => {
  return await Project.findByIdAndDelete(id)
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
}
