import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const response = await fetch("http://localhost:8080/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.status >= 200 && response.status < 300) {
      navigate("/login");
    } else {
      const data = await response.json();
      const messages = Array.isArray(data)
        ? data.map((d: any) => (typeof d === "string" ? d : d.defaultMessage))
        : [data.message ?? "Registration failed."];
      setErrors(messages);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 mt-10">
      <h1 className="text-xl font-bold">Register</h1>
      {errors.length > 0 && (
        <ul className="text-red-600 text-sm">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
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
      <button type="submit" className="bg-indigo-600 text-white p-2 w-full rounded">
        Register
      </button>
      <p className="text-sm text-center">
        Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
      </p>
    </form>
  );
}

export default Register;