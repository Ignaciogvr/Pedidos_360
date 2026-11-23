#!/bin/bash
# =============================================
# iniciar.sh - Levanta TODO el sistema Pedidos360
# Uso: bash ~/Pedidos_360-main/iniciar.sh
# =============================================

set -e
cd ~/Pedidos_360-main
mkdir -p logs

echo "================================================"
echo "   PEDIDOS360 - INICIANDO SISTEMA COMPLETO"
echo "================================================"

# --- 1. SWAP ---
echo ""
echo "[1/7] Configurando SWAP..."
if ! swapon --show | grep -q swapfile; then
    sudo fallocate -l 4G /swapfile 2>/dev/null || true
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile 2>/dev/null || true
    sudo swapon /swapfile 2>/dev/null || true
    echo "    SWAP activada (4GB)"
else
    echo "    SWAP ya activa"
fi
free -h | grep Swap

# --- 2. DOCKER BASE ---
echo ""
echo "[2/7] Levantando servicios base (MySQL, RabbitMQ, Prometheus, Grafana)..."
docker compose up -d --no-deps zookeeper rabbitmq mysql prometheus grafana
echo "    Servicios base OK"

# --- 3. KAFKA BROKERS ---
echo ""
echo "[3/7] Levantando Kafka brokers (3 brokers)..."
docker compose up -d --no-deps kafka-broker-1 kafka-broker-2 kafka-broker-3
echo "    Brokers arrancando..."

# --- 4. KAFKA UI ---
echo ""
echo "[4/7] Levantando Kafka UI (puerto 8090)..."
docker rm -f kafka-ui-pedidos360 2>/dev/null || true
docker run -d \
    --name kafka-ui-pedidos360 \
    --network pedidos360-network \
    -p 8090:8080 \
    -e KAFKA_CLUSTERS_0_NAME=pedidos360-cluster \
    -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS="kafka-broker-1:9092,kafka-broker-2:9093,kafka-broker-3:9094" \
    -e DYNAMIC_CONFIG_ENABLED=true \
    provectuslabs/kafka-ui:latest
echo "    Kafka UI OK"

# --- 5. TOPICOS KAFKA ---
echo ""
echo "[5/7] Creando topicos Kafka (esperando 25s que Kafka inicie)..."
sleep 25
docker exec kafka-broker-1 kafka-topics \
    --create --if-not-exists \
    --bootstrap-server kafka-broker-1:9092 \
    --topic pedidos.stream \
    --partitions 3 \
    --replication-factor 3 2>/dev/null && echo "    Topico pedidos.stream OK"
docker exec kafka-broker-1 kafka-topics \
    --create --if-not-exists \
    --bootstrap-server kafka-broker-1:9092 \
    --topic productos.analytics \
    --partitions 3 \
    --replication-factor 3 2>/dev/null && echo "    Topico productos.analytics OK"

# --- 6. MICROSERVICIOS JAVA ---
echo ""
echo "[6/7] Arrancando microservicios Java (java -jar -Xmx256m -WARN logging)..."

JAVA_OPTS="-Xmx256m -Dlogging.level.root=WARN -Dlogging.level.com.example=INFO"

nohup java $JAVA_OPTS -jar $(ls pedidos360-bff/build/libs/*.jar | grep -v plain) \
    > logs/bff.log 2>&1 &
echo "    BFF (8080) PID $!"

sleep 3
nohup java $JAVA_OPTS -jar $(ls pedidos360-ordenes/build/libs/*.jar | grep -v plain) \
    > logs/ordenes.log 2>&1 &
echo "    Ordenes (8081) PID $!"

sleep 3
nohup java $JAVA_OPTS -jar $(ls pedidos360-catalogo/build/libs/*.jar | grep -v plain) \
    > logs/catalogo.log 2>&1 &
echo "    Catalogo (8082) PID $!"

sleep 3
nohup java $JAVA_OPTS -jar $(ls pedidos360-mensajeria/build/libs/*.jar | grep -v plain) \
    > logs/mensajeria.log 2>&1 &
echo "    Mensajeria (8083) PID $!"

sleep 3
nohup java $JAVA_OPTS -jar $(ls pedidos360-kafka-admin/build/libs/*.jar | grep -v plain) \
    > logs/kafka-admin.log 2>&1 &
echo "    Kafka Admin (8084) PID $!"

sleep 3
nohup java $JAVA_OPTS -jar $(ls pedidos360-streaming/build/libs/*.jar | grep -v plain) \
    > logs/streaming.log 2>&1 &
echo "    Kafka Streaming (8085) PID $!"

# --- 7. FRONTEND ANGULAR ---
echo ""
echo "[7/7] Arrancando Frontend Angular (puerto 4200)..."
cd pedidos360-frontend
nohup npx ng serve --host 0.0.0.0 --port 4200 \
    > ../logs/frontend.log 2>&1 &
echo "    Frontend (4200) PID $!"
cd ..

# --- RESULTADO ---
echo ""
echo "================================================"
echo "   SISTEMA INICIANDO - Espera 90 segundos"
echo "================================================"
sleep 90

echo ""
echo "--- VERIFICACION FINAL ---"
echo "Procesos Java activos: $(ps aux | grep java | grep -v grep | wc -l)"
echo "Disco disponible: $(df -h / | tail -1 | awk '{print $4}')"
echo "Memoria disponible: $(free -h | grep Mem | awk '{print $7}')"
echo ""
echo "URLs del sistema:"
IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "100.56.50.91")
echo "  Frontend:      http://$IP:4200"
echo "  Kafka UI:      http://$IP:8090"
echo "  BFF:           http://$IP:8080"
echo "  Kafka Admin:   http://$IP:8084"
echo "  Kafka Stream:  http://$IP:8085"
echo ""
echo "LISTO!"
