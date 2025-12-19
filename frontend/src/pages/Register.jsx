import { useState, useEffect } from "react";
import { useRegisterMutation } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react"; // Import icons

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [register, { isLoading }] = useRegisterMutation();
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
    setErrorMessage(null);

    try {
      await register({ name, email, password }).unwrap();
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const message = err.data?.message || err.error || "Registration failed. Please try again.";
      setErrorMessage(message);
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

      <div className="w-full max-w-sm p-6 bg-base-200 rounded-xl shadow-2xl border border-base-300">
        <h2 className="text-2xl font-bold text-center mb-6 text-base-content">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
              {errorMessage}
            </div>
          )}

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base-content"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base-content"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-base-100 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base-content"
            required
          />

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-150 ease-in-out font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-base-content opacity-70">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}