import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './slices/projectsSlice'
import authReducer from './slices/authSlice'
import tasksReducer from './slices/tasksSlice'

export default configureStore({
  reducer: {
    projects: projectsReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
})
