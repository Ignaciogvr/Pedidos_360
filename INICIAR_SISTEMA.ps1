# SCRIPT DE INICIO - PEDIDOS360
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SISTEMA PEDIDOS360  " -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "[1/6] Verificando Docker..." -ForegroundColor Cyan
try {
    docker --version | Out-Null
    Write-Host "  OK Docker disponible" -ForegroundColor Green
} catch {
    Write-Host "  ERROR Docker no esta instalado" -ForegroundColor Red
    exit 1
}

# 2. Levantar Docker
Write-Host ""
Write-Host "[2/6] Levantando Docker..." -ForegroundColor Cyan
docker-compose up -d
Write-Host "  Esperando 60 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 60
Write-Host "  OK Infraestructura levantada" -ForegroundColor Green

# 3. Iniciar BFF
Write-Host ""
Write-Host "[3/6] Iniciando BFF (puerto 8080)..." -ForegroundColor Cyan
Set-Location pedidos360-bff
if (Test-Path "bff_pid.txt") {
    Remove-Item "bff_pid.txt"
}
Start-Process powershell -ArgumentList "-NoProfile -Command `".\gradlew.bat bootRun > bff-startup.log 2>&1`"" -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "  OK BFF iniciando..." -ForegroundColor Green
Set-Location ..

# 4. Iniciar Ordenes
Write-Host ""
Write-Host "[4/6] Iniciando Ordenes (puerto 8081)..." -ForegroundColor Cyan
Set-Location pedidos360-ordenes
if (Test-Path "ordenes_pid.txt") {
    Remove-Item "ordenes_pid.txt"
}
Start-Process powershell -ArgumentList "-NoProfile -Command `".\gradlew.bat bootRun > ordenes-startup.log 2>&1`"" -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "  OK Ordenes iniciando..." -ForegroundColor Green
Set-Location ..

# 5. Iniciar Catalogo
Write-Host ""
Write-Host "[5/6] Iniciando Catalogo (puerto 8082)..." -ForegroundColor Cyan
Set-Location pedidos360-catalogo
if (Test-Path "catalogo_pid.txt") {
    Remove-Item "catalogo_pid.txt"
}
Start-Process powershell -ArgumentList "-NoProfile -Command `".\gradlew.bat bootRun > catalogo-startup.log 2>&1`"" -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "  OK Catalogo iniciando..." -ForegroundColor Green
Set-Location ..

# 6. Iniciar Mensajeria
Write-Host ""
Write-Host "[6/6] Iniciando Mensajeria (puerto 8083)..." -ForegroundColor Cyan
Set-Location pedidos360-mensajeria
if (Test-Path "mensajeria_pid.txt") {
    Remove-Item "mensajeria_pid.txt"
}
Start-Process powershell -ArgumentList "-NoProfile -Command `".\gradlew.bat bootRun > mensajeria-startup.log 2>&1`"" -WindowStyle Hidden
Start-Sleep -Seconds 3
Write-Host "  OK Mensajeria iniciando..." -ForegroundColor Green
Set-Location ..

# Resumen
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  SISTEMA INICIADO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor Yellow
Write-Host "  Frontend:    http://localhost:4200"
Write-Host "  BFF:         http://localhost:8080"
Write-Host "  Ordenes:     http://localhost:8081"
Write-Host "  Catalogo:    http://localhost:8082"
Write-Host "  Mensajeria:  http://localhost:8083"
Write-Host ""
Write-Host "  RabbitMQ:    http://localhost:15672 (guest/guest)"
Write-Host "  Prometheus:  http://localhost:9090"
Write-Host "  Grafana:     http://localhost:3000 (admin/admin)"
Write-Host ""
Write-Host "Los microservicios tardan 60-90 segundos en estar listos" -ForegroundColor Yellow
Write-Host ""
