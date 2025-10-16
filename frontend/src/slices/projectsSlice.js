import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const fetchProjects = createAsyncThunk(
  'projects/fetch', 
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/projects')
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch projects'
      // If unauthorized, clear the projects
      if (error.response?.status === 401 || error.response?.status === 403) {
        return []
      }
      return rejectWithValue(message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/create', 
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/projects', payload)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create project'
      return rejectWithValue(message)
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/projects/${id}`, payload)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update project'
      return rejectWithValue(message)
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`)
      return id
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to delete project'
      return rejectWithValue(message)
    }
  }
)

export const fetchProjectBoard = createAsyncThunk(
  'projects/fetchBoard',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/board`)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch project board'
      return rejectWithValue(message)
    }
  }
)

const projectsSlice = createSlice({
  name: 'projects',
  initialState: { 
    items: [], 
    currentProject: null,
    currentBoard: null,
    status: 'idle',
    boardStatus: 'idle',
    error: null 
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload
    },
    clearCurrentProject: (state) => {
      state.currentProject = null
      state.currentBoard = null
    },
    resetProjectsState: (state) => {
      state.status = 'idle'
      state.boardStatus = 'idle'
      state.error = null
    },
    clearAllProjectData: (state) => {
      state.items = []
      state.currentProject = null
      state.currentBoard = null
      state.status = 'idle'
      state.boardStatus = 'idle'
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => { 
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => { 
        state.status = 'succeeded'
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchProjects.rejected, (state, action) => { 
        state.status = 'failed'
        state.error = action.payload || action.error.message
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => { 
        state.items.unshift(action.payload)
        state.error = null
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload
        }
        state.error = null
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload)
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null
          state.currentBoard = null
        }
        state.error = null
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.payload || action.error.message
      })
      // Fetch Project Board
      .addCase(fetchProjectBoard.pending, (state) => {
        state.boardStatus = 'loading'
        state.error = null
      })
      .addCase(fetchProjectBoard.fulfilled, (state, action) => {
        state.boardStatus = 'succeeded'
        state.currentProject = action.payload.project
        state.currentBoard = action.payload
        state.error = null
      })
      .addCase(fetchProjectBoard.rejected, (state, action) => {
        state.boardStatus = 'failed'
        state.error = action.payload || action.error.message
      })
  }
})

export const { clearError, setCurrentProject, clearCurrentProject, resetProjectsState, clearAllProjectData } = projectsSlice.actions
export default projectsSlice.reducer
