import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, MoreVertical, Clock, User, Calendar, MessageSquare, Paperclip, Bot, Sparkles, ArrowLeft, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { fetchProjects, fetchProjectBoard } from '../slices/projectsSlice'
import { fetchTasks, createTask, updateTaskStatus } from '../slices/tasksSlice'
import { setTasksFromBoard, updateTask, deleteTask } from '../slices/tasksSlice'
import TaskCreateModal from './TaskCreateModal'
import TaskEditModal from './TaskEditModal'
import ConfirmModal from './ConfirmModal'
import AIAssistant from './AIAssistant'
import api from '../api'

const columns = [
  { id: 'todo', title: 'To Do', color: '#6b7280' },
  { id: 'in-progress', title: 'In Progress', color: '#eab308' },
  { id: 'review', title: 'Review', color: '#3b82f6' },
  { id: 'done', title: 'Done', color: '#22c55e' }
]

export default function KanbanBoard() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedColumnStatus, setSelectedColumnStatus] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [autoSummarize, setAutoSummarize] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allowStatusSelect, setAllowStatusSelect] = useState(false)
  
  const dispatch = useDispatch()
  const params = useParams()
  const projects = useSelector((state) => state.projects.items || [])
  const { currentProject, currentBoard, boardStatus } = useSelector((state) => state.projects)
  const tasks = useSelector((state) => state.tasks.items || [])
  const { status: tasksStatus } = useSelector((state) => state.tasks)
  
  const loading = boardStatus === 'loading' || tasksStatus === 'loading' || isRefreshing
  const projectId = params.id
  
  // Use tasks from currentBoard if available, otherwise fall back to tasks slice
  const boardTasks = currentBoard?.tasks || tasks

  useEffect(() => {
    if (projectId && (!currentProject || currentProject._id !== projectId)) {
      // Only fetch if we don't have the current project or it's different
      dispatch(fetchProjectBoard(projectId))
    }
  }, [dispatch, projectId, currentProject?._id])
  
  // Sync tasks from board data when available (only when board actually changes)
  useEffect(() => {
    if (currentBoard?.tasks && currentBoard.project?._id === projectId) {
      // Only sync if we don't have tasks or the project changed
      if (boardTasks.length === 0 || boardTasks[0]?.project !== projectId) {
        dispatch(setTasksFromBoard(currentBoard.tasks))
      }
    }
  }, [currentBoard?.project?._id, dispatch, projectId, currentBoard?.tasks?.length, boardTasks.length])
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openMenuId])

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Get current board tasks for optimistic update
    const currentTasks = [...boardTasks] // Create a copy to avoid mutations
    
    // Optimistically update the task status in local state first
    const updatedTasks = currentTasks.map(task => 
      task._id === draggableId 
        ? { ...task, status: destination.droppableId }
        : task
    )
    
    // Update local state immediately for smooth UI
    dispatch(setTasksFromBoard(updatedTasks))

    try {
      // Update task status on server
      const serverResult = await dispatch(updateTaskStatus({ 
        id: draggableId, 
        status: destination.droppableId 
      }))
      
      // If server update was successful, refresh the board data
      if (serverResult.meta.requestStatus === 'fulfilled') {
        // Refresh the board data from server to get latest state
        if (projectId) {
          const boardResult = await dispatch(fetchProjectBoard(projectId))
          if (boardResult.meta.requestStatus === 'fulfilled') {
            // Board data will be synced via useEffect
            toast.success('Task moved successfully')
          } else {
            // Board refresh failed, revert optimistic update
            dispatch(setTasksFromBoard(currentTasks))
            toast.error('Failed to refresh board data')
          }
        } else {
          toast.success('Task moved successfully')
        }
      } else {
        // Server update failed, revert
        dispatch(setTasksFromBoard(currentTasks))
        toast.error('Failed to move task')
      }
      
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to move task')
      // Revert the optimistic update on failure
      dispatch(setTasksFromBoard(currentTasks))
    }
  }

  const getTasksByColumn = (columnId) => {
    const q = searchQuery.trim().toLowerCase()
    return boardTasks.filter(task => {
      if (task.status !== columnId) return false
      if (!q) return true
      const t = (task.title || '').toLowerCase()
      const d = (task.description || '').toLowerCase()
      return t.includes(q) || d.includes(q)
    })
  }

  const handleOpenTaskModal = (columnStatus) => {
    if (!projectId) {
      toast.error('Please select a project first')
      return
    }
    setAllowStatusSelect(false)
    setSelectedColumnStatus(columnStatus)
    setIsTaskModalOpen(true)
  }

  const handleCreateTask = async (taskData) => {
    try {
      const result = await dispatch(createTask({
        ...taskData,
        projectId
      }))
      
      
      // If task creation was successful, refresh board data
      if (result.meta.requestStatus === 'fulfilled') {
        setIsRefreshing(true)
        // Refresh the entire board to get the latest data from server
        const boardResult = await dispatch(fetchProjectBoard(projectId))
        setIsRefreshing(false)
        toast.success('Task created successfully')
      } else {
        console.error('Task creation failed:', result.payload)
        toast.error(result.payload || 'Failed to create task')
        throw new Error('Task creation failed')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setIsRefreshing(false)
      toast.error('Failed to create task')
      throw error // Re-throw to let modal handle it
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days left`
  }

  const getDateColor = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return '#ef4444' // Overdue - red
    if (diffDays <= 2) return '#f59e0b' // Due soon - amber
    return '#6b7280' // Normal - gray
  }

  const handleEditTask = useCallback((task) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
    setOpenMenuId(null)
  }, [])

  const handleUpdateTask = useCallback(async (taskData) => {
    try {
      const result = await dispatch(updateTask({ id: editingTask._id, ...taskData }))
      
      
      // Update the task and refresh board data
      if (result.meta.requestStatus === 'fulfilled') {
        setIsRefreshing(true)
        // Refresh the entire board to get the latest data from server
        const boardResult = await dispatch(fetchProjectBoard(projectId))
        setIsRefreshing(false)
        toast.success('Task updated successfully')
      } else {
        console.error('Task update failed:', result.payload)
        toast.error(result.payload || 'Failed to update task')
        throw new Error('Task update failed')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      setIsRefreshing(false)
      toast.error('Failed to update task')
      throw error
    }
  }, [dispatch, editingTask?._id, projectId])

  const handleDeleteTask = useCallback((task) => {
    setTaskToDelete(task)
    setIsConfirmModalOpen(true)
    setOpenMenuId(null)
  }, [])

  const confirmDeleteTask = useCallback(async () => {
    try {
      const result = await dispatch(deleteTask(taskToDelete._id))
      
      
      // Delete the task and refresh board data
      if (result.meta.requestStatus === 'fulfilled') {
        setIsRefreshing(true)
        // Refresh the entire board to get the latest data from server
        const boardResult = await dispatch(fetchProjectBoard(projectId))
        setIsRefreshing(false)
        toast.success('Task deleted successfully')
      } else {
        console.error('Task deletion failed:', result.payload)
        toast.error(result.payload || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      setIsRefreshing(false)
      toast.error('Failed to delete task')
    }
  }, [dispatch, taskToDelete?._id, projectId])

  // Show project selector if no project ID
  if (!projectId) {
    return (
      <>
        <div className="top-header">
          <div>
            <div className="header-title">Kanban Board</div>
            <div className="header-subtitle">
              Select a project to view its tasks
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="empty-state">
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>No Project Selected</h3>
              <p className="text-muted" style={{ marginBottom: '2rem' }}>
                To view and manage tasks on the Kanban board, please select a project from the sidebar or go to the dashboard.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/" className="btn btn-primary">
                  Go to Dashboard
                </Link>
                <Link to="/create" className="btn btn-secondary">
                  Create Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <div className="top-header">
          <div>
            <div className="header-title">Loading...</div>
          </div>
        </div>
        <div className="page-content">
          <div className="flex justify-center items-center" style={{ minHeight: '400px' }}>
            <div className="loading"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn btn-ghost btn-icon">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="header-title">
                {currentProject ? currentProject.name : 'Project Board'}
              </div>
              <div className="header-subtitle">
                {currentProject ? (currentProject.description || 'No description') : 'Loading project...'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="flex items-center gap-2" style={{ minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: '240px' }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setAllowStatusSelect(true); setSelectedColumnStatus(null); setIsTaskModalOpen(true) }}
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setShowAI(true); setAutoSummarize(true) }}>
            <Sparkles size={16} />
            Summarize All
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowAI(true); setAutoSummarize(false) }}>
            <Bot size={16} />
            Ask AI
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-content">
        <div className="kanban-board">

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {columns.map(column => (
            <div key={column.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <div 
                    className="column-indicator"
                    style={{ backgroundColor: column.color }}
                  ></div>
                  <span>{column.title}</span>
                  <span className="task-count">
                    {getTasksByColumn(column.id).length}
                  </span>
                </div>
                
                <button 
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => handleOpenTaskModal(column.id)}
                  title={`Add task to ${column.title}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {getTasksByColumn(column.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            {/* Task Header */}
                            <div className="task-header">
                              <div className="task-priority">
                                <div 
                                  className="priority-indicator"
                                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                                ></div>
                                <span className="priority-label">{task.priority}</span>
                              </div>
                              
                              <div className="task-menu">
                                <button 
                                  className="btn btn-ghost btn-sm btn-icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === task._id ? null : task._id)
                                  }}
                                >
                                  <MoreVertical size={14} />
                                </button>
                                
                                {openMenuId === task._id && (
                                  <div className="dropdown-menu active">
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => handleEditTask(task)}
                                    >
                                      Edit Task
                                    </button>
                                    <button 
                                      className="dropdown-item text-red-600"
                                      onClick={() => handleDeleteTask(task)}
                                    >
                                      Delete Task
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Task Content */}
                            <div className="task-content">
                              <h3 className="task-title">{task.title}</h3>
                              <p className="task-description">{task.description}</p>
                            </div>

                            {/* Task Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="task-tags">
                                {task.tags.map(tag => (
                                  <span key={tag} className="task-tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Task Footer */}
                            <div className="task-footer">
                              <div className="task-meta">
                                {task.dueDate && (
                                  <div 
                                    className="meta-item"
                                    style={{ color: getDateColor(task.dueDate) }}
                                  >
                                    <Calendar size={12} />
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                )}
                                
                                {task.assignee && (
                                  <div className="meta-item">
                                    <User size={12} />
                                    <span>{task.assignee.split(' ').map(n => n[0]).join('')}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="task-stats">
                                {task.comments > 0 && (
                                  <div className="stat-item">
                                    <MessageSquare size={12} />
                                    <span>{task.comments}</span>
                                  </div>
                                )}
                                
                                {task.attachments > 0 && (
                                  <div className="stat-item">
                                    <Paperclip size={12} />
                                    <span>{task.attachments}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            ))}
        </div>
      </DragDropContext>
        </div>
      </div>
      
      {/* AI Assistant Modal */}
      <AIAssistant
        projectId={projectId}
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        autoSummarize={autoSummarize}
      />

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        columnStatus={selectedColumnStatus}
        allowStatusSelect={allowStatusSelect}
        projectName={currentProject?.name || 'Unknown Project'}
      />
      
      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleUpdateTask}
        task={editingTask}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setTaskToDelete(null)
        }}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
