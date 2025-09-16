// src/pages/Notifications.tsx — cria regra e consome WS em tempo real
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { getAuth } from "../lib/auth";


export default function Notifications() {
    const { userId } = getAuth();
    const [rules, setRules] = useState<any[]>([]);
    const [name, setName] = useState("CPU Alta");
    const [scope, setScope] = useState("all");
    const [device_uuids, setDeviceUuids] = useState("");
    const [condition, setCondition] = useState("cpu > 70");
    const [events, setEvents] = useState<any[]>([]);
    const wsRef = useRef<WebSocket | null>(null);


    useEffect(() => {
        (async () => {
            const { data } = await api.get("/api/v1/notifications/rules", { params: { user_id: userId } });
            setRules(data);
        })();
    }, []);


    const addRule = async () => {
        const { data } = await api.post("/api/v1/notifications/rules", null, { params: { user_id: userId, name, scope, device_uuids, condition } });
        setRules(r => [data, ...r]);
    }


    useEffect(() => {
        const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host.replace(':5173', ':8000')}/ws?user_id=${userId}`);
        wsRef.current = ws; ws.onmessage = (e) => setEvents(ev => [JSON.parse(e.data), ...ev].slice(0, 50));
        return () => ws.close();
    }, []);


    return (
        <div style={{ padding: 24 }}>
            <h2>Notificações (tempo real)</h2>
            <div>
                <input placeholder="nome" value={name} onChange={e => setName(e.target.value)} />
                <select value={scope} onChange={e => setScope(e.target.value)}>
                    <option value="all">all</option>
                    <option value="selected">selected</option>
                    <option value="single">single</option>
                </select>
                <input placeholder="device_uuids (CSV)" value={device_uuids} onChange={e => setDeviceUuids(e.target.value)} />
                <input placeholder="condição ex: cpu > 70" value={condition} onChange={e => setCondition(e.target.value)} />
                <button onClick={addRule}>Criar Regra</button>
            </div>


            <h3>Regras</h3>
            <ul>{rules.map(r => <li key={r.id}>{r.name} — {r.scope} — {r.condition}</li>)}</ul>


            <h3>Eventos (recentes)</h3>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#0f0", padding: 12 }}>
                {events.map(e => JSON.stringify(e)).join("\n")}
            </pre>
        </div>
    )
}                                                                               