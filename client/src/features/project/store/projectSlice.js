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
      const projectId = action.payload;
      const updatedProjectsArr = state.projects.filter(
        (project) => project?.id !== projectId,
      );
      state.projects = updatedProjectsArr;
    },
  },
});

export const { setProject, setProjects, removeProject } = projectSlice.actions;

export default projectSlice.reducer;
