// src/pages/Devices.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Device {
  uuid: string;
  name: string;
  type: string;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  async function fetchDevices() {
    try {
      const res = await api.get("/devices");
      setDevices(res.data);
    } catch (err) {
      console.error("Erro ao buscar devices:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/devices", { name, type });
      setName("");
      setType("");
      fetchDevices();
    } catch (err) {
      console.error("Erro ao criar device:", err);
    }
  }

  async function handleDelete(uuid: string) {
    if (!confirm("Deseja realmente deletar este dispositivo?")) return;
    try {
      await api.delete(`/devices/${uuid}`);
      setDevices(devices.filter((d) => d.uuid !== uuid));
    } catch (err) {
      console.error("Erro ao deletar device:", err);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dispositivos</h1>

      {/* Formulário */}
      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nome do dispositivo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Tipo (ex: sensor, gateway)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Adicionar
        </button>
      </form>

      {/* Lista */}
      {loading ? (
        <p>Carregando dispositivos...</p>
      ) : devices.length === 0 ? (
        <p>Nenhum dispositivo cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {devices.map((d) => (
            <li
              key={d.uuid}
              className="flex justify-between items-center p-3 border rounded bg-white shadow"
            >
              <span>
                <span className="font-semibold">{d.name}</span> — {d.type}
              </span>
              <button
                onClick={() => handleDelete(d.uuid)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Deletar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
