import React, { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
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
  useEffect(() => {
    // Check authentication on app startup if we have a token
    if (token && authStatus === 'idle') {
      dispatch(checkAuth())
    }
  }, [dispatch, token, authStatus])
  
  // Show loading spinner while checking auth
  const isInitialLoading = (token && authStatus === 'loading')
  
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
                  <Sidebar />
                  <div className="main-content">
                    <Routes>
                      <Route path="/" element={<ProjectsList />} />
                      <Route path="/create" element={<ProjectForm />} />
                      <Route path="/project/:id/edit" element={<ProjectForm />} />
                      <Route path="/board" element={<KanbanBoard />} />
                      <Route path="/project/:id" element={<KanbanBoard />} />
                    </Routes>
                  </div>
                  <AIAssistant />
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
