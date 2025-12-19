import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; // Added for auth
import { logout } from "../store/authSlice"; // Added for auth
import { useNavigate } from "react-router-dom"; // Added for navigation
import {
  useGetAssignedComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAddComplaintCommentMutation,
} from "../api/complaintApi";
import { toast } from "react-hot-toast";
import { Sun, Moon, LogOut, CheckCircle, Clock, MessageSquare } from "lucide-react"; // Added icons

const STATUS_TABS = ["Open", "In Progress", "Resolved"];

// Helper component for the colorful status badge
const StatusBadge = ({ status }) => {
  const statusClasses = status === "Open" 
    ? "badge-error" 
    : status === "In Progress" 
    ? "badge-warning" 
    : "badge-success";
    
  return (
    <span className={`badge badge-sm font-bold p-3 text-white ${statusClasses}`}>
      {status.toUpperCase()}
    </span>
  );
};

const WardenDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const {
    data: complaints = [],
    isLoading,
    isError,
  } = useGetAssignedComplaintsQuery();

  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [addComment] = useAddComplaintCommentMutation();

  const [activeTab, setActiveTab] = useState("Open");
  const [comments, setComments] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // --- Theme Toggle Logic ---
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Logout Logic ---
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  if (isLoading) return <div className="flex justify-center p-20"><span className="loading loading-spinner loading-lg text-green-600"></span></div>;
  if (isError) return <p className="p-8 text-center text-xl text-red-600 font-medium">Error loading complaints</p>;

  const filteredComplaints = complaints.filter((c) => c.status === activeTab);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success("Status updated ✅");
    } catch (err) {
      toast.error("Failed to update status ❌");
    }
  };

  const handleAddComment = async (id) => {
    const commentText = comments[id];
    if (!commentText?.trim()) return toast.error("Enter a comment first");

    try {
      await addComment({ id, comment: commentText }).unwrap();
      toast.success("Comment added ✅");
      setComments((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      toast.error("Failed to add comment ❌");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-base-100 text-base-content min-h-screen transition-colors duration-300">
      
      {/* ➡️ TOP HEADER SECTION */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-8 bg-base-200 p-4 rounded-2xl shadow-sm border border-base-300">
          <div className="flex items-center space-x-3">
              <span className="badge badge-lg bg-green-600 text-white font-bold px-4 py-4 border-none shadow-md">
                  WARDEN
              </span>
              <h2 className="text-sm font-bold opacity-60 hidden sm:block uppercase tracking-widest">
                  Assigned Oversight
              </h2>
          </div>

          <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
                  {theme === 'light' ? <Moon size={22} /> : <Sun size={22} className="text-yellow-400" />}
              </button>

              <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
              </button>
          </div>
      </div>

      <h1 className="text-3xl font-black mb-8 text-center text-green-600 tracking-tight">
        Complaint Management
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-10">
          <div className="bg-base-200 p-1.5 rounded-2xl flex gap-2 border border-base-300 shadow-inner">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 
                  ${activeTab === tab 
                    ? "bg-green-600 text-white shadow-lg scale-105" 
                    : "hover:bg-base-300 opacity-70"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
      </div>

      {/* Complaints List */}
      <div className="max-w-5xl mx-auto space-y-6">
        {filteredComplaints.length === 0 ? (
          <div className="text-center bg-base-200 rounded-3xl p-20 border-2 border-dashed border-base-300">
             <p className="text-xl opacity-40 italic font-medium">No **{activeTab}** complaints found.</p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div key={c._id} className="bg-base-200 p-6 rounded-3xl shadow-xl border border-base-300 group transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:gap-8">
                
                {/* Left Side: Info */}
                <div className="flex-1 space-y-4 lg:pr-6 border-b lg:border-b-0 lg:border-r border-base-300 pb-6 lg:pb-0">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-black group-hover:text-green-600 transition-colors">{c.title}</h2>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="opacity-50 font-bold text-[10px] uppercase">Category</span> <span className="font-semibold">{c.category}</span></p>
                    <p className="flex justify-between"><span className="opacity-50 font-bold text-[10px] uppercase">Student</span> <span className="font-semibold">{c.student?.name}</span></p>
                  </div>

                  <div className="pt-4 space-y-2 border-t border-base-300">
                    <p className="text-[10px] font-bold opacity-40 flex items-center gap-2"><Clock size={12}/> FILED: {new Date(c.createdAt).toLocaleString()}</p>
                    {c.assignedAt && <p className="text-[10px] font-bold text-blue-500 flex items-center gap-2"><Clock size={12}/> ASSIGNED: {new Date(c.assignedAt).toLocaleString()}</p>}
                    {c.resolvedAt && <p className="text-[10px] font-bold text-green-500 flex items-center gap-2"><CheckCircle size={12}/> RESOLVED: {new Date(c.resolvedAt).toLocaleString()}</p>}
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="w-full lg:w-96 pt-6 lg:pt-0 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 ml-1">Status Action</label>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      disabled={c.status === "Resolved"}
                      className="select select-bordered w-full bg-base-100 font-bold border-none shadow-inner focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {c.status !== "Resolved" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-1">Add Resolution Comment</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Update student..."
                          value={comments[c._id] || ""}
                          onChange={(e) => setComments((prev) => ({ ...prev, [c._id]: e.target.value }))}
                          className="input input-bordered flex-1 bg-base-100 border-none shadow-inner"
                        />
                        <button onClick={() => handleAddComment(c._id)} className="btn bg-green-600 hover:bg-green-700 text-white border-none shadow-md px-6">
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-base-100 p-4 rounded-2xl border border-base-300 max-h-48 overflow-y-auto">
                    <h3 className="text-[10px] font-black uppercase opacity-40 mb-3 flex items-center gap-2">
                      <MessageSquare size={12}/> History
                    </h3>
                    <ul className="space-y-3">
                      {c.comments?.length ? (
                        c.comments.map((com, i) => (
                          <li key={i} className="text-xs border-l-2 border-green-500/30 pl-3">
                            <p className="font-bold opacity-80">{com.user?.name || 'System'}</p>
                            <p className="opacity-70 mt-0.5">{com.text}</p>
                            <p className="text-[9px] opacity-30 mt-1">{new Date(com.createdAt).toLocaleDateString()}</p>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs opacity-30 italic">No activity logs.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WardenDashboard;