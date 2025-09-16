import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar simples */}
      <nav style={{ width: "200px", background: "#f4f4f4", padding: "1rem" }}>
        <h2>Telemetry</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><Link to="/app/home">Home</Link></li>
          <li><Link to="/app/devices">Devices</Link></li>
          <li><Link to="/app/notifications">Notifications</Link></li>
          <li><Link to="/app/device-crud">Device CRUD</Link></li>
        </ul>
      </nav>

      {/* Conteúdo da página atual */}
      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
