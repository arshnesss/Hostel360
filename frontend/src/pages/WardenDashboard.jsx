import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  useGetAssignedComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAddComplaintCommentMutation,
} from "../api/complaintApi";
import { toast } from "react-hot-toast";
import { 
  Sun, Moon, LogOut, CheckCircle, Clock, 
  MessageSquare, ShieldCheck, MapPin, ChevronDown, ChevronUp 
} from "lucide-react";

const STATUS_TABS = ["Open", "In Progress", "Resolved"];

const StatusBadge = ({ status }) => {
  const statusClasses = status === "Open" 
    ? "bg-red-500/10 text-red-600 border-red-200" 
    : status === "In Progress" 
    ? "bg-amber-500/10 text-amber-600 border-amber-200" 
    : "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    
  return (
    <span className={`badge badge-sm font-black p-3 border ${statusClasses}`}>
      {status.toUpperCase()}
    </span>
  );
};

// --- NEW COMPACT RESOLVED CARD COMPONENT ---
const ResolvedCard = ({ c }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-base-200 rounded-[2rem] border border-base-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-fit">
      <div className="flex justify-between items-start mb-3">
        <span className="badge badge-success badge-sm text-[10px] font-black text-white px-3 py-3 border-none">
          RESOLVED
        </span>
        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{c.category}</span>
      </div>

      <h3 className="text-lg font-black leading-tight mb-2 truncate" title={c.title}>{c.title}</h3>
      <p className="text-xs opacity-60 line-clamp-2 mb-4 min-h-[2.5rem]">{c.description}</p>
      
      <div className="bg-base-100/50 rounded-2xl p-3 mb-4 text-[11px] font-bold border border-base-300/50">
        <p className="flex justify-between opacity-70"><span>Student:</span> <span>{c.student?.name}</span></p>
        <p className="flex justify-between text-emerald-600 mt-1">
          <span>Closed:</span> <span>{new Date(c.resolvedAt || c.updatedAt).toLocaleDateString()}</span>
        </p>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-sm btn-ghost w-full rounded-xl border-base-300 gap-2 text-[11px] font-black uppercase hover:bg-emerald-600 hover:text-white"
      >
        {isOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        {isOpen ? "Hide Details" : "View Full History"}
      </button>

      {/* EXPANDABLE SECTION */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-dashed border-base-300 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase opacity-40 tracking-widest text-emerald-600">Timeline</p>
            <div className="text-[10px] space-y-1 font-medium">
               <p className="flex items-center gap-2 opacity-70"><Clock size={12}/> Filed: {new Date(c.createdAt).toLocaleString()}</p>
               <p className="flex items-center gap-2 text-emerald-600"><CheckCircle size={12}/> Resolved: {new Date(c.resolvedAt || c.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
             <p className="text-[9px] font-black uppercase opacity-40 tracking-widest text-emerald-600">Interaction Log</p>
             <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {c.comments?.length > 0 ? (
                  c.comments.map((com, i) => (
                    <div key={i} className="bg-base-100 p-2.5 rounded-xl text-[10px] border border-base-200">
                      <p className="font-black text-emerald-600 mb-0.5">{com.user?.name || 'System'}</p>
                      <p className="opacity-80 leading-relaxed">{com.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] opacity-30 italic">No comments provided.</p>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WardenDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: complaints = [], isLoading, isError } = useGetAssignedComplaintsQuery();
  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [addComment] = useAddComplaintCommentMutation();

  const [activeTab, setActiveTab] = useState("Open");
  const [comments, setComments] = useState({});
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(`Marked as ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleAddComment = async (id) => {
    const commentText = comments[id];
    if (!commentText?.trim()) return toast.error("Write a response first");
    try {
      await addComment({ id, comment: commentText }).unwrap();
      toast.success("Response sent to student");
      setComments((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-ring loading-lg text-emerald-600"></span>
    </div>
  );

  const filteredComplaints = complaints.filter((c) => c.status === activeTab);

  return (
    <div className="p-4 md:p-8 bg-base-100 text-base-content min-h-screen transition-all duration-500">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto mb-10 bg-base-200 p-6 rounded-[2rem] shadow-xl border border-base-300 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={32} />
              </div>
              <div>
                  <h1 className="text-2xl font-black tracking-tight">Welcome, {user?.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="badge bg-emerald-600 text-white font-black border-none text-[10px]">WARDEN</span>
                      <div className="flex items-center gap-1 text-xs font-bold opacity-50 uppercase tracking-tighter">
                          <MapPin size={12} className="text-emerald-600" />
                          Jurisdiction: <span className="text-base-content opacity-100">{user?.block || 'Global'}</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="btn btn-ghost btn-circle bg-base-300/50">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
              </button>
              <button 
                  onClick={handleLogout} 
                  className="btn bg-[#ef4444] hover:bg-[#dc2626] border-none text-white font-black rounded-2xl shadow-lg px-6"
              >
                  <LogOut size={18} />
                  <span>Logout</span>
              </button>
          </div>
      </div>

      {/* TABS */}
      <div className="flex justify-center mb-12">
          <div className="bg-base-200 p-2 rounded-2xl flex gap-2 border border-base-300 shadow-inner">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-black transition-all duration-300 
                  ${activeTab === tab 
                    ? "bg-emerald-600 text-white shadow-xl scale-105" 
                    : "hover:bg-base-300 opacity-60"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
      </div>

      {/* COMPLAINTS FEED */}
      <div className="max-w-6xl mx-auto">
        {filteredComplaints.length === 0 ? (
          <div className="text-center bg-base-200 rounded-[3rem] p-24 border-2 border-dashed border-base-300 shadow-inner">
             <p className="text-xl opacity-30 italic font-black">No {activeTab} grievances assigned.</p>
          </div>
        ) : activeTab === "Resolved" ? (
          /* 🟢 GRID VIEW FOR RESOLVED */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => (
              <ResolvedCard key={c._id} c={c} />
            ))}
          </div>
        ) : (
          /* 🔴 LIST VIEW FOR ACTIVE TASKS */
          <div className="space-y-8">
            {filteredComplaints.map((c) => (
              <div key={c._id} className="bg-base-200 p-8 rounded-[2.5rem] shadow-xl border border-base-300 group hover:border-emerald-500/30 transition-all duration-500">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-black tracking-tight group-hover:text-emerald-600 transition-colors">{c.title}</h2>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-base-100/50 p-5 rounded-3xl border border-base-300 shadow-inner">
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest text-emerald-600">Category</p>
                        <p className="font-bold text-sm">{c.category}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest text-emerald-600">Student</p>
                        <p className="font-bold text-sm">{c.student?.name}</p>
                      </div>
                    </div>
                    <div className="pt-4 flex items-center gap-6 border-t border-base-300">
                       <div className="flex items-center gap-2 text-[10px] font-black opacity-40 uppercase"><Clock size={14}/> Filed {new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="w-full lg:w-[400px] space-y-6">
                    <div className="bg-base-100 p-6 rounded-3xl border border-base-300 shadow-sm space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-50 ml-1">Status Action</label>
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            className="select select-bordered w-full bg-base-200 font-black border-none shadow-inner"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase opacity-50 ml-1">Send Resolution Update</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={comments[c._id] || ""}
                              onChange={(e) => setComments((prev) => ({ ...prev, [c._id]: e.target.value }))}
                              className="input input-bordered flex-1 bg-base-200 border-none shadow-inner font-bold"
                            />
                            <button onClick={() => handleAddComment(c._id)} className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none font-black">
                              Post
                            </button>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenDashboard;