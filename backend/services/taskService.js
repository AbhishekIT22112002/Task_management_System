const Task = require('../models/Task')

const createTask = async (data) => {
  const task = new Task(data)
  return await task.save()
}

const getAllTasks = async () => {
  return await Task.find().populate('project', 'name').sort({ position: 1 })
}

const getTaskById = async (id) => {
  return await Task.findById(id).populate('project', 'name')
}

const getTasksByProject = async (projectId) => {
  return await Task.find({ project: projectId }).sort({ position: 1 })
}

const updateTask = async (id, data) => {
  return await Task.findByIdAndUpdate(id, data, { new: true }).populate('project', 'name')
}

const deleteTask = async (id) => {
  const task = await Task.findByIdAndDelete(id)
  return task ? true : false
}

module.exports = { createTask, getAllTasks, getTaskById, getTasksByProject, updateTask, deleteTask }
