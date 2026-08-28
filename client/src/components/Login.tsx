import { useState } from "react";
import { data, useNavigate } from "react-router-dom";
import type { AuthResponse } from "../types/User";

interface LoginProps {
  onLogin: (user: AuthResponse["user"], token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const response = await fetch("http://localhost:8080/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.status >= 200 && response.status < 300) {
      const data: AuthResponse = await response.json();
      onLogin(data.user, data.token);
      navigate("/");
    } else {
      const errors: string[] = await response.json();
      setError(errors[0] ?? "Login failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 mt-10">
      <h1 className="text-xl font-bold">Log in</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="border p-2 w-full rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2 w-full rounded"
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white p-2 w-full rounded"
      >
        Log In
      </button>
    </form>
  );
}

export default Login;
