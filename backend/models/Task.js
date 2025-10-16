const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { 
      type: String, 
      enum: ['todo', 'in-progress', 'review', 'done'], 
      default: 'todo' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    tags: [{ type: String }],
    assignee: { type: String }, // Can be expanded to ObjectId ref later
    dueDate: { type: Date },
    position: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    attachments: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Task', TaskSchema)
