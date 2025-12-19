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
  // 🏷️ Added "Students" and "Wardens" to tagTypes for precise refreshing
  tagTypes: ["Complaint", "User", "Students", "Wardens"], 
  
  endpoints: (builder) => ({
    // 1. Get ALL complaints
    getAllComplaints: builder.query({
      query: () => "/complaints/all",
      providesTags: ["Complaint"],
    }),

    // 2. Get all wardens (legacy endpoint if needed)
    getWardens: builder.query({
      query: () => "/admin/users?role=warden",
      providesTags: ["Wardens"],
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
    
    // 4. Get Admin Analytics
    getAnalytics: builder.query({
      query: () => "/admin/analytics/complaints",
      providesTags: ["Complaint"], 
    }),

    // 5. User Management: Students
    getAllStudents: builder.query({
      query: () => "/admin/students",
      providesTags: ["Students"],
    }),

    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/admin/student/${id}`, // Matches the backend route we just made
        method: "DELETE",
      }),
      invalidatesTags: ["Students"], // 🔥 List refreshes immediately
    }),

    // 6. User Management: Wardens
    getAllWardens: builder.query({
      query: () => "/admin/wardens",
      providesTags: ["Wardens"],
    }),

    createWarden: builder.mutation({
      query: (data) => ({
        url: "/admin/warden/new",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Wardens"], // 🔥 List refreshes immediately
    }),

    deleteWarden: builder.mutation({
      query: (id) => ({
        url: `/admin/warden/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wardens"], // 🔥 List refreshes immediately
    }),

    getHotspots: builder.query({
      query: () => "/admin/hotspots",
      providesTags: ["Complaint"],
    }),
  }),
});

export const {
  useGetAllComplaintsQuery,
  useGetWardensQuery,
  useAssignComplaintMutation,
  useGetAnalyticsQuery,
  useGetAllStudentsQuery,
  useGetAllWardensQuery,
  useCreateWardenMutation,
  useDeleteWardenMutation,
  useDeleteStudentMutation, // ✅ Export the new hook
  useGetHotspotsQuery,
} = adminApi;