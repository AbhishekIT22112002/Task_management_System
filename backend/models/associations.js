const User = require('./User')
const Project = require('./Project')
const Task = require('./Task')

function init() {
  // User -> Projects (one-to-many)
  if (!User.schema.virtuals.projects) {
    User.schema.virtual('projects', {
      ref: 'Project',
      localField: '_id',
      foreignField: 'owner',
      justOne: false,
    })
  }

  // User -> Tasks assigned (one-to-many)
  if (!User.schema.virtuals.tasksAssigned) {
    User.schema.virtual('tasksAssigned', {
      ref: 'Task',
      localField: '_id',
      foreignField: 'assignee',
      justOne: false,
    })
  }

  // Project -> Tasks (one-to-many)
  if (!Project.schema.virtuals.tasks) {
    Project.schema.virtual('tasks', {
      ref: 'Task',
      localField: '_id',
      foreignField: 'project',
      justOne: false,
    })
  }

  // Optionally initialize models (ensures indexes in dev)
  User.init?.()
  Project.init?.()
  Task.init?.()
}

module.exports = { init }
