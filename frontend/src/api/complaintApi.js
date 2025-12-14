import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const complaintApi = createApi({
  reducerPath: "complaintApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Complaint"],
  endpoints: (builder) => ({

    // ===============================
    // STUDENT
    // ===============================

    createComplaint: builder.mutation({
      query: (formData) => ({
        url: "/complaints",
        method: "POST",
        body: formData, // supports FormData (images)
      }),
      invalidatesTags: ["Complaint"],
    }),

    getUserComplaints: builder.query({
      query: () => "/complaints/me",
      providesTags: ["Complaint"],
    }),

    // ===============================
    // WARDEN / ADMIN
    // ===============================

    getAllComplaints: builder.query({
      query: () => "/complaints",
      providesTags: ["Complaint"],
    }),

    updateComplaint: builder.mutation({
      query: ({ id, data }) => ({
        url: `/complaints/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Complaint"],
    }),

    assignComplaint: builder.mutation({
      query: ({ id, wardenId }) => ({
        url: `/complaints/${id}/assign`,
        method: "PUT",
        body: { wardenId },
      }),
      invalidatesTags: ["Complaint"],
    }),
  }),
});

export const {
  useCreateComplaintMutation,
  useGetUserComplaintsQuery,
  useGetAllComplaintsQuery,
  useUpdateComplaintMutation,
  useAssignComplaintMutation,
} = complaintApi;
