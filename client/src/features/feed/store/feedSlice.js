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
      state.feed.push(action.payload);
    },

    tempAddLike(state, action) {
      const project = state.feed.find((p) => p.id === action.payload);
      if (project) {
        project.likes_count += 1;
        project.is_liked = true;
      }
    },

    tempRemoveLike(state, action) {
      const project = state.feed.find((p) => p.id === action.payload);
      if (project) {
        project.likes_count -= 1;
        project.is_liked = false;
      }
    },

    confirmLike(state, action) {
      const project = state.feed.find((p) => p.id === action.payload.projectId);
      if (project) {
        project.likes_count = action.payload.likes_count;
        project.is_liked = action.payload.is_liked;
      }
    },
  },
});

export const { addFeed, setFeed, tempAddLike, tempRemoveLike, confirmLike } =
  feedSlice.actions;
export default feedSlice.reducer;
