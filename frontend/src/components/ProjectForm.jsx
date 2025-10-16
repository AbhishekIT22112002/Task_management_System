import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { createProject, updateProject, fetchProjects } from '../slices/projectsSlice'
import { ArrowLeft, Plus, Check, AlertCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const { items: projects, status } = useSelector((s) => s.projects)
  
  const isEditMode = !!params.id
  const currentProject = isEditMode ? projects.find(p => p._id === params.id) : null

  // Load projects and populate form if in edit mode
  useEffect(() => {
    if (isEditMode) {
      if (projects.length === 0 && status === 'idle') {
        dispatch(fetchProjects())
      } else if (currentProject) {
        setFormData({
          name: currentProject.name || '',
          description: currentProject.description || ''
        })
      }
    }
  }, [isEditMode, currentProject, projects.length, dispatch, status])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Project name must be less than 50 characters'
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
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      }
      
      let result
      if (isEditMode) {
        result = await dispatch(updateProject({ id: params.id, ...projectData }))
      } else {
        result = await dispatch(createProject(projectData))
      }
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(isEditMode ? 'Project updated successfully!' : 'Project created successfully!')
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        toast.error(isEditMode ? 'Failed to update project' : 'Failed to create project')
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} project:`, error)
      toast.error(isEditMode ? 'Failed to update project' : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({ name: '', description: '' })
    setErrors({})
  }

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/" className="btn btn-ghost btn-icon">
              <ArrowLeft size={16} />
            </Link>
            <div className="header-title">{isEditMode ? 'Edit Project' : 'Create New Project'}</div>
          </div>
          <div className="header-subtitle">
            {isEditMode ? 'Update your project details' : 'Set up a new project to organize your tasks and collaborate with your team'}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card">
          {/* Project Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="projectName">
              Project Name *
            </label>
            <input
              id="projectName"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter project name (e.g., Website Redesign, Marketing Campaign)"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
              maxLength={50}
            />
            {errors.name && (
              <div className="form-error">
                <AlertCircle size={14} />
                {errors.name}
              </div>
            )}
            <div className="form-hint">
              {formData.name.length}/50 characters
            </div>
          </div>

          {/* Project Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="projectDescription">
              Description
            </label>
            <textarea
              id="projectDescription"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe what this project is about, its goals, and any important details..."
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

          {/* Form Actions */}
          <div className="form-actions">
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? <Save size={16} /> : <Plus size={16} />}
                    {isEditMode ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </button>
              
              <Link
                to="/"
                className="btn btn-ghost"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        {/* Help Text */}
        <div className="help-section">
          <div className="card card-compact" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tips for creating a great project:</h4>
            <ul className="text-sm text-gray-600 space-y-1" style={{ paddingLeft: '1rem' }}>
              <li>• Choose a clear, descriptive name that team members will understand</li>
              <li>• Add a detailed description to help collaborators understand the project goals</li>
              <li>• You can always edit these details later from the project settings</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
