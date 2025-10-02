# 🧪 Script de Teste Rápido do Sistema

Write-Host "🚀 Iniciando teste do sistema IoT Telemetry..." -ForegroundColor Green

# 1. Verificar se os containers estão rodando
Write-Host "`n📦 Verificando containers..." -ForegroundColor Yellow
$containers = docker-compose ps --format "table {{.Name}}\t{{.Status}}"
Write-Host $containers

# 2. Testar endpoints da API
Write-Host "`n🔍 Testando endpoints da API..." -ForegroundColor Yellow

try {
    # Teste da documentação
    $docs = Invoke-WebRequest -Uri "http://localhost:8000/docs" -Method GET -TimeoutSec 5
    Write-Host "✅ Documentação da API: FUNCIONANDO (Status: $($docs.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Documentação da API: ERRO" -ForegroundColor Red
}

# 3. Testar Frontend
Write-Host "`n🖥️  Testando Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend: FUNCIONANDO (Status: $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: ERRO" -ForegroundColor Red
}

# 4. Verificar logs recentes
Write-Host "`n📋 Logs recentes do backend:" -ForegroundColor Yellow
docker-compose logs --tail=5 backend

Write-Host "`n📋 Logs recentes do simulador:" -ForegroundColor Yellow
docker-compose logs --tail=3 simulator

# 5. Informações de acesso
Write-Host "`nURLs para teste:" -ForegroundColor Cyan
Write-Host "Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:     http://localhost:8000" -ForegroundColor White
Write-Host "Documentação:    http://localhost:8000/docs" -ForegroundColor White
Write-Host "Redoc:           http://localhost:8000/redoc" -ForegroundColor White

Write-Host "`nCredenciais de teste:" -ForegroundColor Cyan
Write-Host "Email:    admin@demo.com" -ForegroundColor White
Write-Host "Senha:    admin" -ForegroundColor White

Write-Host "`nComo testar:" -ForegroundColor Cyan
Write-Host "1. Acesse http://localhost:5173" -ForegroundColor White
Write-Host "2. Faça login com as credenciais acima" -ForegroundColor White
Write-Host "3. Navegue pelas funcionalidades:" -ForegroundColor White
Write-Host "   - Dispositivos (CRUD)" -ForegroundColor Gray
Write-Host "   - Telemetria em tempo real" -ForegroundColor Gray
Write-Host "   - Notificações" -ForegroundColor Gray
Write-Host "   - Dashboards" -ForegroundColor Gray

Write-Host "`n✨ Teste concluído!" -ForegroundColor Green
