import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  feed: [],
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeed(state, action) {
      state.feed = action.payload;
    },
    addFeed(state, action) {
      state.feed = [...state.feed, action.payload];
    },
  },
});

export const {} = feedSlice.actions;
export default feedSlice.reducer;
