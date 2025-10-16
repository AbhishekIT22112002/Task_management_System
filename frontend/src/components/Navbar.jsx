import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronDown, Plus, Folder, LayoutDashboard, Settings, User, LogOut } from 'lucide-react'
import { logout } from '../slices/authSlice'

export default function Navbar() {
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const projects = useSelector((s) => s.projects.items || [])
  const user = useSelector((s) => s.auth.user)
  
  const projectsRef = useRef()
  const userMenuRef = useRef()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (projectsRef.current && !projectsRef.current.contains(event.target)) {
        setProjectsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    setUserMenuOpen(false)
  }

  const getUserInitials = (user) => {
    if (!user || !user.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="navbar">
      <nav className="nav">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="logo">
            T
          </div>
          <span className="brand-text">TaskManager</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-menu">
          <div className="nav-links">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            
            {/* Projects Dropdown */}
            <div className="project-dropdown" ref={projectsRef}>
              <button 
                className={`dropdown-trigger ${projectsOpen ? 'open' : ''}`}
                onClick={() => setProjectsOpen(!projectsOpen)}
              >
                <Folder size={16} />
                Projects
                <ChevronDown size={16} className="chevron" />
              </button>
              
              <div className={`dropdown-menu ${projectsOpen ? 'open' : ''}`}>
                <div className="dropdown-header">
                  <div className="title">My Projects</div>
                </div>
                
                <div className="dropdown-section">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <Link 
                        key={project._id}
                        to={`/project/${project._id}`}
                        className="dropdown-item"
                        onClick={() => setProjectsOpen(false)}
                      >
                        <Folder size={18} className="item-icon" />
                        <div className="item-content">
                          <div className="item-title">{project.name}</div>
                          <div className="item-subtitle">
                            {project.description || 'No description'}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="dropdown-item" style={{ opacity: 0.7 }}>
                      <Folder size={18} className="item-icon" />
                      <div className="item-content">
                        <div className="item-title">No projects yet</div>
                        <div className="item-subtitle">Create your first project</div>
                      </div>
                    </div>
                  )}
                  
                  <Link 
                    to="/create" 
                    className="dropdown-item create-new"
                    onClick={() => setProjectsOpen(false)}
                  >
                    <Plus size={18} className="item-icon" />
                    <div className="item-content">
                      <div className="item-title">Create New Project</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <Link 
              to="/board" 
              className={`nav-link ${isActive('/board') ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              Board
            </Link>
          </div>

          {/* User Menu */}
          <div className="user-menu" ref={userMenuRef}>
            <div 
              className="user-avatar"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              {getUserInitials(user)}
            </div>
            
            {userMenuOpen && (
              <div className="dropdown-menu open" style={{ right: 0, left: 'auto' }}>
                <div className="dropdown-header">
                  <div className="title">{user?.name || 'User'}</div>
                  <div className="subtitle">{user?.email}</div>
                </div>
                
                <div className="dropdown-section">
                  <button className="dropdown-item">
                    <User size={18} className="item-icon" />
                    <div className="item-content">
                      <div className="item-title">Profile</div>
                    </div>
                  </button>
                  
                  <button className="dropdown-item">
                    <Settings size={18} className="item-icon" />
                    <div className="item-content">
                      <div className="item-title">Settings</div>
                    </div>
                  </button>
                  
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={18} className="item-icon" />
                    <div className="item-content">
                      <div className="item-title">Sign Out</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-button ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="nav-links mobile-open">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          
          <Link 
            to="/create" 
            className={`nav-link ${isActive('/create') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus size={16} />
            New Project
          </Link>
          
          <Link 
            to="/board" 
            className={`nav-link ${isActive('/board') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={16} />
            Board
          </Link>
          
          <button 
            className="nav-link"
            onClick={() => {
              handleLogout()
              setMobileMenuOpen(false)
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
