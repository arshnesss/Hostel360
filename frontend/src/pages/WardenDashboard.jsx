import { useState } from "react";
import {
  useGetAssignedComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAddComplaintCommentMutation,
} from "../api/complaintApi";
import { toast } from "react-hot-toast";

const STATUS_TABS = [ "In Progress", "Resolved"];

const WardenDashboard = () => {
  const {
    data: complaints = [],
    isLoading,
    isError,
  } = useGetAssignedComplaintsQuery();

  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [addComment] = useAddComplaintCommentMutation();

  const [activeTab, setActiveTab] = useState("Open");
  const [comments, setComments] = useState({});

  if (isLoading) return <p className="p-6">Loading complaints...</p>;
  if (isError)
    return <p className="p-6 text-red-500">Error loading complaints</p>;

  // Filter complaints by status tab
  const filteredComplaints = complaints.filter(
    (c) => c.status === activeTab
  );

  // ✅ FIXED
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success("Status updated ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status ❌");
    }
  };

  const handleAddComment = async (id) => {
    const commentText = comments[id];
    if (!commentText?.trim()) {
      return toast.error("Enter a comment first");
    }

    try {
      await addComment({ id, comment: commentText }).unwrap();
      toast.success("Comment added ✅");
      setComments((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment ❌");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
        Warden Dashboard – Assigned Complaints
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 justify-center">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-semibold ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Complaints */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 && (
          <p className="text-center text-gray-500">
            No complaints in this tab.
          </p>
        )}

        {filteredComplaints.map((c) => (
          <div
            key={c._id}
            className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row md:justify-between gap-4"
          >
            {/* Info */}
            <div className="flex-1 space-y-1">
              <p><strong>Title:</strong> {c.title}</p>
              <p><strong>Category:</strong> {c.category}</p>
              <p><strong>Status:</strong> {c.status}</p>
              <p>
                <strong>Student:</strong>{" "}
                {c.student?.name} ({c.student?.email})
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold">Change Status:</label>
                <select
                  value={c.status}
                  onChange={(e) =>
                    handleStatusChange(c._id, e.target.value)
                  }
                  disabled={c.status === "Resolved"}
                  className="border rounded px-3 py-1"
                >
                  {/* <option value="Open">Open</option> */}
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your comment"
                  value={comments[c._id] || ""}
                  onChange={(e) =>
                    setComments((prev) => ({
                      ...prev,
                      [c._id]: e.target.value,
                    }))
                  }
                  className="border rounded px-3 py-1 flex-1"
                />
                <button
                  onClick={() => handleAddComment(c._id)}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  Add
                </button>
              </div>

              {/* History */}
              <div>
                <h3 className="font-semibold text-sm">Comments</h3>
                <ul className="text-sm text-gray-600">
                  {c.comments?.length ? (
                    c.comments.map((com, i) => (
                      <li key={i}>
                        • <b>{com.user?.name}:</b> {com.text}
                      </li>
                    ))
                  ) : (
                    <li>No comments yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardenDashboard;
