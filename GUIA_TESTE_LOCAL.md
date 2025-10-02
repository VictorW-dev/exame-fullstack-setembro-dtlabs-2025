# 🚀 Guia para Testar o Sistema Localmente

## 📋 Pré-requisitos
- Docker e Docker Compose instalados
- Node.js (para desenvolvimento do frontend)
- Portas livres: 8000 (backend), 5432 (postgres), 5173 (frontend)

## 🐳 Opção 1: Usando Docker (Recomendado)

### 1. Subir todo o sistema com Docker
```powershell
# Na pasta raiz do projeto
docker-compose up -d
```

### 2. Verificar se os containers estão rodando
```powershell
docker-compose ps
```

### 3. Acessar as aplicações
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 💻 Opção 2: Backend Docker + Frontend Local (Desenvolvimento)

### 1. Subir apenas backend e banco
```powershell
# Subir PostgreSQL
docker-compose up -d db

# Subir o backend
docker-compose up -d backend

# Subir o simulador (opcional)
docker-compose up -d simulator
```

### 2. Rodar o frontend localmente
```powershell
# Navegar para a pasta do frontend
cd frontend

# Instalar dependências (só na primeira vez)
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

### 3. Acessar as aplicações
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 🧪 Como Testar as Funcionalidades

### 1. Testar Autenticação
1. Acesse http://localhost:5173 (ou 3000 se usando Docker)
2. Faça login com:
   - **Email**: `admin@demo.com`
   - **Senha**: `admin`

### 2. Testar CRUD de Dispositivos
1. Após login, vá para "Dispositivos"
2. Clique em "Novo Dispositivo"
3. Preencha os dados e salve
4. Teste editar e excluir dispositivos

### 3. Testar Telemetria
1. Vá para "Detalhes" de um dispositivo
2. Observe os dados de telemetria chegando em tempo real
3. Verifique os gráficos sendo atualizados

### 4. Testar Notificações
1. Na página principal, observe o sino de notificações
2. As notificações aparecem automaticamente quando:
   - Dispositivo fica offline (sem heartbeat por 5min)
   - Temperatura alta (>30°C)

## 🔧 Comandos Úteis para Debug

### Ver logs dos containers
```powershell
# Logs do backend
docker-compose logs -f backend

# Logs do frontend
docker-compose logs -f frontend

# Logs do simulador
docker-compose logs -f simulator

# Logs de todos os serviços
docker-compose logs -f
```

### Reiniciar serviços
```powershell
# Reiniciar um serviço específico
docker-compose restart backend

# Rebuildar e reiniciar
docker-compose up -d --build backend
```

### Acessar container do backend
```powershell
docker-compose exec backend bash
```

### Verificar banco de dados
```powershell
# Conectar ao PostgreSQL
docker-compose exec db psql -U postgres -d telemetry_db

# Ver tabelas
\dt

# Ver dados dos dispositivos
SELECT * FROM devices;
```

## 🔍 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:5173 | Interface principal |
| Backend API | http://localhost:8000 | API REST |
| Swagger Docs | http://localhost:8000/docs | Documentação interativa |
| Redoc | http://localhost:8000/redoc | Documentação alternativa |

## 🧪 Testando APIs Diretamente

### 1. Login via API
```powershell
$body = @{email='admin@demo.com'; password='admin'} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body
```

### 2. Listar dispositivos
```powershell
# Substitua TOKEN pelo token recebido no login
curl -X GET "http://localhost:8000/api/v1/devices/" \
     -H "Authorization: Bearer TOKEN"
```

## 🔄 Scripts de Teste Automatizado

### Teste completo do sistema
```powershell
# Executar todos os testes
.\test-sistema-completo.ps1
```

### Teste básico
```powershell
# Teste rápido
.\test-sistema.ps1
```

## ❌ Solução de Problemas Comuns

### Porta já em uso
```powershell
# Verificar o que está usando a porta 8000
netstat -ano | findstr :8000

# Matar processo se necessário
taskkill /F /PID [PID_NUMBER]
```

### Erro de CORS
- Verifique se o backend está rodando na porta 8000
- Confirme que o frontend está configurado para apontar para a API correta

### Banco não conecta
```powershell
# Reiniciar o banco
docker-compose restart db

# Verificar logs
docker-compose logs db
```

### Frontend não carrega
```powershell
# Se usando desenvolvimento local
cd frontend
npm install
npm run dev

# Se usando Docker
docker-compose restart frontend
```

## 🎯 Checklist de Teste

- [ ] Sistema sobe sem erros
- [ ] Login funciona
- [ ] CRUD de dispositivos funciona
- [ ] Telemetria aparece em tempo real
- [ ] Notificações são exibidas
- [ ] WebSocket conecta
- [ ] API documentation acessível
- [ ] Simulador envia dados

## 🆘 Comandos de Emergência

### Limpar tudo e recomeçar
```powershell
# Parar tudo
docker-compose down

# Limpar volumes e imagens
docker system prune -f
docker volume prune -f

# Rebuildar tudo
docker-compose up -d --build
```
