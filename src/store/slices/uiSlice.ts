import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  darkMode: boolean
  sidebarOpen: boolean
}

const initialState: UiState = {
  darkMode: localStorage.getItem('dark_mode') === 'true',
  sidebarOpen: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('dark_mode', String(state.darkMode))
      document.documentElement.classList.toggle('dark', state.darkMode)
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
  },
})

export const { toggleDarkMode, setSidebarOpen } = uiSlice.actions
export default uiSlice.reducer
