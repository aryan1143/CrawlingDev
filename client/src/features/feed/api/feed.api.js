import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/services/api";

export const feedApi = createApi({
  reducerPath: "feedApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getMyfeed: builder.query({
      query: ({ limit, page }) => ({
        url: "feed",
        params: { limit, page },
      }),
    }),
    searchProjects: builder.query({
      query: ({ q, page = 1, limit = 6 }) => ({
        url: "feed/search",
        params: { q, page, limit },
      }),
    }),
  }),
});

export const { useGetMyfeedQuery, useLazySearchProjectsQuery } = feedApi;
