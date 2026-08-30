import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { UserWithoutPassword } from "../types/User";
import Layout from "./Layout";
import Login from "./Login";
import Register from "./Register";
import BoardList from "./BoardList";
import BoardView from "./BoardView";

function AppRouter() {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function handleLogin(loggedInUser: UserWithoutPassword, newToken: string) {
    setUser(loggedInUser);
    setToken(newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  }

  function handleLogout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout user={user} onLogout={handleLogout} />,
      children: [
        { path: "/login", element: <Login onLogin={handleLogin} /> },
        { path: "/register", element: <Register /> },
        { path: "/", element: token ? <BoardList token={token} /> : <Login onLogin={handleLogin} /> },
        { path: "/board/:boardId", element: token ? <BoardView token={token} /> : <Login onLogin={handleLogin} /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AppRouter;