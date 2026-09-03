import { Outlet, Link, useNavigate } from "react-router-dom";
import type { UserWithoutPassword } from "../types/User";

interface LayoutProps {
  user: UserWithoutPassword | null;
  onLogout: () => void;
}

function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  function handleLogoutClick() {
    onLogout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-3 bg-white border-b">
        <Link to="/" className="font-bold text-lg text-indigo-600">
          Unblocked
        </Link>

        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">
              My Boards
            </Link>
            <span className="text-gray-600">{user.username}</span>
            <button onClick={handleLogoutClick} className="text-red-600">
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-indigo-600">
              Log in
            </Link>
            <Link to="/register" className="text-indigo-600">
              Register
            </Link>
          </div>
        )}
      </nav>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
