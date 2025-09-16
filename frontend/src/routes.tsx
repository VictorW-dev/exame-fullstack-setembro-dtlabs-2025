// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Notifications from "./pages/Notifications";
import DeviceCrud from "./pages/DeviceCrud";
import Layout from "./components/Layout";


export const router = createBrowserRouter([
    { path: "/", element: <Login /> },
    {
        path: "/app", element: <Layout />, children: [
            { path: "home", element: <Home /> },
            { path: "devices", element: <Devices /> },
            { path: "notifications", element: <Notifications /> },
            { path: "device-crud", element: <DeviceCrud /> },
        ]
    }
]);