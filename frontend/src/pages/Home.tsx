// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [devicesCount, setDevicesCount] = useState<number | null>(null);
  const [notificationsCount, setNotificationsCount] = useState<number | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // pega usuário logado
        const meRes = await api.get("/auth/me");
        setUser(meRes.data);

        if (meRes.data?.id) {
          // dispositivos
          const devRes = await api.get(`/devices?user_id=${meRes.data.id}`);
          setDevicesCount(devRes.data?.length || 0);

          // notificações
          const notifRes = await api.get("/notifications");
          setNotificationsCount(notifRes.data?.length || 0);

          // último heartbeat (se houver dispositivo)
          if (devRes.data?.length > 0) {
            const firstDeviceId = devRes.data[0].id;
            const hbRes = await api.get(`/heartbeats?device_uuid=${firstDeviceId}`);
            const list = hbRes.data || [];
            if (list.length > 0) {
              const last = list[list.length - 1];
              setLastHeartbeat(`CPU: ${last.cpu}% | RAM: ${last.ram}% | ${last.timestamp}`);
            } else {
              setLastHeartbeat("Nenhum heartbeat registrado ainda");
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {user ? (
        <p>
          Bem-vindo, <span className="font-semibold">{user.email}</span> 🎉
        </p>
      ) : (
        <p>Carregando informações do usuário...</p>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg shadow bg-white">
          <h2 className="font-semibold mb-2">Dispositivos</h2>
          {loading ? <p>Carregando...</p> : <p>{devicesCount} dispositivos cadastrados</p>}
        </div>
        <div className="p-4 border rounded-lg shadow bg-white">
          <h2 className="font-semibold mb-2">Notificações</h2>
          {loading ? <p>Carregando...</p> : <p>{notificationsCount} notificações recebidas</p>}
        </div>
        <div className="p-4 border rounded-lg shadow bg-white">
          <h2 className="font-semibold mb-2">Último Heartbeat</h2>
          {loading ? <p>Carregando...</p> : <p>{lastHeartbeat}</p>}
        </div>
      </div>
    </div>
  );
}
