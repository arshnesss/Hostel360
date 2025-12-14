import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || "User"} 👋
          </h1>

          <button
            onClick={() => dispatch(logout())}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <h2 className="font-semibold">Role</h2>
            <p className="text-lg">{user?.role}</p>
          </div>

          <div className="p-4 bg-green-100 rounded-lg">
            <h2 className="font-semibold">Complaints</h2>
            <p className="text-lg">Coming Soon 🚀</p>
          </div>

          <div className="p-4 bg-purple-100 rounded-lg">
            <h2 className="font-semibold">Status</h2>
            <p className="text-lg">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
