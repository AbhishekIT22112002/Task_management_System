const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes to speed up common queries
ProjectSchema.index({ owner: 1, createdAt: -1 })
ProjectSchema.index({ name: 'text', description: 'text' })

module.exports = mongoose.model('Project', ProjectSchema)
