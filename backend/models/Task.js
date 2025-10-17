const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, index: true },
    description: { type: String },
    status: { 
      type: String, 
      enum: ['todo', 'in-progress', 'review', 'done'], 
      default: 'todo',
      index: true,
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium',
      index: true,
    },
    tags: [{ type: String, index: true }],
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    dueDate: { type: Date, index: true },
    position: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    attachments: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Compound indexes for board operations and sorting
TaskSchema.index({ project: 1, status: 1, position: 1 })
TaskSchema.index({ project: 1, createdAt: -1 })
TaskSchema.index({ tags: 1 })

module.exports = mongoose.model('Task', TaskSchema)
