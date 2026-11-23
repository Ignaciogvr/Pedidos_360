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
pkill -f "pedidos360-bff" 2>/dev/null && echo "    BFF detenido" || echo "    BFF no estaba corriendo"
pkill -f "pedidos360-ordenes" 2>/dev/null && echo "    Ordenes detenido" || echo "    Ordenes no estaba corriendo"
pkill -f "pedidos360-catalogo" 2>/dev/null && echo "    Catalogo detenido" || echo "    Catalogo no estaba corriendo"
pkill -f "pedidos360-mensajeria" 2>/dev/null && echo "    Mensajeria detenido" || echo "    Mensajeria no estaba corriendo"
pkill -f "pedidos360-kafka-admin" 2>/dev/null && echo "    Kafka Admin detenido" || echo "    Kafka Admin no estaba corriendo"
pkill -f "pedidos360-streaming" 2>/dev/null && echo "    Kafka Streaming detenido" || echo "    Kafka Streaming no estaba corriendo"
pkill -f "ng serve" 2>/dev/null && echo "    Frontend detenido" || echo "    Frontend no estaba corriendo"

echo "    Procesos Java restantes: $(ps aux | grep java | grep -v grep | wc -l)"

# --- 2. KAFKA UI ---
echo ""
echo "[2/3] Deteniendo Kafka UI..."
docker rm -f kafka-ui-pedidos360 2>/dev/null && echo "    Kafka UI detenido" || echo "    Kafka UI no estaba corriendo"

# --- 3. DOCKER COMPOSE ---
echo ""
echo "[3/3] Deteniendo Docker Compose..."
docker compose down
echo "    Docker Compose detenido"

# --- LIMPIAR LOGS (opcional) ---
echo ""
read -p "Limpiar logs? (s/n): " resp
if [[ "$resp" == "s" || "$resp" == "S" ]]; then
    > logs/bff.log
    > logs/ordenes.log
    > logs/catalogo.log
    > logs/mensajeria.log
    > logs/kafka-admin.log
    > logs/streaming.log
    > logs/frontend.log
    echo "    Logs limpiados"
fi

echo ""
echo "================================================"
echo "   SISTEMA DETENIDO COMPLETAMENTE"
echo "   Disco disponible: $(df -h / | tail -1 | awk '{print $4}')"
echo "================================================"
