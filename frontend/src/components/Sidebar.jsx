import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Folder, LayoutDashboard, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react'
import { logout } from '../slices/authSlice'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const projects = useSelector((s) => s.projects.items || [])
  const [showKanbanDropdown, setShowKanbanDropdown] = useState(false)

  const isActive = (path) => location.pathname === path
  const isKanbanActive = location.pathname.includes('/project/') || location.pathname === '/board'

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleProjectSelect = (projectId) => {
    navigate(`/project/${projectId}`)
    setShowKanbanDropdown(false)
  }

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            📋
          </div>
          <span className="brand-text">ProjectFlow AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          
          {/* Kanban Board with Project Dropdown */}
          <div className="nav-item-dropdown">
            <div className="nav-item-wrapper">
              <Link 
                to="/board" 
                className={`nav-item ${isKanbanActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Kanban Board</span>
              </Link>
              <button 
                className="expand-button"
                onClick={() => setShowKanbanDropdown(!showKanbanDropdown)}
                title="Select Project"
              >
                {showKanbanDropdown ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            
            {showKanbanDropdown && (
              <div className="dropdown-content">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <button
                      key={project._id}
                      className={`dropdown-item ${
                        location.pathname === `/project/${project._id}` ? 'active' : ''
                      }`}
                      onClick={() => handleProjectSelect(project._id)}
                    >
                      <Folder size={14} />
                      <span>{project.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="dropdown-item disabled">
                    <span>No projects available</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-section-header">
            <div className="nav-section-title">Projects</div>
            <Link to="/create" className="btn-add-project" title="New Project">
              <Plus size={14} />
            </Link>
          </div>

          <div className="projects-list">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/project/${project._id}`}
                  className={`nav-item project-item ${isActive(`/project/${project._id}`) ? 'active' : ''}`}
                >
                  <Folder size={16} />
                  <span className="project-name">{project.name}</span>
                  <div className="project-stats">
                    {/* This will be populated with real task count */}
                    <span className="task-count">0</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-projects">
                <p>No projects yet</p>
                <Link to="/create" className="btn btn-ghost btn-sm">
                  <Plus size={14} />
                  Create Project
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}