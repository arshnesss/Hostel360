import { useState } from "react";
import {
  useGetAssignedComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAddComplaintCommentMutation,
} from "../api/complaintApi";
import { toast } from "react-hot-toast";

const STATUS_TABS = ["Open", "In Progress", "Resolved"];

// Helper component for the colorful status badge
const StatusBadge = ({ status }) => {
  const statusClasses = status === "Open" 
    ? "bg-red-600" 
    : status === "In Progress" 
    ? "bg-yellow-600" 
    : "bg-green-600";
    
  return (
    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${statusClasses}`}>
      {status}
    </span>
  );
};

const WardenDashboard = () => {
  const {
    data: complaints = [],
    isLoading,
    isError,
  } = useGetAssignedComplaintsQuery();

  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [addComment] = useAddComplaintCommentMutation();

  const [activeTab, setActiveTab] = useState("Open"); // Changed initial state to 'Open' for better triaging
  const [comments, setComments] = useState({});

  if (isLoading) return <p className="p-8 text-center text-lg">Loading complaints...</p>;
  if (isError)
    return <p className="p-8 text-center text-xl text-red-600 font-medium">Error loading complaints</p>;

  const filteredComplaints = complaints.filter(
    (c) => c.status === activeTab
  );

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success("Status updated successfully ✅");
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
      toast.success("Comment added successfully ✅");
      setComments((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment ❌");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-green-700">
        Warden Dashboard – Assigned Complaints
      </h1>

      {/* Tabs - Centered and Clean */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 border-b border-gray-300 pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm
              ${
                activeTab === tab
                  ? "bg-green-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-700 hover:bg-green-100"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="max-w-4xl mx-auto space-y-6">
        {filteredComplaints.length === 0 && (
          <p className="text-center text-xl text-gray-500 py-10">
            ✅ No **{activeTab}** complaints to show.
          </p>
        )}

        {filteredComplaints.map((c) => (
          <div
            key={c._id}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-shadow duration-300 hover:shadow-2xl"
          >
            <div className="flex flex-col lg:flex-row lg:gap-8">
              
              {/* Complaint Info (Left Side) */}
              <div className="flex-1 space-y-3 lg:pr-6 border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{c.title}</h2>
                  {/* Status Badge Integration */}
                  <StatusBadge status={c.status} />
                </div>

                <p className="text-sm">
                  <strong className="text-gray-600">Category:</strong> {c.category}
                </p>
                <p className="text-sm">
                  <strong className="text-gray-600">Student:</strong>{" "}
                  {c.student?.name} ({c.student?.email})
                </p>

                {/* Timeline */}
                <div className="pt-2 space-y-1 text-xs border-t mt-4">
                  <p className="text-gray-500">
                    Filed: {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  {c.assignedAt && (
                    <p className="text-blue-600">
                      Assigned: {new Date(c.assignedAt).toLocaleDateString()}
                    </p>
                  )}
                  {c.resolvedAt && (
                    <p className="text-green-600 font-semibold">
                      Resolved: {new Date(c.resolvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions & Comments (Right Side) */}
              <div className="w-full lg:w-96 pt-4 lg:pt-0 space-y-4">
                
                {/* Status Update Dropdown */}
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700 block text-sm">Change Status:</label>
                  <select
                    value={c.status}
                    onChange={(e) =>
                      handleStatusChange(c._id, e.target.value)
                    }
                    disabled={c.status === "Resolved"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Comment Input (disabled after resolved) */}
                {c.status !== "Resolved" && (
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-700 block text-sm">Add Comment:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Resolution/Action taken..."
                        value={comments[c._id] || ""}
                        onChange={(e) =>
                          setComments((prev) => ({
                            ...prev,
                            [c._id]: e.target.value,
                          }))
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-green-500 focus:border-green-500"
                      />
                      <button
                        onClick={() => handleAddComment(c._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition duration-150"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Existing Comments Display */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                  <h3 className="font-bold text-sm mb-2 border-b pb-1 text-gray-700">
                    Complaint History
                  </h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {c.comments?.length ? (
                      c.comments.map((com, i) => (
                        <li key={i} className="border-b last:border-b-0 py-1">
                          <p>
                            <b className="text-gray-900">{com.user?.name || 'System'}:</b> {com.text}
                          </p>
                          <span className="text-gray-400 text-xxs">
                            {new Date(com.createdAt).toLocaleString()}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 italic">No activity yet.</li>
                    )}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardenDashboard;