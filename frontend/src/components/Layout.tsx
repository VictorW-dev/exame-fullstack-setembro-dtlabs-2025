// src/components/Layout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Layout() {
  const navigate = useNavigate();

  // se não houver token, redireciona para login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 text-xl font-bold border-b">Telemetry</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link className="block p-2 rounded hover:bg-gray-200" to="/app/home">
            Home
          </Link>
          <Link className="block p-2 rounded hover:bg-gray-200" to="/app/devices">
            Devices
          </Link>
          <Link className="block p-2 rounded hover:bg-gray-200" to="/app/notifications">
            Notifications
          </Link>
          <Link className="block p-2 rounded hover:bg-gray-200" to="/app/device-crud">
            Manage Devices
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
