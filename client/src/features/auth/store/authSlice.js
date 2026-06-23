import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      Object.assign(state, initialState);
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setProfilePic(state, action) {
      if (state.user) {
        state.user.profile_pic = action.payload;
      }
    },
    setBanner(state, action) {
      if (state.user) {
        state.user.banner = action.payload;
      }
    },
  },
});

export const {
  setAccessToken,
  setUser,
  logout,
  setLoading,
  setError,
  setProfilePic,
  setBanner,
} = authSlice.actions;
export default authSlice.reducer;
