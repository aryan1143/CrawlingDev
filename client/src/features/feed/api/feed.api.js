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
  }),
});

export const { useGetMyfeedQuery } = feedApi;
