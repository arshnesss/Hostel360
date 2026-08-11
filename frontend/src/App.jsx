import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import Profile from "./pages/Profile";

import { socket, joinSocketRoom } from "./utils/socket";
import { complaintApi } from "./api/complaintApi";
import { adminApi } from "./api/adminApi";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      joinSocketRoom(user);
    }

    // 🔌 WebSockets Live Event Listeners
    const handleCreated = (complaint) => {
      // Invalidate RTK Query caches so all dashboards refresh live!
      dispatch(complaintApi.util.invalidateTags(["Complaint"]));
      dispatch(adminApi.util.invalidateTags(["Complaint"]));

      if (user?.role === "admin" || user?.role === "warden") {
        toast(`🆕 New Complaint: "${complaint.title}" in Block ${complaint.block}`, {
          icon: "⚡",
          style: { borderRadius: "12px", background: "#1e293b", color: "#fff", fontWeight: "bold" },
        });
      }
    };

    const handleUpdated = (complaint) => {
      dispatch(complaintApi.util.invalidateTags(["Complaint"]));
      dispatch(adminApi.util.invalidateTags(["Complaint"]));

      if (user?._id === (complaint.student?._id || complaint.student)) {
        toast.success(`Ticket "${complaint.title}" updated to ${complaint.status}!`, {
          duration: 4000,
        });
      }
    };

    const handleCritical = (complaint) => {
      dispatch(complaintApi.util.invalidateTags(["Complaint"]));
      dispatch(adminApi.util.invalidateTags(["Complaint"]));

      if (user?.role === "admin" || (user?.role === "warden" && user?.block === complaint.block)) {
        toast.error(`🚨 CRITICAL HAZARD in Block ${complaint.block}: ${complaint.title}`, {
          duration: 8000,
          style: { border: "2px solid #ef4444", background: "#7f1d1d", color: "#fff", fontWeight: "900" },
        });
      }
    };

    socket.on("complaint:created", handleCreated);
    socket.on("complaint:updated", handleUpdated);
    socket.on("complaint:critical", handleCritical);

    return () => {
      socket.off("complaint:created", handleCreated);
      socket.off("complaint:updated", handleUpdated);
      socket.off("complaint:critical", handleCritical);
    };
  }, [user, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/warden-dashboard"
        element={
          <ProtectedRoute allowedRoles={["warden"]}>
            <WardenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
