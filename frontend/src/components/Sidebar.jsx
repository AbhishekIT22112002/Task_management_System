import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Folder, LayoutDashboard, Settings, LogOut, ChevronDown, ChevronRight, ChevronLeft, Menu, X, User, Home } from 'lucide-react'
import { logoutAndClearData } from '../slices/authSlice'

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose, onSidebarClick }) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const projects = useSelector((s) => s.projects.items || [])
  const user = useSelector((s) => s.auth.user)
  const [showKanbanDropdown, setShowKanbanDropdown] = useState(false)
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false)

  const isActive = (path) => location.pathname === path
  const isKanbanActive = location.pathname.includes('/project/') || location.pathname === '/board'

  const handleLogout = async () => {
    try {
      await dispatch(logoutAndClearData())
      navigate('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, navigate to auth page
      navigate('/auth')
    }
  }

  const handleProjectSelect = (projectId) => {
    navigate(`/project/${projectId}`)
    setShowKanbanDropdown(false)
  }

  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="mobile-menu-overlay" onClick={onMobileClose} />
      )}
      
      <div 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={onSidebarClick}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Home size={24} />
            </div>
            {!isCollapsed && (
              <span className="brand-text">TaskFlow</span>
            )}
          </div>
          
          {/* Mobile close button */}
          <button className="mobile-close-btn" onClick={onMobileClose}>
            <X size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="user-profile">
          <div className="user-avatar">
            <span>{getUserInitials(user?.name)}</span>
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">Main</div>}
            
            <Link 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
              onClick={onMobileClose}
            >
              <LayoutDashboard size={20} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {/* Projects Section */}
          <div className="nav-section">
            <div className="nav-section-header">
              {!isCollapsed && <div className="nav-section-title">Projects</div>}
              {!isCollapsed && (
                <Link to="/create" className="btn-add-project" title="New Project">
                  <Plus size={16} />
                </Link>
              )}
              {isCollapsed && (
                <button 
                  className="nav-item nav-item-icon"
                  onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                  title="Projects"
                >
                  <Folder size={20} />
                </button>
              )}
            </div>

            {/* Projects List - Collapsed State */}
            {isCollapsed && showProjectsDropdown && (
              <div className="dropdown-content dropdown-projects">
                <div className="dropdown-header">
                  <span>Projects</span>
                  <Link to="/create" className="dropdown-add-btn">
                    <Plus size={14} />
                  </Link>
                </div>
                {projects.length > 0 ? (
                  projects.slice(0, 8).map((project) => (
                    <Link
                      key={project._id}
                      to={`/project/${project._id}`}
                      className={`dropdown-item ${isActive(`/project/${project._id}`) ? 'active' : ''}`}
                      onClick={onMobileClose}
                    >
                      <Folder size={16} />
                      <span>{project.name}</span>
                      <span className="task-count">{project.taskStats?.total || 0}</span>
                    </Link>
                  ))
                ) : (
                  <div className="dropdown-item disabled">
                    <span>No projects</span>
                  </div>
                )}
              </div>
            )}

            {/* Projects List - Expanded State */}
            {!isCollapsed && (
              <div className="projects-list">
                {projects.length > 0 ? (
                  projects.slice(0, 8).map((project) => (
                    <Link
                      key={project._id}
                      to={`/project/${project._id}`}
                      className={`nav-item project-item ${isActive(`/project/${project._id}`) ? 'active' : ''}`}
                      onClick={onMobileClose}
                    >
                      <Folder size={16} />
                      <span className="project-name">{project.name}</span>
                      <div className="project-stats">
                        <span className="task-count">{project.taskStats?.total || 0}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="empty-projects">
                    <p>No projects yet</p>
                    <Link to="/create" className="btn btn-ghost btn-sm" onClick={onMobileClose}>
                      <Plus size={14} />
                      Create Project
                    </Link>
                  </div>
                )}
                {projects.length > 8 && (
                  <Link to="/" className="nav-item view-all-projects">
                    <span>View all projects ({projects.length})</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button 
            className="nav-item logout-btn" 
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
          
          {/* Collapse Toggle - Desktop Only */}
          <button 
            className="collapse-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </>
  )
}