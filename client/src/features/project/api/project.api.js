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
    likePost: builder.mutation({
      query: (projectId) => ({
        url: `projects/like/${projectId}`,
        method: "POST",
      }),
    }),
    dislikePost: builder.mutation({
      query: (projectId) => ({
        url: `projects/like/${projectId}`,
        method: "DELETE",
      }),
    }),
    reviewPost: builder.mutation({
      query: (reviewData) => ({
        url: `projects/reviews`,
        method: "POST",
        body: reviewData,
      }),
    }),
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `projects/reviews/${reviewId}`,
        method: "DELETE",
      }),
    }),
    getMyProjects: builder.query({
      query: () => "projects/me",
    }),
    getProjectReviews: builder.query({
      query: ({ projectId, limit = 10, offset = 0 }) => ({
        url: `/projects/reviews/${projectId}`,
        params: { limit, offset },
      }),
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useLikePostMutation,
  useDislikePostMutation,
  useGetMyProjectsQuery,
  useReviewPostMutation,
  useDeleteReviewMutation,
  useGetProjectReviewsQuery,
  useLazyGetProjectReviewsQuery,
} = projectApi;
