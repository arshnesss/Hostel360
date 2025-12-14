import { useState } from "react";
import { useLoginMutation } from "../api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();

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

    navigate("/dashboard");
  } catch (err) {
    console.error("LOGIN ERROR:", err);
  }
};

const dispatch = useDispatch();
const navigate = useNavigate();


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
          Login Page
        </h1>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-4 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          type="submit"
          disabled={isLoading}
        >
          Login
        </button>
      </form>
    </div>
  );
}
