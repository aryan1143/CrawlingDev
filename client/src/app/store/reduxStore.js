import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/store/authSlice";
import projectReducer from "../../features/project/store/projectSlice";
import { authApi } from "../../features/auth/api/auth.api";
import { userApi } from "../../features/user/api/user.api";
import { projectApi } from "../../features/project/api/project.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,

    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      projectApi.middleware,
    ),
});
