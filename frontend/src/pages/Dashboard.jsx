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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Increased Max Width to 7xl and Padding to p-10 */}
      <div className="max-w-7xl mx-auto p-4 md:p-10">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">
          Welcome back, {user?.name || "Student"} 👋
        </h1>

        {/* --- MAIN LAYOUT GRID (Stats on Left, Submit Form on Right) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-8">
          
          {/* Left Column: Dashboard Info Cards (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Block (Increased Padding) */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              {/* Data Summary Grid */}
              <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-3">
                Your Complaint Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* User Role Card - Increased Padding */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-700 text-sm mb-1">
                    Role
                  </h3>
                  <p className="text-2xl font-extrabold text-blue-900">
                    {user?.role?.toUpperCase() || "N/A"}
                  </p>
                </div>

                {/* Total Complaints Card - Increased Padding */}
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-700 text-sm mb-1">
                    Total Submitted
                  </h3>
                  <p className="text-2xl font-extrabold text-green-900">
                    {isLoading ? "..." : totalComplaints}
                  </p>
                </div>

                {/* Active Complaints Card - Increased Padding */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h3 className="font-semibold text-yellow-700 text-sm mb-1">
                    Active
                  </h3>
                  <p className="text-2xl font-extrabold text-yellow-900">
                    {isLoading ? "..." : activeComplaints}
                  </p>
                </div>

                {/* Resolved Complaints Card - Increased Padding */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-700 text-sm mb-1">
                    Resolved
                  </h3>
                  <p className="text-2xl font-extrabold text-purple-900">
                    {isLoading ? "..." : resolvedComplaints}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Complaint List Display Area (Increased Title Size/Spacing) */}
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-3">
                My Complaints
            </h2>

            {/* STATUS TABS */}
            <div className="flex gap-4 justify-start mb-6 border-b border-gray-200 pb-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200
                    ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-lg transform scale-105" // Larger active state
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Complaint List (with Loading/Error/Empty State handling) */}
            {isLoading ? (
                <p className="text-center text-xl text-gray-600 py-12">Fetching your complaints...</p>
            ) : isError ? (
                <p className="text-center text-xl text-red-600 py-12">An error occurred while loading your data.</p>
            ) : filteredComplaints.length === 0 ? (
                <p className="text-center text-xl text-gray-500 py-12">
                    No **{activeTab}** complaints found.
                </p>
            ) : (
                <ComplaintList
                  complaints={filteredComplaints}
                  readOnly={true}
                />
            )}
          </div>
          
          {/* Right Column: Submit Complaint Form (1/3 width on large screens) */}
          <div className="lg:col-span-1">
             <SubmitComplaint />
          </div>
        </div>
      </div>
    </div>
  );
}