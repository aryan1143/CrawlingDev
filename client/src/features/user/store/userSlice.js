import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reviews: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setReviews(state, action) {
      state.reviews = action.payload;
    },
  },
});

export const { setReviews } = userSlice.actions;

export default userSlice.reducer;
