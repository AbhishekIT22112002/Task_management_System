import { configureStore } from '@reduxjs/toolkit'
import projectsReducer, { clearAllProjectData } from './slices/projectsSlice'
import authReducer from './slices/authSlice'
import tasksReducer, { clearAllTaskData } from './slices/tasksSlice'

const store = configureStore({
  reducer: {
    projects: projectsReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
})

export default store
