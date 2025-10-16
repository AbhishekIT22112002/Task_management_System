import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import store from './store'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RequireAuth from './components/RequireAuth'
import ProjectsList from './components/ProjectsList'
import ProjectForm from './components/ProjectForm'
import KanbanBoard from './components/KanbanBoard'
import AIAssistant from './components/AIAssistant'
import AuthForm from './components/AuthForm'

function AppInner() {
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
