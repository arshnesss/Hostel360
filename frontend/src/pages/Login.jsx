import { useState, useEffect } from "react";
import { useLoginMutation } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Sun, Moon } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Theme Logic
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();

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

      if (res.role === "admin") navigate("/admin-dashboard");
      else if (res.role === "warden") navigate("/warden-dashboard");
      else navigate("/dashboard");

    } catch (err) {
      toast.error(err?.data?.message || "Login failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4 transition-colors duration-200">
      {/* Floating Theme Toggle */}
      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-circle text-base-content hover:bg-base-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon size={24} className="text-gray-600" /> 
          ) : (
            <Sun size={24} className="text-yellow-400" />
          )}
        </button>
      </div>

      <div className="bg-base-200 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-base-300">
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
            className="w-full bg-base-100 border border-base-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-base-content"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-base-100 border border-base-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-base-content"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition duration-150"
          >
            {isLoading ? "Validating Credentials..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content opacity-70">
          Need an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}