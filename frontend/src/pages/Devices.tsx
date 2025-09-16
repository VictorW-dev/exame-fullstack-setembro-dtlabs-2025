// src/pages/Devices.tsx (histórico simplificado por device)
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getAuth } from "../lib/auth";


export default function Devices() {
    const { userId } = getAuth();
    const [devices, setDevices] = useState<any[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [items, setItems] = useState<any[]>([]);


    useEffect(() => {
        (async () => {
            const { data } = await api.get("/api/v1/devices", { params: { user_id: userId } });
            setDevices(data); if (data[0]) setSelected(data[0].uuid);
        })();
    }, []);


    useEffect(() => {
        if (!selected) return; (async () => {
            const { data } = await api.get("/api/v1/heartbeats", { params: { device_uuid: selected } });
            setItems(data);
        })();
    }, [selected]);


    return (
        <div style={{ padding: 24 }}>
            <h2>Histórico</h2>
            <select value={selected} onChange={e => setSelected(e.target.value)}>
                {devices.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
            </select>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#0f0", padding: 12 }}>
                {items.slice(0, 20).map(i => JSON.stringify(i)).join("\n")}
            </pre>
        </div>
    )
}