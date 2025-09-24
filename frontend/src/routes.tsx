import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Notifications from "./pages/Notifications";
import DeviceCrud from "./pages/DeviceCrud";
import Layout from "./components/Layout";
import GuardedRoute from "./components/GuardedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "/app",
    element: <GuardedRoute />, // <- protege
    children: [
      {
        element: <Layout />, // layout só aparece logado
        children: [
          { path: "home", element: <Home /> },
          { path: "devices", element: <Devices /> },
          { path: "notifications", element: <Notifications /> },
          { path: "device-crud", element: <DeviceCrud /> },
        ],
      },
    ],
  },
]);
