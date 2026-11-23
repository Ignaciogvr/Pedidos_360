# 📡 README - Evaluación 3: Apache Kafka (EP5 + EP6)

## ✅ Estado actual en AWS EC2

**IP Pública:** `100.56.50.91`  
**Instancia:** `i-00287c46080489deb` (t2.medium — 2 vCPU, 4GB RAM + 4GB SWAP)  
**Rama GitHub:** `deploy-aws`

---

## 🏗️ Arquitectura implementada

```
[Angular Frontend :4200]
        │
        ▼
[BFF Gateway :8080]
        │
   ┌────┴────┐
   ▼         ▼
[Ordenes :8081]  [Catalogo :8082]
   │
   ▼ KafkaProducerService
[Apache Kafka Cluster]
   │  ├── kafka-broker-1 :9092
   │  ├── kafka-broker-2 :9093
   │  └── kafka-broker-3 :9094
   │
   ├── Topic: pedidos.stream      (3 particiones, 3 réplicas)
   └── Topic: productos.analytics (3 particiones, 3 réplicas)
        │
        ▼ Kafka Streaming Consumer
[Streaming :8085] ← pedidos360-streaming-group
        │
[Kafka Admin :8084] ← API REST para gestión de tópicos
[Kafka UI :8090]    ← UI visual (provectuslabs/kafka-ui)
```

---

## 🌐 URLs activas en AWS

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend Angular | http://100.56.50.91:4200 | App principal |
| BFF Gateway | http://100.56.50.91:8080 | API Gateway |
| MS Órdenes | http://100.56.50.91:8081 | CRUD pedidos + Kafka Producer |
| MS Mensajería | http://100.56.50.91:8083 | RabbitMQ messaging |
| **Kafka Admin API** | http://100.56.50.91:8084 | REST API gestión Kafka (EP5) |
| **Kafka Streaming** | http://100.56.50.91:8085 | Consumer + procesamiento (EP6) |
| **Kafka UI** | http://100.56.50.91:8090 | Panel visual Kafka |
| Grafana | http://100.56.50.91:3000 | Métricas |
| RabbitMQ UI | http://100.56.50.91:15672 | guest/guest |

---

## 📦 Microservicios nuevos para EV3

### `pedidos360-kafka-admin` (puerto 8084)
- **Función:** API REST para administración de tópicos Kafka
- **Endpoints:**
  - `GET /topics` — listar todos los tópicos
  - `POST /topics` — crear nuevo tópico
  - `DELETE /topics/{name}` — eliminar tópico
  - `GET /consumer-groups` — listar consumer groups
- **Autenticación:** Azure AD OAuth2 (protegido)
- **JAR:** `pedidos360-kafka-admin/build/libs/pedidos360-kafka-admin-0.0.1-SNAPSHOT.jar`

### `pedidos360-streaming` (puerto 8085)
- **Función:** Kafka Streams consumer que procesa eventos en tiempo real
- **Consumer Group:** `pedidos360-streaming-group`
- **Tópicos consumidos:** `pedidos.stream`, `productos.analytics`
- **Particiones asignadas:** 6 (3 por tópico)
- **JAR:** `pedidos360-streaming/build/libs/pedidos360-streaming-0.0.1-SNAPSHOT.jar`

---

## 🔄 Flujo de eventos Kafka implementado

1. Usuario crea un pedido en la app → `POST /api/ordenes`
2. `PedidoService` en `pedidos360-ordenes` llama a `KafkaProducerService`
3. `KafkaProducerService` publica `PedidoEventDTO` en tópico `pedidos.stream`
4. `pedidos360-streaming` consume el evento con `@KafkaListener`
5. El evento aparece en Kafka UI con Message Count incrementado

---

## 🐳 Infraestructura Docker (`docker-compose.yml`)

```yaml
# Kafka Cluster
- zookeeper-pedidos360    # Coordinación
- kafka-broker-1          # :9092 / :19092 (externo)
- kafka-broker-2          # :9093 / :19093 (externo)
- kafka-broker-3          # :9094 / :19094 (externo)
- kafka-ui-pedidos360     # :8090 (manual run, no en compose)

# Configuración memoria (evita OOM en t2.medium)
- mem_limit: 512m por broker
- KAFKA_HEAP_OPTS: -Xmx256M -Xms256M
```

---

## ⚙️ Cómo levantar todo en AWS desde cero

