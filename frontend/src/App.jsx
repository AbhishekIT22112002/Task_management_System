import React, { useEffect, useState } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2, Menu } from 'lucide-react'
import store from './store'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RequireAuth from './components/RequireAuth'
import ProjectsList from './components/ProjectsList'
import ProjectForm from './components/ProjectForm'
import KanbanBoard from './components/KanbanBoard'
import AIAssistant from './components/AIAssistant'
import AuthForm from './components/AuthForm'
import { checkAuth } from './slices/authSlice'

function AppInner() {
  const dispatch = useDispatch()
  const { token, status: authStatus } = useSelector((state) => state.auth)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    // Check authentication on app startup if we have a token
    if (token && authStatus === 'idle') {
      dispatch(checkAuth())
    }
  }, [dispatch, token, authStatus])
  
  // Handle click outside sidebar to collapse it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle on desktop
      if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar')
        const mobileMenuButton = document.querySelector('.mobile-menu-button')
        
        if (sidebar && !sidebar.contains(event.target) && 
            !mobileMenuButton?.contains(event.target) && 
            !sidebarCollapsed) {
          setSidebarCollapsed(true)
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarCollapsed])
  
  // Show loading spinner while checking auth
  const isInitialLoading = (token && authStatus === 'loading')
  
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }
  
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }
  
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false)
  }
  
  const handleSidebarClick = () => {
    if (sidebarCollapsed && window.innerWidth > 768) {
      setSidebarCollapsed(false)
    }
  }
  
  if (isInitialLoading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <Loader2 className="loading-spinner" size={48} />
          <p>Loading your workspace...</p>
        </div>
      </div>
    )
  }
  return (
    <BrowserRouter>
      <div className="app-root">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <div className="app-layout">
                  <Sidebar 
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={handleSidebarToggle}
                    isMobileOpen={mobileMenuOpen}
                    onMobileClose={handleMobileMenuClose}
                    onSidebarClick={handleSidebarClick}
                  />
                  <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                    {/* Mobile Header */}
                    <div className="mobile-header">
                      <button 
                        className="mobile-menu-button"
                        onClick={handleMobileMenuToggle}
                      >
                        <Menu size={24} />
                      </button>
                      <div className="mobile-header-title">TaskFlow</div>
                    </div>
                    
                    <Routes>
                      <Route path="/" element={<ProjectsList />} />
                      <Route path="/create" element={<ProjectForm />} />
                      <Route path="/project/:id/edit" element={<ProjectForm />} />
                      <Route path="/board" element={<KanbanBoard />} />
                      <Route path="/project/:id" element={<KanbanBoard />} />
                    </Routes>
                  </div>
                </div>
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  )
}
