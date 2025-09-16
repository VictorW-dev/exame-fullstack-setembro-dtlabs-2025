// src/pages/DeviceCrud.tsx (simplificado)
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getAuth } from "../lib/auth";


export default function DeviceCrud() {
    const { userId } = getAuth();
    const [list, setList] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [sn, setSn] = useState("");
    const [description, setDescription] = useState("");


    const load = async () => {
        const { data } = await api.get("/api/v1/devices", { params: { user_id: userId } });
        setList(data);
    }


    useEffect(() => { load(); }, []);


    const add = async () => {
        await api.post("/api/v1/devices", null, { params: { user_id: userId, name, location, sn, description } });
        setName(""); setLocation(""); setSn(""); setDescription("");
        load();
    }


    const remove = async (uuid: string) => {
        await api.delete(`/api/v1/devices/${uuid}`, { params: { user_id: userId } });
        load();
    }


    return (
        <div style={{ padding: 24 }}>
            <h2>Dispositivos</h2>
            <div>
                <input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="location" value={location} onChange={e => setLocation(e.target.value)} />
                <input placeholder="sn (12 dígitos)" value={sn} onChange={e => setSn(e.target.value)} />
                <input placeholder="description" value={description} onChange={e => setDescription(e.target.value)} />
                <button onClick={add}>Adicionar</button>
            </div>
            <ul>
                {list.map(d => <li key={d.uuid}>{d.name} — {d.sn} <button onClick={() => remove(d.uuid)}>Excluir</button></li>)}
            </ul>
        </div>
    )
}