#!/bin/bash
# =============================================
# detener.sh - Detiene TODO el sistema Pedidos360
# Uso: bash ~/Pedidos_360-main/detener.sh
# =============================================

cd ~/Pedidos_360-main

echo "================================================"
echo "   PEDIDOS360 - DETENIENDO SISTEMA"
echo "================================================"

# --- 1. MICROSERVICIOS JAVA ---
echo ""
echo "[1/3] Deteniendo microservicios Java..."
pkill -f "pedidos360-bff" 2>/dev/null && echo "    BFF detenido" || true
pkill -f "pedidos360-ordenes" 2>/dev/null && echo "    Ordenes detenido" || true
pkill -f "pedidos360-catalogo" 2>/dev/null && echo "    Catalogo detenido" || true
pkill -f "pedidos360-mensajeria" 2>/dev/null && echo "    Mensajeria detenido" || true
pkill -f "pedidos360-kafka-admin" 2>/dev/null && echo "    Kafka Admin detenido" || true
pkill -f "pedidos360-streaming" 2>/dev/null && echo "    Kafka Streaming detenido" || true
pkill -f "ng serve" 2>/dev/null && echo "    Frontend detenido" || true
sleep 2
echo "    Procesos Java restantes: $(ps aux | grep java | grep -v grep | wc -l)"

# --- 2. KAFKA UI ---
echo ""
echo "[2/3] Deteniendo Kafka UI..."
docker rm -f kafka-ui-pedidos360 2>/dev/null && echo "    Kafka UI detenido" || true

# --- 3. DOCKER COMPOSE ---
echo ""
echo "[3/3] Deteniendo Docker Compose..."
docker compose down
echo "    Docker detenido"

# --- LIMPIAR LOGS ---
echo ""
echo "Limpiando logs..."
> logs/bff.log 2>/dev/null || true
> logs/ordenes.log 2>/dev/null || true
> logs/catalogo.log 2>/dev/null || true
> logs/mensajeria.log 2>/dev/null || true
> logs/kafka-admin.log 2>/dev/null || true
> logs/streaming.log 2>/dev/null || true
> logs/frontend.log 2>/dev/null || true
echo "    Logs limpiados"

echo ""
echo "================================================"
echo "   SISTEMA DETENIDO"
echo "   Disco disponible: $(df -h / | tail -1 | awk '{print $4}')"
echo "   Ya puedes parar la instancia AWS."
echo "================================================"
