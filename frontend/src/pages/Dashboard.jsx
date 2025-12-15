import { useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { useGetUserComplaintsQuery } from "../api/complaintApi";
import SubmitComplaint from "../components/SubmitComplaint";
import ComplaintList from "../components/ComplaintList";

const TABS = ["Open", "In Progress", "Resolved"];

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data: complaints = [], isLoading } = useGetUserComplaintsQuery();

  const [activeTab, setActiveTab] = useState("Open");

  // Filter complaints based on tab
  const filteredComplaints = complaints.filter(
    (c) => c.status === activeTab
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Submit Complaint */}
        <SubmitComplaint />

        {/* Dashboard Info Cards */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.name || "User"} 👋
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <h2 className="font-semibold">Role</h2>
              <p className="text-lg">{user?.role?.toUpperCase()}</p>
            </div>

            <div className="p-4 bg-green-100 rounded-lg">
              <h2 className="font-semibold">Total Complaints</h2>
              <p className="text-lg">
                {isLoading ? "Loading..." : complaints.length}
              </p>
            </div>

            <div className="p-4 bg-purple-100 rounded-lg">
              <h2 className="font-semibold">Active</h2>
              <p className="text-lg">
                {isLoading
                  ? "Loading..."
                  : complaints.filter((c) => c.status !== "Resolved").length}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS TABS */}
        <div className="flex gap-4 justify-center mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Complaint List */}
        <ComplaintList
          complaints={filteredComplaints}
          isLoading={isLoading}
          readOnly={true}   // 👈 important
        />
      </div>
    </div>
  );
}
