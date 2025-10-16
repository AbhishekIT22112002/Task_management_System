import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../slices/projectsSlice'
import { Plus, Calendar, Clock, Users, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'

export default function ProjectsList() {
  const dispatch = useDispatch()
  const { items, status } = useSelector((s) => s.projects)
  const [activeMenu, setActiveMenu] = useState(null)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProjects())
  }, [status, dispatch])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  if (status === 'loading') {
    return (
      <div className="container">
        <div className="page-header">
          <div>
            <div className="title">Projects</div>
            <div className="subtitle">Loading your projects...</div>
          </div>
        </div>
        <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
          <div className="loading"></div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="container">
        <div className="page-header">
          <div>
            <div className="title">Projects</div>
            <div className="subtitle">Failed to load projects</div>
          </div>
          <Link to="/create" className="btn btn-primary">
            <Plus size={16} />
            New Project
          </Link>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">Something went wrong while loading your projects.</p>
          <button 
            className="btn btn-primary"
            onClick={() => dispatch(fetchProjects())}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <div className="header-title">Projects</div>
          <div className="header-subtitle">
            {items.length === 0 ? 'No projects yet' : `${items.length} project${items.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        
        <div className="header-actions">
          <Link to="/create" className="btn btn-primary">
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">

      {/* Projects Grid */}
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#f3f4f6', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Plus size={32} color="#9ca3af" />
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>No projects yet</h3>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              Create your first project to get started with task management.
            </p>
            <Link to="/create" className="btn btn-primary">
              <Plus size={16} />
              Create First Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-auto">
          {items.map((project) => (
            <div key={project._id} className="project-card">
              <div className="card card-interactive">
                {/* Card Header */}
                <div className="card-header">
                  <Link 
                    to={`/project/${project._id}`}
                    className="project-title"
                  >
                    {project.name}
                  </Link>
                  <div className="project-actions">
                    <button 
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveMenu(activeMenu === project._id ? null : project._id)
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === project._id && (
                      <div className="action-menu">
                        <Link to={`/project/${project._id}`} className="action-item">
                          <Eye size={14} />
                          View
                        </Link>
                        <Link to={`/project/${project._id}/edit`} className="action-item">
                          <Edit size={14} />
                          Edit
                        </Link>
                        <button className="action-item danger">
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="project-content">
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="project-footer">
                  <div className="project-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Created {formatDate(project.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{getRelativeTime(project.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="project-stats">
                    <div className="stat-item">
                      <span className="stat-value">0</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">0</span>
                      <span className="stat-label">Done</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (placeholder) */}
                <div className="project-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                  <span className="progress-text">0% Complete</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  )
}
