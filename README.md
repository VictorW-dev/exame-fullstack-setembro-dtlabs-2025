# Telemetry Full-stack Case — dtLabs

Plataforma de **monitoramento de dispositivos IoT**: os dispositivos enviam *heartbeats* periódicos com métricas (CPU, RAM, disco, temperatura, latência, conectividade e data de boot).  
A solução inclui **autenticação**, **CRUD de dispositivos**, **visualização de métricas**, **regras de notificação** e **notificações em tempo real** via **WebSocket**.

---

## ⚙️ Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** FastAPI (Python 3.12) + SQLAlchemy
- **Banco:** PostgreSQL 16
- **Mensageria/Realtime:** Redis (Pub/Sub) + WebSocket
- **Infra:** Docker Compose
- **Simulador:** Python (gera heartbeats fake)

---

## 📁 Estrutura do Repositório

```
.
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── api/v1/   # auth, devices, heartbeats, notifications
│   │   ├── core/     # config, security
│   │   ├── db/       # session, models
│   │   ├── models/   # User, Device, Heartbeat, Rule, Notification
│   │   └── services/ # notifier (Redis -> WS)
│   └── seed_admin.py # cria admin padrão
├── frontend/          # Web (React + Vite + TS)
│   ├── src/
│   │   ├── components/   # Layout, etc.
│   │   ├── pages/        # Login, Home, Devices, Notifications, DeviceCrud
│   │   └── routes.tsx
├── simulator/         # Envia heartbeats aleatórios
│   └── run.py
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔧 Pré-requisitos

- Docker e Docker Compose
- Porta **8000** livre (API) e **5173** livre (Web)

---

## 🔐 Variáveis de Ambiente

Crie o arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Campos esperados (exemplo):

```env
# Banco
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=telemetry
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/telemetry

# Redis
REDIS_URL=redis://redis:6379/0

# API/Frontend
API_BASE_URL=http://localhost:8000
CORS_ORIGINS=*

