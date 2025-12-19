import { useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { useGetUserComplaintsQuery } from "../api/complaintApi";
import SubmitComplaint from "../components/SubmitComplaint";
import ComplaintList from "../components/ComplaintList";

const TABS = ["Open", "In Progress", "Resolved"];

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const {
    data: complaints = [],
    isLoading,
    isError,
  } = useGetUserComplaintsQuery();

  const [activeTab, setActiveTab] = useState("Open");

  // Filter complaints based on tab
  const filteredComplaints = complaints.filter(
    (c) => c.status === activeTab
  );

  // Calculate summary counts for the info cards
  const totalComplaints = complaints.length;
  const activeComplaints = complaints.filter(
    (c) => c.status !== "Resolved"
  ).length;
  const resolvedComplaints = totalComplaints - activeComplaints;

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-10">
        {/* Use text-base-content instead of text-gray-800 */}
        <h1 className="text-3xl font-extrabold mb-8">
          Welcome back, {user?.name || "Student"} 👋
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Swapped bg-white for bg-base-200 (Theme-aware card background) */}
            <div className="bg-base-200 rounded-2xl shadow-xl p-8 border border-base-300 transition-colors duration-200">
              <h2 className="text-2xl font-bold mb-6 border-b border-base-300 pb-3">
                Your Complaint Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Stats Cards: Removed hardcoded colors, used ghost backgrounds with borders */}
                <div className="p-4 bg-base-300/50 rounded-xl border border-blue-500/30">
                  <h3 className="font-semibold text-blue-500 text-sm mb-1 text-opacity-80">Role</h3>
                  <p className="text-2xl font-extrabold">{user?.role?.toUpperCase() || "N/A"}</p>
                </div>

                <div className="p-4 bg-base-300/50 rounded-xl border border-green-500/30">
                  <h3 className="font-semibold text-green-500 text-sm mb-1 text-opacity-80">Total Submitted</h3>
                  <p className="text-2xl font-extrabold">{isLoading ? "..." : totalComplaints}</p>
                </div>

                <div className="p-4 bg-base-300/50 rounded-xl border border-yellow-500/30">
                  <h3 className="font-semibold text-yellow-500 text-sm mb-1 text-opacity-80">Active</h3>
                  <p className="text-2xl font-extrabold">{isLoading ? "..." : activeComplaints}</p>
                </div>

                <div className="p-4 bg-base-300/50 rounded-xl border border-purple-500/30">
                  <h3 className="font-semibold text-purple-500 text-sm mb-1 text-opacity-80">Resolved</h3>
                  <p className="text-2xl font-extrabold">{isLoading ? "..." : resolvedComplaints}</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold mb-6 border-b border-base-300 pb-3">
                My Complaints
            </h2>

            {/* Tab Container Background */}
            <div className="flex gap-4 justify-start mb-6 border-b border-base-300 pb-2 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200
                    ${
                      activeTab === tab
                        ? "bg-primary text-primary-content shadow-lg transform scale-105" 
                        : "bg-base-200 text-base-content/70 hover:bg-base-300"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {isLoading ? (
                <p className="text-center text-xl py-12 opacity-70">Fetching your complaints...</p>
            ) : isError ? (
                <p className="text-center text-xl text-error py-12 font-bold">An error occurred loading your data.</p>
            ) : filteredComplaints.length === 0 ? (
                <p className="text-center text-xl py-12 opacity-50 italic">
                    No **{activeTab}** complaints found.
                </p>
            ) : (
                <ComplaintList
                  complaints={filteredComplaints}
                  readOnly={true}
                />
            )}
          </div>
          
          <div className="lg:col-span-1">
              <SubmitComplaint />
          </div>
        </div>
      </div>
    </div>
  );
}