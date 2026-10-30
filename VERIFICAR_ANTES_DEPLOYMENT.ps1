# VERIFICACION PRE-DEPLOYMENT
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION PRE-DEPLOYMENT  " -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Docker
Write-Host "[1/6] Verificando Docker..." -ForegroundColor Cyan
try {
    $containers = docker ps --format "{{.Names}}"
    if ($containers -match "rabbitmq" -and $containers -match "mysql" -and $containers -match "prometheus" -and $containers -match "grafana") {
        Write-Host "  OK 4 contenedores corriendo" -ForegroundColor Green
    } else {
        Write-Host "  ERROR Faltan contenedores" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "  ERROR Docker no responde" -ForegroundColor Red
    $allGood = $false
}

# 2. Archivos de configuracion
Write-Host ""
Write-Host "[2/6] Verificando archivos..." -ForegroundColor Cyan
$files = @(
    "docker-compose.yml",
    "prometheus.yml",
    "pedidos360-bff\src\main\resources\application.yml",
    "pedidos360-ordenes\src\main\resources\application.yml",
    "pedidos360-catalogo\src\main\resources\application.yml",
    "pedidos360-mensajeria\src\main\resources\application.yml",
    "pedidos360-frontend\src\app\app.config.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  ERROR Falta $file" -ForegroundColor Red
        $allGood = $false
    }
}

# 3. Compilacion de microservicios
Write-Host ""
Write-Host "[3/6] Verificando compilacion..." -ForegroundColor Cyan
$services = @("pedidos360-bff", "pedidos360-ordenes", "pedidos360-catalogo", "pedidos360-mensajeria")
foreach ($service in $services) {
    if (Test-Path "$service\build\libs\*.jar") {
        Write-Host "  OK $service compilado" -ForegroundColor Green
    } else {
        Write-Host "  WARN $service sin compilar (se compilara en AWS)" -ForegroundColor Yellow
    }
}

# 4. Azure Entra ID config
Write-Host ""
Write-Host "[4/6] Verificando config Azure..." -ForegroundColor Cyan
$config = Get-Content "pedidos360-frontend\src\app\app.config.ts" -Raw
if ($config -match "b6f34517-563c-4ce9-a10b-6f3958083091" -and $config -match "3bdb2628-3745-4907-9593-53d8c7cb36fb") {
    Write-Host "  OK Tenant y Client ID correctos" -ForegroundColor Green
} else {
    Write-Host "  ERROR Config Azure incorrecta" -ForegroundColor Red
    $allGood = $false
}

# 5. Documentacion
Write-Host ""
Write-Host "[5/6] Verificando documentacion..." -ForegroundColor Cyan
if (Test-Path "README.md") {
    Write-Host "  OK README.md" -ForegroundColor Green
}
if (Test-Path "RESUMEN_EV2.md") {
    Write-Host "  OK RESUMEN_EV2.md" -ForegroundColor Green
}
if (Test-Path "GUIA_DEPLOYMENT_AWS_AZURE.md") {
    Write-Host "  OK GUIA_DEPLOYMENT_AWS_AZURE.md" -ForegroundColor Green
}

# 6. Git
Write-Host ""
Write-Host "[6/6] Verificando Git..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "  OK Repositorio Git inicializado" -ForegroundColor Green
    Write-Host "  INFO Recuerda hacer commit antes de subir" -ForegroundColor Yellow
} else {
    Write-Host "  WARN No hay repositorio Git" -ForegroundColor Yellow
    Write-Host "  Considera inicializar: git init" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "  TODO LISTO PARA DEPLOYMENT" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Siguiente paso:" -ForegroundColor Yellow
    Write-Host "  1. Lee GUIA_DEPLOYMENT_AWS_AZURE.md"
    Write-Host "  2. Conecta a tu EC2"
    Write-Host "  3. Sube el codigo"
    Write-Host "  4. Ejecuta los comandos de la guia"
} else {
    Write-Host "  HAY PROBLEMAS - REVISAR" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Cyan
}
Write-Host ""
