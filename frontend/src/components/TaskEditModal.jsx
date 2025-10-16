import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle, Edit3 } from 'lucide-react'

const TaskEditModal = React.memo(function TaskEditModal({ isOpen, onClose, onSubmit, task }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium'
      })
    }
  }, [task])

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
        ...task,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      })
      onClose()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen || !task) return null

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
            <h2 className="modal-title">
              <Edit3 size={20} />
              Edit Task
            </h2>
            <p className="modal-subtitle">
              Update task details and information
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
                    Updating...
                  </>
                ) : (
                  'Update Task'
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

export default TaskEditModal
