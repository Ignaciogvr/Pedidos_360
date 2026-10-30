# ========================================
# SCRIPT DE DETENCIÓN - PEDIDOS360
# ========================================

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   DETENIENDO SISTEMA PEDIDOS360   " -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Detener Microservicios
Write-Host "[1/5] Deteniendo microservicios Java..." -ForegroundColor Cyan

# BFF
if (Test-Path ".\pedidos360-bff\bff_pid.txt") {
    $pid = Get-Content ".\pedidos360-bff\bff_pid.txt"
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ BFF detenido" -ForegroundColor Green
        Remove-Item ".\pedidos360-bff\bff_pid.txt"
    } catch {
        Write-Host "  ⚠️ BFF ya estaba detenido" -ForegroundColor Yellow
    }
}

# Órdenes
if (Test-Path ".\pedidos360-ordenes\ordenes_pid.txt") {
    $pid = Get-Content ".\pedidos360-ordenes\ordenes_pid.txt"
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Órdenes detenido" -ForegroundColor Green
        Remove-Item ".\pedidos360-ordenes\ordenes_pid.txt"
    } catch {
        Write-Host "  ⚠️ Órdenes ya estaba detenido" -ForegroundColor Yellow
    }
}

# Catálogo
if (Test-Path ".\pedidos360-catalogo\catalogo_pid.txt") {
    $pid = Get-Content ".\pedidos360-catalogo\catalogo_pid.txt"
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Catálogo detenido" -ForegroundColor Green
        Remove-Item ".\pedidos360-catalogo\catalogo_pid.txt"
    } catch {
        Write-Host "  ⚠️ Catálogo ya estaba detenido" -ForegroundColor Yellow
    }
}

# Mensajería
if (Test-Path ".\pedidos360-mensajeria\mensajeria_pid.txt") {
    $pid = Get-Content ".\pedidos360-mensajeria\mensajeria_pid.txt"
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Mensajería detenido" -ForegroundColor Green
        Remove-Item ".\pedidos360-mensajeria\mensajeria_pid.txt"
    } catch {
        Write-Host "  ⚠️ Mensajería ya estaba detenido" -ForegroundColor Yellow
    }
}

# Detener Docker
Write-Host ""
Write-Host "[2/5] Deteniendo infraestructura Docker..." -ForegroundColor Cyan
docker-compose down
Write-Host "  ✅ Docker detenido" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   SISTEMA DETENIDO CORRECTAMENTE  " -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
