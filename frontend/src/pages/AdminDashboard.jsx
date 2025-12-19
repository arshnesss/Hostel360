import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

import {
  useGetAllComplaintsQuery,
  useUpdateComplaintStatusMutation,
  useAssignComplaintMutation,
} from "../api/complaintApi";
import { useGetWardensQuery } from "../api/userApi";

import { toast } from "react-hot-toast";
import AnalyticsContent from "../components/admin/AnalyticsContent";
import UserManagement from "../components/admin/UserManagement";
import HotspotHeatmap from "../components/admin/HotspotHeatmap"; 
import { useGetHotspotsQuery } from "../api/adminApi"; 

import {
  Home,
  BarChart2,
  Sun,
  Moon,
  LogOut,
  Users,
  Map,
} from "lucide-react";

/* ---------------- HELPER COMPONENTS ---------------- */
// Moved outside and added setActiveTab prop to make the button functional
// 🚨 FIX: Add 'setFilterStatus' to the props list here
const HazardAlert = ({ complaints, setActiveTab, setFilterStatus }) => {
  const criticalIssues = complaints.filter(
    (c) => c.status?.toLowerCase() === "critical"
  );

  if (criticalIssues.length === 0) return null;

  const block = criticalIssues[0]?.block || "General";

  return (
    <div className="
      mb-10 
      rounded-2xl 
      border-2 border-red-600/40 
      bg-red-500/10 
      shadow-lg
    ">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
        
        {/* LEFT: ICON + TEXT */}
        <div className="flex items-start gap-4">
          {/* Alert Icon */}
          <div className="
            flex items-center justify-center
            h-12 w-12 
            rounded-xl 
            bg-red-600 text-white 
            shadow-md
          ">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="space-y-1">
            <h3 className="text-lg font-black text-red-700 tracking-tight">
              🚨 Critical Hazards Detected
            </h3>
            <p className="text-sm text-red-700/80 leading-relaxed">
              AI Triage has flagged{" "}
              <span className="font-black text-red-800">
                {criticalIssues.length}
              </span>{" "}
              urgent issue{criticalIssues.length > 1 ? "s" : ""} in{" "}
              <span className="font-black text-red-800">
                Block {block}
              </span>.
            </p>

            <p className="text-[11px] font-bold uppercase tracking-widest text-red-600/70">
              Immediate admin attention required
            </p>
          </div>
        </div>

        {/* RIGHT: ACTION */}
        <button
          onClick={() => {
            setActiveTab("complaints");
            setFilterStatus("Critical");
          }}
          className="
            btn 
            bg-red-600 hover:bg-red-700 
            text-white 
            border-none 
            rounded-xl 
            font-black 
            tracking-wide 
            px-6
            shadow-md
            flex items-center gap-2
          "
        >
          View Hazards
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};


const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("analytics");
  const [filterStatus, setFilterStatus] = useState("All"); // 👈 Add this line
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [selectedWarden, setSelectedWarden] = useState({});

  /* ---------------- THEME ---------------- */
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  /* ---------------- DATA ---------------- */
  const { data: complaints = [], isLoading, isError, refetch } = useGetAllComplaintsQuery();
  const { data: wardens = [] } = useGetWardensQuery();

  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [assignComplaint] = useAssignComplaintMutation();

  /* ---------------- HELPERS ---------------- */
  const getStatusClasses = (status) => {
    switch (status) {
      case "Critical": 
        return "bg-red-600 text-white border-red-400 animate-pulse font-black"; 
      case "Open": 
        return "bg-red-100 text-red-700 border-red-200";
      case "In Progress": 
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Resolved": 
        return "bg-green-100 text-green-700 border-green-200";
      default: 
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAssignWarden = async (complaintId) => {
    const wardenId = selectedWarden[complaintId];
    if (!wardenId) return toast.error("Select a warden first");

    try {
      await assignComplaint({ id: complaintId, wardenId }).unwrap();
      toast.success("Warden assigned");
      setSelectedWarden((prev) => ({ ...prev, [complaintId]: "" }));
    } catch {
      toast.error("Assignment failed");
    }
  };

  if (isLoading) return <p className="p-10 text-center text-lg">Loading...</p>;
  if (isError) return <p className="p-10 text-center text-red-500">Error loading data</p>;

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-8 transition-colors duration-300">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-base-200 p-4 rounded-2xl border border-base-300 mb-10">
        <div className="flex items-center space-x-2">
            <div className="animate-spin-slow cursor-pointer text-primary">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <span className="text-2xl font-black tracking-tighter">Hostel<span className="text-primary">360</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-lg bg-blue-600 text-white font-bold border-none">ADMIN</span>
          <span className="hidden sm:block text-xs uppercase tracking-widest opacity-60">Global Oversight</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <h1 className="text-4xl font-black text-center text-blue-600 mb-10 tracking-tight">
        Hostel Management System
      </h1>

      {/* ---------------- TABS ---------------- */}
      <div className="flex justify-center mb-10">
        <div className="bg-base-200 p-1.5 rounded-2xl border border-base-300 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${activeTab === "analytics" ? "bg-blue-600 text-white shadow-lg scale-105" : "hover:bg-base-300 opacity-70"}`}
          >
            <BarChart2 size={18} /> Analytics
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${activeTab === "heatmap" ? "bg-blue-600 text-white shadow-lg scale-105" : "hover:bg-base-300 opacity-70"}`}
          >
            <Map size={18} /> Hotspots
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${activeTab === "complaints" ? "bg-blue-600 text-white shadow-lg scale-105" : "hover:bg-base-300 opacity-70"}`}
          >
            <Home size={18} /> Complaints ({complaints.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${activeTab === "users" ? "bg-blue-600 text-white shadow-lg scale-105" : "hover:bg-base-300 opacity-70"}`}
          >
            <Users size={18} /> User Management
          </button>
        </div>
      </div>

      {/* ---------------- CONTENT AREA ---------------- */}
      <div className="max-w-7xl mx-auto">
        
        {/* 🚨 THE EMERGENCY RADAR */}
        <HazardAlert complaints={complaints} setActiveTab={setActiveTab} setFilterStatus={setFilterStatus}/>

        {activeTab === "analytics" && <AnalyticsContent />}

        {activeTab === "heatmap" && (
          <div className="animate-fadeIn space-y-6">
            <header className="mb-6">
              <h2 className="text-2xl font-black">Infrastructure Hotspots</h2>
              <p className="opacity-60 text-sm">Visualizing complaint density across hostel blocks</p>
            </header>
            <HotspotHeatmap />
          </div>
        )}

        {activeTab === "users" && <UserManagement />}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
        <div className="space-y-6">
            {/* 💡 FILTER HEADER: Shows when a filter is active so the admin can reset it */}
            {filterStatus !== "All" && (
            <button 
                onClick={() => setFilterStatus("All")}
                className="group flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-full border border-red-200 transition-all duration-200 shadow-sm"
            >
                <span className="text-[10px] font-black uppercase tracking-wider">
                Showing: {filterStatus}
                </span>
                <div className="bg-red-700 text-white rounded-full p-0.5 group-hover:scale-110 transition-transform">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </div>
            </button>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* 1. We first filter the array based on filterStatus */}
            {complaints.filter(c => filterStatus === "All" || c.status === filterStatus).length === 0 ? (
                <div className="col-span-full text-center p-20 bg-base-200 rounded-3xl border border-dashed border-base-300">
                <p className="opacity-50 italic">No {filterStatus !== "All" ? filterStatus : ""} complaints found</p>
                </div>
            ) : (
                // 2. Then we map over the filtered list
                complaints
                .filter(c => filterStatus === "All" || c.status === filterStatus)
                .map((c) => {
                    const isResolved = c.status === "Resolved";
                    const isAssigned = !!c.warden;
                    const canAssign = selectedWarden[c._id] && !isResolved;

                    return (
                    <div key={c._id} className="bg-base-200 p-6 rounded-3xl border border-base-300 shadow-md hover:shadow-xl transition-all group">
                        {/* --- Complaint Card Header --- */}
                        <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-black group-hover:text-blue-600 transition-colors">{c.title}</h2>
                            <p className="text-[10px] font-black uppercase opacity-40 mt-1 tracking-widest">
                            {c.category} | Block {c.block || "N/A"}
                            </p>
                        </div>
                        <span className={`px-3 py-1 text-[11px] rounded-full border font-bold ${getStatusClasses(c.status)}`}>
                            {c.status.toUpperCase()}
                        </span>
                        </div>

                        {/* --- Student & Warden Info --- */}
                        <div className="grid grid-cols-2 gap-4 bg-base-100 p-4 rounded-2xl border border-base-300 mb-6 text-sm">
                        <div>
                            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Student</p>
                            <p className="font-bold truncate">{c.student?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase opacity-40 mb-1">Assigned Warden</p>
                            <p className={`font-black ${isAssigned ? "text-blue-600" : "text-error italic"}`}>
                            {c.warden?.name || "Unassigned"}
                            </p>
                        </div>
                        </div>

                        {/* --- Oversight Actions --- */}
                        <div className="bg-base-100 p-4 rounded-2xl border border-base-300 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-1">Status Oversight</label>
                            <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            disabled={isResolved}
                            className="select select-bordered select-sm w-full font-bold bg-base-200"
                            >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                            <option>Critical</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase opacity-40 ml-1">Warden Delegation</label>
                            <div className="flex gap-2">
                            <select
                                value={selectedWarden[c._id] || ""}
                                onChange={(e) => setSelectedWarden((prev) => ({ ...prev, [c._id]: e.target.value }))}
                                disabled={isResolved}
                                className="select select-bordered select-sm flex-1 font-bold bg-base-200"
                            >
                                <option value="">{isAssigned ? "Reassign Warden" : "Select Warden"}</option>
                                {wardens.map((w) => (
                                <option key={w._id} value={w._id}>{w.name} (Block {w.block})</option>
                                ))}
                            </select>
                            <button
                                disabled={!canAssign}
                                onClick={() => handleAssignWarden(c._id)}
                                className={`btn btn-sm px-4 font-black uppercase text-[10px] ${canAssign ? "btn-primary" : "btn-disabled"}`}
                            >
                                {isAssigned ? "Update" : "Assign"}
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    );
                })
            )}
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;