# Simulador
SIM_DEVICES=3
SIM_USER_EMAIL=admin@demo.com
SIM_USER_PASSWORD=admin
SIM_SEND_INTERVAL_SECONDS=10
```

> ⚠️ O `docker-compose.yml` injeta `VITE_API_URL` no frontend a partir de `API_BASE_URL`.

---

## 🚀 Subir o Projeto

Na raiz do repo:

```bash
docker compose build --no-cache
docker compose up -d
```

Serviços:

- **API (Swagger):** http://localhost:8000/docs  
- **Frontend (Vite):** http://localhost:5173

### Criar usuário admin padrão

Dentro do container do backend:

```bash
docker compose exec backend python seed_admin.py
```

Saída esperada (ou similar):
```
✅ Usuário admin criado: admin@demo.com / admin
```

Credenciais padrão:
```
email: admin@demo.com
senha: admin
```

---

## 🔑 Autenticação

- **Login**: `POST /api/v1/auth/login`  
  Retorna **JWT**. Use em rotas privadas como `Authorization: Bearer <token>`.

> Observação: rota de *register* pode estar desabilitada no case (foco em login + seed). Se existir, estará em `POST /api/v1/auth/register`.

---

## 🛣️ Endpoints Principais

### Users / Auth
- `POST /api/v1/auth/login` → autenticação (JWT)

### Devices
- `GET /api/v1/devices?user_id=<UUID>` → lista dispositivos do usuário
- `POST /api/v1/devices` → cria dispositivo
- `PUT /api/v1/devices/{uuid}` → atualiza dispositivo
- `DELETE /api/v1/devices/{uuid}` → remove dispositivo

### Heartbeats
- `POST /api/v1/heartbeats` → ingesta métrica do device
- `GET /api/v1/heartbeats?device_uuid=<UUID>` → histórico de métricas

### Notification Rules & Notifications
- `POST /api/v1/notifications/rules` → cria regra (ex.: `cpu > 70`, `temperature > 80`)
- `GET /api/v1/notifications/rules` → lista regras
- `GET /api/v1/notifications` → lista últimas notificações

### WebSocket
- `GET /ws?user_id=<UUID>` → canal em tempo real (recebe notificações disparadas pelas regras)

---

## 🔔 Fluxo de Notificações em Tempo Real

1. **Simulador** envia heartbeats → `POST /api/v1/heartbeats`.
2. **Backend** avalia regras; quando uma condição é atendida:
   - Publica no **Redis (canal `notifications`)**.
3. **Worker** (`app/services/notifier.py`) consome o canal e envia a notificação via **WebSocket** para as conexões do usuário (`/ws?user_id=...`).
4. **Frontend** (conectado ao WS) recebe e exibe em tempo real.

---

## 🛰️ Simulador

O serviço `simulator` cria **N** dispositivos e publica heartbeats aleatórios em loop.

Configuração no `.env`:
```env
SIM_DEVICES=3
SIM_USER_EMAIL=admin@demo.com
SIM_USER_PASSWORD=admin
SIM_SEND_INTERVAL_SECONDS=10
```

Logs do simulador:
```bash
docker compose logs -f simulator
```

---

## 🖥️ Frontend

- **Dev server:** Vite na porta **5173** (com hot reload).  
- Rotas (ver `src/routes.tsx`):
  - `/` → **Login**
  - `/app/home` → **Dashboard**
  - `/app/devices` → **Lista de Dispositivos**
  - `/app/device-crud` → **Criar/Editar Dispositivo**
  - `/app/notifications` → **Notificações em tempo real**
- **Conexão com API:** usar `import.meta.env.VITE_API_URL`.
- **WebSocket:** `new WebSocket(\`ws://localhost:8000/ws?user_id=\${userId}\`)`.

> Dica: o `docker-compose.yml` já mapeia `./frontend:/app` — salvar um arquivo no host recarrega o Vite automaticamente (não precisa rebuild).

---

## 🧪 Testes (Backend)

Se houver suíte de testes, rode com:

```bash
docker compose exec backend pytest -q
```

---

## 🧰 Comandos Úteis

```bash
# Subir tudo
docker compose up -d

# Ver logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f simulator

# Acessar shell
docker compose exec backend bash
docker compose exec frontend sh

# Reiniciar um serviço (após mudar Dockerfile)
docker compose build frontend --no-cache && docker compose up -d frontend

# Derrubar tudo
docker compose down -v
```

---

## 🆘 Troubleshooting

- **Frontend abre em branco / erro de Vite:**
  - Verifique `frontend/package.json` inclui `@vitejs/plugin-react` e `vite` nas `devDependencies`.
  - `vite.config.ts` deve `export default defineConfig({ plugins: [react()] })`.
  - Rode `docker compose build frontend --no-cache && docker compose up -d frontend`.

- **WS não chega no navegador:**
  - Confirme conexão: `ws://localhost:8000/ws?user_id=<UUID do usuário logado>`.
  - Veja se o worker iniciou: logs do backend devem mostrar algo como  
    `🔔 Notifier worker escutando canal 'notifications'`.

- **Erro de login:**
  - Garanta que o admin foi criado com `seed_admin.py`.

---

## ✅ Entrega

- Repositório público: **exame-fullstack-setembro-dtlabs-2025**
- Prazo: **29/09 às 14h (America/Recife)**
- Enviar por e-mail: **marismar.malara@dt-labs.ai**

---

## 📄 Observações do Case

- **Autenticação** com JWT.
- **CRUD de Dispositivos** associado ao usuário.
- **Heartbeats** persistidos e consultáveis.
- **Regras de Notificação** configuráveis (ex.: thresholds de métricas).
- **Tempo Real** via WebSocket + Redis Pub/Sub.
- **Simulador** para gerar tráfego e acionar regras.