```bash
# 1. Conectar a EC2 (EC2 Instance Connect)

# 2. Agregar SWAP (una sola vez)
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile

# 3. Pull código
cd ~/Pedidos_360-main && git pull origin deploy-aws

# 4. Levantar Docker
docker compose up -d --no-deps zookeeper rabbitmq mysql prometheus grafana
docker compose up -d --no-deps kafka-broker-1 kafka-broker-2 kafka-broker-3

# 5. Kafka UI
docker rm -f kafka-ui-pedidos360 2>/dev/null
docker run -d --name kafka-ui-pedidos360 --network pedidos360-network -p 8090:8080 \
  -e KAFKA_CLUSTERS_0_NAME=pedidos360-cluster \
  -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS="kafka-broker-1:9092,kafka-broker-2:9093,kafka-broker-3:9094" \
  -e DYNAMIC_CONFIG_ENABLED=true provectuslabs/kafka-ui:latest

# 6. Crear tópicos
sleep 20
docker exec kafka-broker-1 kafka-topics --create --if-not-exists \
  --bootstrap-server kafka-broker-1:9092 --topic pedidos.stream --partitions 3 --replication-factor 3
docker exec kafka-broker-1 kafka-topics --create --if-not-exists \
  --bootstrap-server kafka-broker-1:9092 --topic productos.analytics --partitions 3 --replication-factor 3

# 7. Microservicios (java -jar, NO gradlew bootRun)
mkdir -p logs
nohup java -Xmx256m -jar $(ls pedidos360-bff/build/libs/*.jar | grep -v plain) > logs/bff.log 2>&1 &
nohup java -Xmx256m -jar $(ls pedidos360-ordenes/build/libs/*.jar | grep -v plain) > logs/ordenes.log 2>&1 &
nohup java -Xmx256m -jar $(ls pedidos360-catalogo/build/libs/*.jar | grep -v plain) > logs/catalogo.log 2>&1 &
nohup java -Xmx256m -jar $(ls pedidos360-mensajeria/build/libs/*.jar | grep -v plain) > logs/mensajeria.log 2>&1 &
nohup java -Xmx256m -jar $(ls pedidos360-kafka-admin/build/libs/*.jar | grep -v plain) > logs/kafka-admin.log 2>&1 &
nohup java -Xmx256m -jar $(ls pedidos360-streaming/build/libs/*.jar | grep -v plain) > logs/streaming.log 2>&1 &

# 8. Frontend Angular
cd pedidos360-frontend
nohup npx ng serve --host 0.0.0.0 --port 4200 > ../logs/frontend.log 2>&1 &
```

---

## ⚠️ Notas importantes

- **SWAP obligatoria**: Sin swap el sistema sufre OOM. Configurar siempre al iniciar.
- **NO usar `./gradlew bootRun`**: Usa `java -jar` para ahorrar RAM.
- **Logs llenan el disco**: Si los logs crecen demasiado, truncar con `> logs/*.log`
- **Kafka UI vs SSM**: Kafka UI en 8090 no requiere auth. Los endpoints 8084/8085 requieren token Azure AD.
- **Healthcheck unhealthy**: Normal — es un falso positivo del healthcheck de bash tcp. Los brokers SÍ funcionan.
- **Si disco lleno**: `> ~/Pedidos_360-main/logs/*.log && rm -rf ~/.gradle/caches`
- **Si brokers crashean**: `docker compose down && docker volume rm $(docker volume ls -q | grep kafka) && docker compose up -d ...`

---

## 📋 Evidencia para rúbrica EV3

### EP5 - Apache Kafka Implementado
- [x] 3 brokers Kafka en cluster
- [x] Tópico `pedidos.stream` (3 particiones, RF=3)
- [x] Tópico `productos.analytics` (3 particiones, RF=3)
- [x] Microservicio `pedidos360-kafka-admin` con API REST
- [x] Producer integrado en `pedidos360-ordenes`

### EP6 - Kafka Streaming
- [x] Consumer group `pedidos360-streaming-group` STABLE
- [x] 6 particiones asignadas (3 por tópico)
- [x] Consumer lag = 0
- [x] Mensajes visibles en Kafka UI al crear pedidos
- [x] Kafka UI en http://100.56.50.91:8090

---

*Implementado: Noviembre 2026 | Rama: deploy-aws*
