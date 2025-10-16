import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const register = createAsyncThunk(
  'auth/register', 
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', payload)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login', 
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', payload)
      return res.data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

const initialState = { user: null, token: localStorage.getItem('token') || null, status: 'idle', error: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    }
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
        state.user = null
        state.token = null
      })
      // Login cases  
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
        state.user = null
        state.token = null
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
