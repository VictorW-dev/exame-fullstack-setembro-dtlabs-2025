// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getAuth } from "../lib/auth";


export default function Home() {
    const { userId } = getAuth();
    const [devices, setDevices] = useState<any[]>([]);
    useEffect(() => {
        (async () => {
            const { data } = await api.get("/api/v1/devices", { params: { user_id: userId } });
            setDevices(data);
        })();
    }, []);
    return (
        <div style={{ padding: 24 }}>
            <h2>Meus Dispositivos</h2>
            <ul>
                {devices.map(d => <li key={d.uuid}>{d.name} — {d.location} — SN {d.sn}</li>)}
            </ul>
        </div>
    )
}