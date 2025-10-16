import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, MoreVertical, Clock, User, Calendar, MessageSquare, Paperclip, Bot, Sparkles, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { fetchProjects, fetchProjectBoard } from '../slices/projectsSlice'
import { fetchTasks, createTask, updateTaskStatus } from '../slices/tasksSlice'
import TaskCreateModal from './TaskCreateModal'
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
  
  const dispatch = useDispatch()
  const params = useParams()
  const projects = useSelector((state) => state.projects.items || [])
  const { currentProject, currentBoard, status: projectStatus } = useSelector((state) => state.projects)
  const tasks = useSelector((state) => state.tasks.items || [])
  const { status: tasksStatus } = useSelector((state) => state.tasks)
  
  const loading = projectStatus === 'loading' || tasksStatus === 'loading'
  const projectId = params.id

  useEffect(() => {
    if (projectId) {
      // Fetch project board data (includes project info and tasks)
      dispatch(fetchProjectBoard(projectId))
    } else {
      // If no project ID, redirect to dashboard or show project selector
      dispatch(fetchProjects())
    }
  }, [dispatch, projectId])
  
  useEffect(() => {
    if (projectId && currentProject) {
      // Fetch tasks for the current project
      dispatch(fetchTasks(projectId))
    }
  }, [dispatch, projectId, currentProject])

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    try {
      // Update task status using Redux action
      await dispatch(updateTaskStatus({ 
        id: draggableId, 
        status: destination.droppableId 
      }))
      toast.success('Task moved successfully')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to move task')
    }
  }

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.status === columnId)
  }

  const handleOpenTaskModal = (columnStatus) => {
    if (!projectId) {
      toast.error('Please select a project first')
      return
    }
    setSelectedColumnStatus(columnStatus)
    setIsTaskModalOpen(true)
  }

  const handleCreateTask = async (taskData) => {
    try {
      await dispatch(createTask({
        ...taskData,
        projectId
      }))
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Error creating task:', error)
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
          <button className="btn btn-secondary btn-sm">
            <Sparkles size={16} />
            Summarize All
          </button>
          <button className="btn btn-primary btn-sm">
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
                              
                              <button className="btn btn-ghost btn-sm btn-icon">
                                <MoreVertical size={14} />
                              </button>
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
      
      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        columnStatus={selectedColumnStatus}
        projectName={currentProject?.name || 'Unknown Project'}
      />
    </>
  )
}
