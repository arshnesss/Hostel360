// frontend/src/api/userApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getWardens: builder.query({
      query: () => "/users/wardens",
    }),
  }),
});

export const { useGetWardensQuery } = userApi;

