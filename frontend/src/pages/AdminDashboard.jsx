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
import UserManagement from "../components/admin/UserManagement"; // Import the new component

import {
  Home,
  BarChart2,
  Sun,
  Moon,
  LogOut,
  Users, // Added Users icon
} from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("analytics");
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
  const { data: complaints = [], isLoading, isError } = useGetAllComplaintsQuery();
  const { data: wardens = [] } = useGetWardensQuery();

  const [updateStatus] = useUpdateComplaintStatusMutation();
  const [assignComplaint] = useAssignComplaintMutation();

  /* ---------------- HELPERS ---------------- */
  const getStatusClasses = (status) => {
    switch (status) {
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
        <div className="flex items-center gap-3">
          <span className="badge badge-lg bg-blue-600 text-white font-bold border-none">
            ADMIN
          </span>
          <span className="hidden sm:block text-xs uppercase tracking-widest opacity-60">
            Global Oversight
          </span>
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
            <BarChart2 size={18} />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${activeTab === "complaints" ? "bg-blue-600 text-white shadow-lg scale-105" : "hover:bg-base-300 opacity-70"}`}
          >
            <Home size={18} />
            Complaints ({complaints.length})
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
              ${activeTab === "users" ? "bg-blue-600 text-white shadow-lg scale-105" : "hover:bg-base-300 opacity-70"}`}
          >
            <Users size={18} />
            User Management
          </button>
        </div>
      </div>

      {/* ---------------- CONTENT AREA ---------------- */}
      <div className="max-w-7xl mx-auto">
        
        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && <AnalyticsContent />}

        {/* USERS TAB (NEW) */}
        {activeTab === "users" && <UserManagement />}

        {/* COMPLAINTS TAB */}
        {activeTab === "complaints" && (
          <>
            {complaints.length === 0 ? (
              <div className="text-center p-20 bg-base-200 rounded-3xl border border-dashed border-base-300">
                <p className="opacity-50 italic">No complaints found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                {complaints.map((c) => {
                  const isResolved = c.status === "Resolved";
                  const isAssigned = !!c.warden;
                  const canAssign = selectedWarden[c._id] && !isResolved;

                  return (
                    <div
                      key={c._id}
                      className="bg-base-200 p-6 rounded-3xl border border-base-300 shadow-md hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-black group-hover:text-blue-600 transition-colors">
                            {c.title}
                          </h2>
                          <p className="text-[10px] font-black uppercase opacity-40 mt-1 tracking-widest">
                            {c.category}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-[11px] rounded-full border font-bold shadow-sm ${getStatusClasses(c.status)}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>

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

                      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 space-y-4 shadow-inner">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase opacity-40 ml-1">Status Oversight</label>
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            disabled={isResolved}
                            className="select select-bordered select-sm w-full font-bold bg-base-200 border-none shadow-sm"
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase opacity-40 ml-1">Warden Delegation</label>
                          <div className="flex gap-2">
                            <select
                              value={selectedWarden[c._id] || ""}
                              onChange={(e) => setSelectedWarden((prev) => ({ ...prev, [c._id]: e.target.value }))}
                              disabled={isResolved}
                              className="select select-bordered select-sm flex-1 font-bold bg-base-200 border-none shadow-sm"
                            >
                              <option value="">{isAssigned ? "Reassign Warden" : "Select Warden"}</option>
                              {wardens.map((w) => (
                                <option key={w._id} value={w._id}>{w.name} (Block {w.block})</option>
                              ))}
                            </select>

                            <button
                              disabled={!canAssign}
                              onClick={() => handleAssignWarden(c._id)}
                              className={`btn btn-sm px-4 font-black uppercase text-[10px] tracking-wider transition-all
                                ${canAssign ? "btn-primary shadow-md" : "btn-disabled opacity-30"}`}
                            >
                              {isAssigned ? "Update" : "Assign"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;