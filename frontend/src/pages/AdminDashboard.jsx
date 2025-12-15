import { useState } from "react";
import {
  useGetAllComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAssignComplaintMutation,
} from "../api/complaintApi";
import { useGetWardensQuery } from "../api/userApi"; // fetch wardens
import { toast } from "react-hot-toast";

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

  if (isLoading) return <p className="p-6">Loading complaints...</p>;
  if (isError) return <p className="p-6 text-red-500">Error loading complaints</p>;

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
      toast.success("Assigned to warden ✅");
      setSelectedWarden((prev) => ({ ...prev, [complaintId]: "" })); // clear selection
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign warden ❌");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Admin Dashboard – All Complaints
      </h1>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div
            key={c._id}
            className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4"
          >
            {/* Complaint Info */}
            <div className="flex-1 space-y-1">
              <p><strong>Title:</strong> {c.title}</p>
              <p><strong>Category:</strong> {c.category}</p>
              <p><strong>Status:</strong> {c.status}</p>
              <p><strong>Student:</strong> {c.student?.name || "Unknown"} ({c.student?.email || "N/A"})</p>
              <p><strong>Warden:</strong> {c.warden?.name || "Unassigned"}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {/* Status Update */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Change Status:</label>
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Assign Warden */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Assign Warden:</label>
                <select
                  value={selectedWarden[c._id] || ""}
                  onChange={(e) =>
                    setSelectedWarden((prev) => ({ ...prev, [c._id]: e.target.value }))
                  }
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Select Warden</option>
                  {wardens.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.email})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssignWarden(c._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition mt-1"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
