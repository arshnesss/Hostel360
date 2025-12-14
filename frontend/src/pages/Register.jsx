import { useState } from "react";
import { useRegisterMutation } from "../api/authApi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [register] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await register({ email, password }).unwrap();
      console.log("REGISTER RESPONSE:", res);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
    }
  };

  return (
    <div>
      <h1>Register Page</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
