import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/store/authSlice";
import projectReducer from "../../features/project/store/projectSlice";
import feedReducer from "../../features/feed/store/feedSlice";
import { authApi } from "../../features/auth/api/auth.api";
import { userApi } from "../../features/user/api/user.api";
import { projectApi } from "../../features/project/api/project.api";
import { feedApi } from "../../features/feed/api/feed.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    feed: feedReducer,

    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [feedApi.reducerPath]: feedApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      projectApi.middleware,
      feedApi.middleware,
    ),
});
