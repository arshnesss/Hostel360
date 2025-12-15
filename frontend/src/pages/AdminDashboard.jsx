import { useState } from "react";
import {
  useGetAllComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAssignComplaintMutation,
} from "../api/complaintApi";
import { useGetWardensQuery } from "../api/userApi";
import { toast } from "react-hot-toast";

// Helper function to get color for status badge
const getStatusClasses = (status) => {
  switch (status) {
    case "Open":
      return "bg-red-100 text-red-800 border-red-200";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const AdminDashboard = () => {
  // Fetch all complaints
  const { data: complaints = [], isLoading, isError } = useGetAllComplaintsQuery();

  // Mutations
  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [assignComplaint] = useAssignComplaintMutation();

  // Fetch wardens
  const { data: wardens = [] } = useGetWardensQuery();

  // Track selected warden per complaint
  const [selectedWarden, setSelectedWarden] = useState({});

  if (isLoading) return <p className="p-10 text-center text-lg">Loading complaints and wardens...</p>;
  if (isError) return <p className="p-10 text-center text-xl text-red-600 font-medium">Error loading data. Check API status.</p>;

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success("Status updated ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status ❌");
    }
  };

  // Handle assigning warden
  const handleAssignWarden = async (complaintId) => {
    const wardenId = selectedWarden[complaintId];
    if (!wardenId) return toast.error("Select a warden first");

    try {
      await assignComplaint({ id: complaintId, wardenId }).unwrap();
      toast.success("Assigned to warden successfully ✅");
      setSelectedWarden((prev) => ({ ...prev, [complaintId]: "" })); // clear selection
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign warden ❌");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700">
        Admin Dashboard – Global Oversight
      </h1>
      
      {complaints.length === 0 && (
          <p className="text-center text-xl text-gray-500 py-10">No complaints have been filed yet.</p>
      )}

      {/* Grid Container for Complaints (n x 2 layout) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {complaints.map((c) => {
          const isResolved = c.status === "Resolved";
          const isAssigned = !!c.warden;
          const isWardenSelected = !!selectedWarden[c._id];
          const canAssign = isWardenSelected && !isResolved;

          return (
            <div
              key={c._id}
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300"
            >
              
              {/* Top Section: Complaint Info & Status */}
              <div className="pb-4 border-b border-gray-200 mb-4 space-y-2">
                <h2 className="text-xl font-bold text-gray-900">{c.title}</h2>
                <div className="flex justify-between items-center text-sm">
                  <p>
                    <strong className="text-gray-700">Category:</strong> {c.category}
                  </p>
                  <span 
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClasses(c.status)}`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>

              {/* Middle Section: User Details & Current Assignment */}
              <div className="space-y-3 pb-4 border-b border-gray-100 mb-4 text-sm">
                <p>
                  <strong className="text-gray-700">Student:</strong> {c.student?.name || "Unknown"} ({c.student?.email || "N/A"})
                </p>
                <p>
                  <strong className="text-gray-700">Current Warden:</strong>{" "}
                  <span className={`font-medium ${isAssigned ? 'text-blue-600' : 'text-red-500 italic'}`}>
                    {c.warden?.name || "Unassigned"}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                    Filed on: {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Bottom Section: Actions (Status & Assignment) */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* 1. Status Update */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 block text-sm">Change Status:</label>
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c._id, e.target.value)}
                    disabled={isResolved}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* 2. Assign Warden (Centered) */}
                <div className="space-y-1 flex flex-col justify-center"> {/* Use flex-col and justify-center to vertically center */}
                  <label className="font-semibold text-gray-700 block text-sm">Assign Warden:</label>
                  <select
                    value={selectedWarden[c._id] || ""}
                    onChange={(e) =>
                      setSelectedWarden((prev) => ({ ...prev, [c._id]: e.target.value }))
                    }
                    disabled={isResolved}
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm flex-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">
                      {isAssigned ? `Reassign` : "Select Warden"}
                    </option>
                    {wardens.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleAssignWarden(c._id)}
                    disabled={!canAssign} // Only clickable if a warden is selected AND it's not resolved
                    // ✅ ENSURING COLORFUL BUTTON WHEN ACTIVE
                    className={`
                      w-full mt-2 py-2 rounded-lg text-sm font-medium transition duration-150
                      ${canAssign 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-400 text-gray-100 cursor-not-allowed'
                      }
                    `}
                  >
                    {isAssigned ? 'Reassign' : 'Assign'}
                  </button>
                  {isResolved && <p className="text-xs text-green-600 italic mt-2 text-center">Cannot modify a resolved complaint.</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;