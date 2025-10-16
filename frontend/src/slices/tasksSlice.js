import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

// Async thunks for task operations
export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch tasks'
      return rejectWithValue(message)
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/tasks', payload)
      
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create task'
      return rejectWithValue(message)
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tasks/${id}`, payload)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update task'
      return rejectWithValue(message)
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`)
      return id
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to delete task'
      return rejectWithValue(message)
    }
  }
)

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status })
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update task status'
      return rejectWithValue(message)
    }
  }
)


const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    byProject: {}, // Store tasks grouped by project ID
    status: 'idle',
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearTasks: (state) => {
      state.items = []
      state.byProject = {}
    },
    clearAllTaskData: (state) => {
      state.items = []
      state.byProject = {}
      state.status = 'idle'
      state.error = null
    },
    // Set tasks from project board data
    setTasksFromBoard: (state, action) => {
      state.items = action.payload
      state.status = 'succeeded'
      state.error = null
    },
    // Optimistic updates for drag and drop
    moveTaskLocally: (state, action) => {
      const { taskId, newStatus, newIndex } = action.payload
      const task = state.items.find(t => t._id === taskId)
      if (task) {
        task.status = newStatus
        task.order = newIndex
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.error = null
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload)
        state.error = null
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
      // Update Task Status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.error = null
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
  }
})

export const { clearError, clearTasks, clearAllTaskData, setTasksFromBoard, moveTaskLocally } = tasksSlice.actions
export default tasksSlice.reducer