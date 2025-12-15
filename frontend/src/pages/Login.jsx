import { useState } from "react";
import { useLoginMutation } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();

      // Save user + token in Redux
      dispatch(
        setCredentials({
          user: {
            _id: res._id,
            name: res.name,
            email: res.email,
            role: res.role,
          },
          token: res.token,
        })
      );

      toast.success("Login successful! 🎉");

      // Redirect based on role
      if (res.role === "admin") navigate("/admin-dashboard");
      else if (res.role === "warden") navigate("/warden-dashboard");
      else navigate("/dashboard"); // student

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      toast.error(err?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Login Card */}
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-6 text-center">
          Member Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition duration-150"
          >
            {isLoading ? "Validating Credentials..." : "Sign In"}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
