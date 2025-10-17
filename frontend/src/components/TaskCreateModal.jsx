import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

const TaskCreateModal = React.memo(function TaskCreateModal({ isOpen, onClose, onSubmit, columnStatus, projectName, allowStatusSelect = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: columnStatus || 'todo'
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task name is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Task name must be at least 3 characters'
    }
    
    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (field === 'status' && !allowStatusSelect) return
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status
      })
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: columnStatus || 'todo'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  const getStatusTitle = (status) => {
    switch (status) {
      case 'todo': return 'To Do'
      case 'in-progress': return 'In Progress'
      case 'review': return 'Review'
      case 'done': return 'Done'
      default: return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Create New Task</h2>
            <p className="modal-subtitle">
              Adding to <strong>{getStatusTitle(formData.status)}</strong> in {projectName}
            </p>
          </div>
          <button 
            className="btn btn-ghost btn-icon"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Task Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="taskTitle">
              Task Name *
            </label>
            <input
              id="taskTitle"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter task name..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
              autoFocus
            />
            {errors.title && (
              <div className="form-error">
                <AlertCircle size={14} />
                {errors.title}
              </div>
            )}
            <div className="form-hint">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Task Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="taskDescription">
              Description
            </label>
            <textarea
              id="taskDescription"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe the task details, requirements, or notes..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
            />
            {errors.description && (
              <div className="form-error">
                <AlertCircle size={14} />
                {errors.description}
              </div>
            )}
            <div className="form-hint">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Status (optional) */}
          {allowStatusSelect && (
            <div className="form-group">
              <label className="form-label" htmlFor="taskStatus">
                Status
              </label>
              <select
                id="taskStatus"
                className="form-select"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          )}

          {/* Priority Level */}
          <div className="form-group">
            <label className="form-label" htmlFor="taskPriority">
              Priority Level
            </label>
            <div className="priority-selector">
              {['low', 'medium', 'high'].map(priority => (
                <button
                  key={priority}
                  type="button"
                  className={`priority-option ${formData.priority === priority ? 'selected' : ''}`}
                  onClick={() => handleInputChange('priority', priority)}
                  disabled={isSubmitting}
                >
                  <div 
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(priority) }}
                  />
                  <span className="priority-label">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
})

export default TaskCreateModal
