import { createSlice } from '@reduxjs/toolkit';

// Get initial theme from localStorage if available, otherwise default to 'light'
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  }
  return 'light';
};

const initialState = {
  theme: getInitialTheme()
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.theme);
      }
    }
  }
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer; 