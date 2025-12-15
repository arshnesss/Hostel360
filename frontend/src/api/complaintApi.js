import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const complaintApi = createApi({
  reducerPath: "complaintApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
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
        body: formData,
      }),
      invalidatesTags: ["Complaint"],
    }),

    getUserComplaints: builder.query({
      query: () => "/complaints/me",
      providesTags: ["Complaint"],
    }),

    // ===============================
    // ADMIN
    // ===============================

    getAllComplaints: builder.query({
      query: () => "/complaints",
      providesTags: ["Complaint"],
    }),

    assignComplaint: builder.mutation({
      query: ({ id, wardenId }) => ({
        url: `/complaints/${id}/assign`,
        method: "PUT",
        body: { wardenId },
      }),
      invalidatesTags: ["Complaint"],
    }),

    // ===============================
    // WARDEN
    // ===============================

    getAssignedComplaints: builder.query({
      query: () => "/complaints/assigned",
      providesTags: ["Complaint"],
    }),

    updateComplaintStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/complaints/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Complaint"],
    }),

    addComplaintComment: builder.mutation({
    query: ({ id, comment }) => ({
        url: `/complaints/${id}/comment`,
        method: "PUT",
        body: { comment },
    }),
    invalidatesTags: ["Complaint"],
    }),

  }),
});

// ===============================
// EXPORT HOOKS
// ===============================

export const {
  // Student
  useCreateComplaintMutation,
  useGetUserComplaintsQuery,

  // Admin
  useGetAllComplaintsQuery,
  useAssignComplaintMutation,

  // Warden
  useGetAssignedComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAddComplaintCommentMutation,
} = complaintApi;
