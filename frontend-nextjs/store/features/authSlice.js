import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  user: {
    email: null,
    isAccess: null,
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: state => {
      state.isLoggedIn = initialState.isLoggedIn;
      state.user = initialState.user;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
