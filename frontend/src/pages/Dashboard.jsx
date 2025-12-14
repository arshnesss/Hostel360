import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { useGetUserComplaintsQuery } from "../api/complaintApi";
import SubmitComplaint from "../components/SubmitComplaint";
import ComplaintList from "../components/ComplaintList";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data: complaints, isLoading } = useGetUserComplaintsQuery();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        {/* Submit Complaint Form */}
        <SubmitComplaint />

        {/* Dashboard Cards */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name || "User"} 👋
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-100 rounded-lg">
              <h2 className="font-semibold">Role</h2>
              <p className="text-lg">{user?.role?.toUpperCase()}</p>
            </div>

            <div className="p-4 bg-green-100 rounded-lg">
              <h2 className="font-semibold">Complaints</h2>
              <p className="text-lg">
                {isLoading ? "Loading..." : complaints?.length || 0}
              </p>
            </div>

            <div className="p-4 bg-purple-100 rounded-lg">
              <h2 className="font-semibold">Active</h2>
              <p className="text-lg">
                {isLoading
                  ? "Loading..."
                  : complaints?.filter((c) => c.status === "Active").length}
              </p>
            </div>
          </div>
        </div>

        {/* Complaint List */}
        <ComplaintList complaints={complaints} isLoading={isLoading} />
      </div>
    </div>
  );
}
