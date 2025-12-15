import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Complaint", "User"],
  endpoints: (builder) => ({
    // 1. Get ALL complaints
    getAllComplaints: builder.query({
      query: () => "/complaints/all",
      providesTags: ["Complaint"],
    }),

    // 2. Get all wardens
    getWardens: builder.query({
      query: () => "/admin/users?role=warden",
      providesTags: ["User"],
    }),

    // 3. Assign complaint to warden
    assignComplaint: builder.mutation({
      query: ({ complaintId, wardenId }) => ({
        url: `/complaints/${complaintId}/assign`,
        method: "PUT",
        body: { wardenId },
      }),
      invalidatesTags: ["Complaint"],
    }),
  }),
});

export const {
  useGetAllComplaintsQuery,
  useGetWardensQuery,
  useAssignComplaintMutation,
} = adminApi;
