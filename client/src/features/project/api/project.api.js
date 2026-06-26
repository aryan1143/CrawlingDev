import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/services/api";

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createProject: builder.mutation({
      query: (projectData) => ({
        url: "projects",
        method: "POST",
        body: projectData,
      }),
    }),
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useCreateProjectMutation, useDeleteProjectMutation } =
  projectApi;
