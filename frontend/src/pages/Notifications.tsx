// src/pages/Notifications.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Rule {
  id: string;
  metric: string;
  condition: string;
  value: number;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
}

export default function Notifications() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metric, setMetric] = useState("");
  const [condition, setCondition] = useState(">");
  const [value, setValue] = useState<number>(0);

  async function fetchRules() {
    try {
      const res = await api.get("/notifications/rules");
      setRules(res.data);
    } catch (err) {
      console.error("Erro ao carregar regras:", err);
    }
  }

  useEffect(() => {
    fetchRules();

    // abrir websocket
    const userId = localStorage.getItem("user_id"); // salva no login
    if (!userId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws?user_id=${userId}`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setNotifications((prev) => [
          { id: crypto.randomUUID(), message: payload.message, created_at: new Date().toISOString() },
          ...prev,
        ]);
      } catch (e) {
        console.error("Erro no WS:", e);
      }
    };

    return () => ws.close();
  }, []);

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/notifications/rules", { metric, condition, value });
      setMetric("");
      setCondition(">");
      setValue(0);
      fetchRules();
    } catch (err) {
      console.error("Erro ao criar regra:", err);
    }
  }

  async function handleDeleteRule(id: string) {
    if (!confirm("Excluir regra?")) return;
    try {
      await api.delete(`/notifications/rules/${id}`);
      setRules(rules.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Erro ao deletar regra:", err);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notificações</h1>

      {/* Formulário de regras */}
      <form onSubmit={handleAddRule} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Métrica (cpu, temperature...)"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="border p-2 rounded flex-1"
          required
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="border p-2 rounded"
        >
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value="=">=</option>
        </select>
        <input
          type="number"
          placeholder="Valor limite"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="border p-2 rounded w-32"
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Adicionar Regra
        </button>
      </form>

      {/* Lista de regras */}
      <h2 className="text-xl font-semibold mb-2">Regras Ativas</h2>
      {rules.length === 0 ? (
        <p className="mb-6">Nenhuma regra cadastrada.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {rules.map((r) => (
            <li key={r.id} className="flex justify-between items-center p-3 border rounded bg-white shadow">
              <span>
                {r.metric} {r.condition} {r.value}
              </span>
              <button
                onClick={() => handleDeleteRule(r.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Deletar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Notificações em tempo real */}
      <h2 className="text-xl font-semibold mb-2">Últimas Notificações</h2>
      {notifications.length === 0 ? (
        <p>Nenhuma notificação recebida.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="p-3 border rounded bg-yellow-50 shadow">
              <span className="font-semibold">[{new Date(n.created_at).toLocaleTimeString()}]</span>{" "}
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
