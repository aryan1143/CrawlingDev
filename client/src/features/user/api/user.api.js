import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/services/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "users/me",
        method: "PATCH",
        body: profileData,
      }),
    }),

    updateBadge: builder.mutation({
      query: (badge) => ({
        url: "users/me/badge",
        method: "PATCH",
        body: badge,
      }),
    }),

    updateReputation: builder.mutation({
      query: (reputation) => ({
        url: "users/me/reputation",
        method: "PATCH",
        body: reputation,
      }),
    }),

    updateProfilePic: builder.mutation({
      query: (imageSrc) => ({
        url: "users/me/profile-pic",
        method: "PUT",
        body: imageSrc,
      }),
    }),
    updateBanner: builder.mutation({
      query: (bannerId) => ({
        url: "users/me/banner",
        method: "PATCH",
        body: { bannerId },
      }),
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: "users/me",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useUpdateBadgeMutation,
  useUpdateReputationMutation,
  useUpdateProfilePicMutation,
  useUpdateBannerMutation,
  useDeleteAccountMutation,
} = userApi;
