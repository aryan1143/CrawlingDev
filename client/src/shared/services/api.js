import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { setAccessToken, logout } from "../../features/auth/store/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3100/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const mutex = new Mutex();

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: "auth/refresh", method: "GET", credentials: "include" },
          api,
          extraOptions,
        );
        if (refreshResult.data?.accessToken) {
          api.dispatch(setAccessToken(refreshResult.data.accessToken));
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export { baseQuery, baseQueryWithReauth };
