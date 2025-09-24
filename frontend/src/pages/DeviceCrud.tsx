// src/pages/DeviceCrud.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Device {
  id: string;
  name: string;
  type: string;
}

export default function DeviceCrud() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  async function fetchDevices() {
    try {
      const userId = localStorage.getItem("user_id");
      const res = await api.get(`/devices?user_id=${userId}`);
      setDevices(res.data);
    } catch (err) {
      console.error("Erro ao carregar dispositivos:", err);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post("/devices", { name, type });
      setDevices([...devices, res.data]);
      setName("");
      setType("");
    } catch (err) {
      console.error("Erro ao adicionar dispositivo:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este dispositivo?")) return;
    try {
      await api.delete(`/devices/${id}`);
      setDevices(devices.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Erro ao deletar dispositivo:", err);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gerenciar Dispositivos</h1>

      {/* Formulário de cadastro */}
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
          placeholder="Tipo (ex: sensor, gateway...)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Adicionar
        </button>
      </form>

      {/* Lista de dispositivos */}
      {devices.length === 0 ? (
        <p>Nenhum dispositivo cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {devices.map((d) => (
            <li
              key={d.id}
              className="flex justify-between items-center p-3 border rounded bg-white shadow"
            >
              <span>
                <strong>{d.name}</strong> ({d.type})
              </span>
              <button
                onClick={() => handleDelete(d.id)}
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
