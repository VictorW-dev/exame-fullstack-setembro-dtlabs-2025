import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

export default function GuardedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
