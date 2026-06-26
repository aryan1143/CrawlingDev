import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  project: null,
  projects: [],
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject(state, action) {
      state.project = action.payload;
      state.projects.unshift(action.payload);
    },
    setProjects(state, action) {
      state.projects = action.payload;
    },
    removeProject(state, action) {
      state.projects.shift();
    },
  },
});

export const { setProject, setProjects, removeProject } = projectSlice.actions;

export default projectSlice.reducer;
