import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  username: '',
  email: '',
  uid: '',
  streakCount: 0,
  lastLogin: null as Date | null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInUser: (state, action) => {
      state.name = action.payload.name
      state.username = action.payload.username
      state.email = action.payload.email
      state.uid = action.payload.uid
      state.streakCount = action.payload.streakCount || 0
      state.lastLogin = action.payload.lastLogin || null
    },
    signOutUser: (state) => {
      state.name = ''
      state.username = ''
      state.email = ''
      state.uid = ''
      state.streakCount = 0
      state.lastLogin = null
    },
    updateStreak: (state, action) => {
      state.streakCount = action.payload.streakCount
      state.lastLogin = action.payload.lastLogin
    }
  }
});

export const { signInUser, signOutUser, updateStreak } = userSlice.actions;

export default userSlice.reducer;
