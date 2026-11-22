# 🚀 PLAN EXHAUSTIVO - IMPLEMENTACIÓN KAFKA (EP5 + EP6)

## 📋 ANÁLISIS DE TU CÓDIGO ACTUAL

### ✅ **Lo que YA TIENES (y funciona):**
- ✅ 4 Microservicios Java Spring Boot
- ✅ RabbitMQ con 9 colas (3 dominios + retry + DLQ)
- ✅ Autenticación Azure AD con JWT
- ✅ Docker Compose con RabbitMQ, MySQL, Prometheus, Grafana
- ✅ Frontend Angular 18 desplegado
- ✅ Sistema funcionando en AWS EC2

### 🎯 **Lo que DEBES AGREGAR para EP5 + EP6:**
- 🆕 Apache Kafka con Zookeeper
- 🆕 Kafka UI para administración
- 🆕 2 tópicos con 3 particiones y 3 réplicas cada uno
- 🆕 Productores Kafka en microservicios
- 🆕 Consumidores Kafka con @KafkaListener
- 🆕 Microservicio administrador de Kafka
- 🆕 Streaming de eventos en tiempo real

---

## 📊 EVALUACIONES - PONDERACIONES EXACTAS

### **EP5 (Encargo - 12%)**
| Criterio | Peso | Lo que se evalúa |
|----------|------|------------------|
| **Productores Kafka** | 14% | Implementación con DTOs, serialización correcta |
| **Consumidores Kafka** | 14% | @KafkaListener, manejo de offsets, consumer groups |
| **Configuración cliente Kafka** | 12% | bootstrap-servers, serializers, auto-offset-reset |
| **Docker Compose Kafka** | 10% | Zookeeper + Brokers + Kafka UI funcionando |
| **Microservicio Admin Kafka** | 10% | Crear/modificar/eliminar tópicos |
| **Integración sin romper RabbitMQ** | 10% | Kafka coexiste con RabbitMQ |
| Código compilado | 10% | Build exitoso |
| Frontend actualizado | 10% | Vistas nuevas para Kafka |
| JWT validado | 5% | Ya lo tienes ✅ |
| .gitignore correcto | 5% | Ya lo tienes ✅ |

### **EP6 (Presentación - 18%)**
| Criterio | Peso | Lo que debes mostrar |
|----------|------|---------------------|
| **Administración Kafka** | 15% | Kafka UI con 2 tópicos × 3 particiones × 3 réplicas |
| **Monitoreo offsets/lag** | 15% | Consumer groups, lag, offset commit |
| **Casos de uso streaming** | 15% | Flujo completo en tiempo real |
| Kafka + RabbitMQ juntos | 12% | Demostrar coexistencia |
| Docker Compose Kafka | 10% | Levantando clúster |
| Productores en código | 10% | Mostrar código productor |
| Consumidores en código | 10% | Mostrar código consumidor |
| Configuración centralizada | 8% | application.yml con Kafka |
| JWT validado | 5% | Ya lo tienes ✅ |

**TOTAL:** 30% de tu nota final (12% + 18%)

---

## 🎯 ESTRATEGIA PARA NOTA MÁXIMA (7.0)

### **LO MÁS IMPORTANTE (concentra esfuerzos aquí):**

**EP5:**
1. ✅ Productores (14%) + Consumidores (14%) = **28%**
2. ✅ Configuración Kafka (12%)
3. ✅ Docker Compose Kafka (10%)

**EP6:**
1. ✅ Kafka UI con 2 tópicos × 3 particiones × 3 réplicas (15%)
2. ✅ Monitoreo offsets/lag (15%)
3. ✅ Casos de uso streaming en vivo (15%)

**Total crítico:** ~100% de ambas evaluaciones

---

## 📐 ARQUITECTURA PROPUESTA

### **ARQUITECTURA ACTUAL (con RabbitMQ):**
```
Usuario → Frontend → BFF → Órdenes → RabbitMQ → Mensajería (3 dominios)
                            Catálogo →
```

### **ARQUITECTURA NUEVA (con Kafka + RabbitMQ):**
```
Usuario → Frontend → BFF → Órdenes → RabbitMQ → Mensajería (3 dominios)
                                   → KAFKA → Streaming Analytics
                            Catálogo →
```

### **SEPARACIÓN DE RESPONSABILIDADES:**

**RabbitMQ (conservar como está):**
- ✅ Notificaciones (emails/SMS)
- ✅ Auditoría (logs)
- ✅ Inventario (sincronización stock)

**Kafka (nuevo):**
- 🆕 **Streaming de pedidos** en tiempo real
- 🆕 **Analítica de productos** (top vendidos, tendencias)
- 🆕 **Métricas de negocio** (ventas por hora, categoría más popular)

---

## 🔧 PLAN DE IMPLEMENTACIÓN PASO A PASO

### **FASE 1: INFRAESTRUCTURA KAFKA (2-3 horas)**

#### **1.1 Actualizar docker-compose.yml**

**Agregar:**
- Zookeeper (1 nodo)
- Kafka Broker (3 nodos para réplicas)
- Kafka UI (administración web)

**Archivo:** `docker-compose.yml`

```yaml
services:
  # ... (mantener RabbitMQ, MySQL, etc.)

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: zookeeper-pedidos360
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
      - zookeeper_logs:/var/lib/zookeeper/log
    networks:
      - pedidos360-network

  kafka-broker-1:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker-1
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "19092:19092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker-1:9092,PLAINTEXT_HOST://localhost:19092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
    volumes:
      - kafka1_data:/var/lib/kafka/data
    networks:
      - pedidos360-network

  kafka-broker-2:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker-2
    depends_on:
      - zookeeper
    ports:
      - "9093:9093"
      - "19093:19093"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker-2:9093,PLAINTEXT_HOST://localhost:19093
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
    volumes:
      - kafka2_data:/var/lib/kafka/data
    networks:
      - pedidos360-network

  kafka-broker-3:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker-3
    depends_on:
      - zookeeper
    ports:
      - "9094:9094"
      - "19094:19094"
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker-3:9094,PLAINTEXT_HOST://localhost:19094
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
    volumes:
      - kafka3_data:/var/lib/kafka/data
    networks:
      - pedidos360-network

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui-pedidos360
    depends_on:
      - kafka-broker-1
      - kafka-broker-2
      - kafka-broker-3
    ports:
      - "8090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: pedidos360-cluster
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka-broker-1:9092,kafka-broker-2:9093,kafka-broker-3:9094
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
      DYNAMIC_CONFIG_ENABLED: 'true'
    networks:
      - pedidos360-network

volumes:
  # ... (mantener volúmenes existentes)
  zookeeper_data:
    name: pedidos360_zookeeper_data
  zookeeper_logs:
    name: pedidos360_zookeeper_logs
  kafka1_data:
    name: pedidos360_kafka1_data
  kafka2_data:
    name: pedidos360_kafka2_data
  kafka3_data:
    name: pedidos360_kafka3_data
```

**Verificar:**
```bash
docker-compose up -d
docker ps  # Deberías ver 10 contenedores (4 anteriores + 6 nuevos)

# Acceder a Kafka UI
# http://localhost:8090
```

---

### **FASE 2: MICROSERVICIO ADMINISTRADOR DE KAFKA (3-4 horas)**

#### **2.1 Crear nuevo microservicio: `pedidos360-kafka-admin`**

**Estructura:**
```
pedidos360-kafka-admin/
├── src/main/java/com/example/pedidos360_kafka_admin/
│   ├── Pedidos360KafkaAdminApplication.java
│   ├── config/
│   │   ├── KafkaAdminConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   ├── TopicController.java
│   │   └── ConsumerGroupController.java
│   ├── service/
│   │   ├── KafkaAdminService.java
│   │   └── KafkaMonitoringService.java
│   └── dto/
│       ├── TopicCreateRequest.java
│       ├── TopicInfo.java
│       └── ConsumerGroupInfo.java
├── src/main/resources/
│   └── application.yml
└── build.gradle
```

#### **2.2 Dependencias (build.gradle)**

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
    implementation 'org.springframework.kafka:spring-kafka'
    implementation 'org.apache.kafka:kafka-clients:3.5.1'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-registry-prometheus'
}
```

#### **2.3 application.yml**

```yaml
server:
  port: 8084

spring:
  application:
    name: pedidos360-kafka-admin

  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:19092,localhost:19093,localhost:19094}
    admin:
      properties:
        request.timeout.ms: 5000
    
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://sts.windows.net/b6f34517-563c-4ce9-a10b-6f3958083091/
          jwk-set-uri: https://login.microsoftonline.com/b6f34517-563c-4ce9-a10b-6f3958083091/discovery/v2.0/keys
          audiences: api://3bdb2628-3745-4907-9593-53d8c7cb36fb

management:
  endpoints:
    web:
      exposure:
        include: prometheus, health, info, metrics
  metrics:
    tags:
      application: ${spring.application.name}

logging:
  level:
    root: INFO
    com.example.pedidos360_kafka_admin: DEBUG
    org.apache.kafka: INFO
```

#### **2.4 KafkaAdminService.java**

```java
package com.example.pedidos360_kafka_admin.service;

import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.config.TopicConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
public class KafkaAdminService {

    private final AdminClient adminClient;

    public KafkaAdminService(@Value("${spring.kafka.bootstrap-servers}") String bootstrapServers) {
        Properties props = new Properties();
        props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        this.adminClient = AdminClient.create(props);
    }

    /**
     * Crear tópico con particiones y réplicas
     */
    public void createTopic(String topicName, int partitions, short replicationFactor) 
            throws ExecutionException, InterruptedException {
        
        Map<String, String> configs = new HashMap<>();
        configs.put(TopicConfig.RETENTION_MS_CONFIG, "604800000"); // 7 días
        configs.put(TopicConfig.CLEANUP_POLICY_CONFIG, "delete");
        
        NewTopic topic = new NewTopic(topicName, partitions, replicationFactor)
                .configs(configs);
        
        CreateTopicsResult result = adminClient.createTopics(Collections.singleton(topic));
        result.all().get();
        
        log.info("✅ Tópico creado: {} con {} particiones y {} réplicas", 
                topicName, partitions, replicationFactor);
    }

    /**
     * Listar todos los tópicos
     */
    public Set<String> listTopics() throws ExecutionException, InterruptedException {
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    /**
     * Describir tópico (particiones, réplicas, configuración)
     */
    public TopicDescription describeTopic(String topicName) 
            throws ExecutionException, InterruptedException {
        
        DescribeTopicsResult result = adminClient.describeTopics(Collections.singleton(topicName));
        return result.allTopicNames().get().get(topicName);
    }

    /**
     * Eliminar tópico
     */
    public void deleteTopic(String topicName) throws ExecutionException, InterruptedException {
        DeleteTopicsResult result = adminClient.deleteTopics(Collections.singleton(topicName));
        result.all().get();
        log.info("🗑️ Tópico eliminado: {}", topicName);
    }

    /**
     * Listar consumer groups
     */
    public Collection<ConsumerGroupListing> listConsumerGroups() 
            throws ExecutionException, InterruptedException {
        
        ListConsumerGroupsResult result = adminClient.listConsumerGroups();
        return result.all().get();
    }

    /**
     * Describir consumer group (offsets, lag)
     */
    public Map<String, Object> describeConsumerGroup(String groupId) 
            throws ExecutionException, InterruptedException {
        
        DescribeConsumerGroupsResult result = adminClient.describeConsumerGroups(
                Collections.singleton(groupId)
        );
        
        ConsumerGroupDescription description = result.all().get().get(groupId);
        
        Map<String, Object> info = new HashMap<>();
        info.put("groupId", description.groupId());
        info.put("state", description.state().toString());
        info.put("members", description.members().size());
        info.put("coordinator", description.coordinator().host());
        
        return info;
    }
}
```

#### **2.5 TopicController.java**

```java
package com.example.pedidos360_kafka_admin.controller;

import com.example.pedidos360_kafka_admin.service.KafkaAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/kafka/topics")
@RequiredArgsConstructor
public class TopicController {

    private the KafkaAdminService kafkaAdminService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createTopic(
            @RequestParam String name,
            @RequestParam(defaultValue = "3") int partitions,
            @RequestParam(defaultValue = "3") short replicas) {
        
        try {
            kafkaAdminService.createTopic(name, partitions, replicas);
            return ResponseEntity.ok(Map.of(
                    "message", "Tópico creado exitosamente",
                    "topic", name,
                    "partitions", String.valueOf(partitions),
                    "replicas", String.valueOf(replicas)
            ));
        } catch (Exception e) {
            log.error("Error creando tópico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Set<String>> listTopics() {
        try {
            Set<String> topics = kafkaAdminService.listTopics();
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            log.error("Error listando tópicos: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{name}")
    public ResponseEntity<Map<String, Object>> describeTopic(@PathVariable String name) {
        try {
            var description = kafkaAdminService.describeTopic(name);
            
            Map<String, Object> info = new HashMap<>();
            info.put("name", description.name());
            info.put("partitions", description.partitions().size());
            info.put("replicas", description.partitions().get(0).replicas().size());
            info.put("isInternal", description.isInternal());
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Error describiendo tópico: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Map<String, String>> deleteTopic(@PathVariable String name) {
        try {
            kafkaAdminService.deleteTopic(name);
            return ResponseEntity.ok(Map.of("message", "Tópico eliminado", "topic", name));
        } catch (Exception e) {
            log.error("Error eliminando tópico: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
```

---

### **FASE 3: PRODUCTORES KAFKA EN MICROSERVICIOS (4-5 horas)**

#### **3.1 Actualizar `pedidos360-ordenes` con productor Kafka**

**Agregar dependencia en build.gradle:**
```gradle
implementation 'org.springframework.kafka:spring-kafka'
```

**Actualizar application.yml:**
```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:19092,localhost:19093,localhost:19094}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
```

**Crear KafkaProducerConfig.java:**
```java
package com.example.pedidos360_ordenes.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.*;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, 
                "org.apache.kafka.common.serialization.StringSerializer");
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, 
                "org.springframework.kafka.support.serializer.JsonSerializer");
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

**Crear PedidoEventDTO.java:**
```java
package com.example.pedidos360_ordenes.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoEventDTO {
    private Long pedidoId;
    private String clienteEmail;
    private String clienteNombre;
    private String producto;
    private Integer cantidad;
    private BigDecimal total;
    private String estado;
    private LocalDateTime timestamp;
    private String eventType; // "CREATED", "UPDATED", "CANCELLED"
}
```

**Crear KafkaProducerService.java:**
```java
package com.example.pedidos360_ordenes.service;

import com.example.pedidos360_ordenes.dto.PedidoEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC_PEDIDOS_STREAM = "pedidos.stream";

    public void enviarEventoPedido(PedidoEventDTO evento) {
        try {
            String key = String.valueOf(evento.getPedidoId());
            
            CompletableFuture<SendResult<String, Object>> future = 
                    kafkaTemplate.send(TOPIC_PEDIDOS_STREAM, key, evento);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("✅ Evento Kafka enviado: topic={}, partition={}, offset={}, key={}", 
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset(),
                            key);
                } else {
                    log.error("❌ Error enviando evento Kafka: {}", ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("❌ Excepción enviando a Kafka: {}", e.getMessage(), e);
        }
    }
}
```

**Integrar en PedidoService.java:**
```java
@Service
@RequiredArgsConstructor
public class PedidoService {
    
    private final PedidoRepository pedidoRepository;
    private final RabbitTemplate rabbitTemplate;  // Mantener RabbitMQ
    private final KafkaProducerService kafkaProducerService;  // Nuevo

    public Pedido crear(PedidoRequest request, String userEmail) {
        Pedido pedido = new Pedido();
        // ... (lógica existente)
        
        Pedido saved = pedidoRepository.save(pedido);
        
        // 1. Publicar a RabbitMQ (mantener como estaba)
        rabbitTemplate.convertAndSend("pedidos.exchange", "pedido.creado", saved);
        
        // 2. Publicar a Kafka (nuevo)
        PedidoEventDTO evento = PedidoEventDTO.builder()
                .pedidoId(saved.getId())
                .clienteEmail(saved.getClienteEmail())
                .clienteNombre(saved.getClienteNombre())
                .producto(saved.getProducto())
                .cantidad(saved.getCantidad())
                .total(saved.getTotal())
                .estado(saved.getEstado())
                .timestamp(LocalDateTime.now())
                .eventType("CREATED")
                .build();
        
        kafkaProducerService.enviarEventoPedido(evento);
        
        return saved;
    }
}
```

---

### **FASE 4: CONSUMIDORES KAFKA (4-5 horas)**

#### **4.1 Crear nuevo microservicio: `pedidos360-streaming`**

**Estructura:**
```
pedidos360-streaming/
├── src/main/java/com/example/pedidos360_streaming/
│   ├── Pedidos360StreamingApplication.java
│   ├── config/
│   │   ├── KafkaConsumerConfig.java
│   │   └── SecurityConfig.java
│   ├── consumer/
│   │   ├── PedidosStreamConsumer.java
│   │   └── AnalyticsStreamConsumer.java
│   ├── service/
│   │   ├── StreamProcessingService.java
│   │   └── AnalyticsService.java
│   └── model/
│       ├── PedidoStats.java
│       └── ProductoTrend.java
├── src/main/resources/
│   └── application.yml
└── build.gradle
```

**application.yml:**
```yaml
server:
  port: 8085

spring:
  application:
    name: pedidos360-streaming

  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:19092,localhost:19093,localhost:19094}
    consumer:
      group-id: pedidos360-streaming-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
        enable.auto.commit: false
      enable-auto-commit: false
    listener:
      ack-mode: manual
```

**KafkaConsumerConfig.java:**
```java
package com.example.pedidos360_streaming.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ContainerProperties;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "pedidos360-streaming-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, 
                "org.apache.kafka.common.serialization.StringDeserializer");
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, 
                "org.springframework.kafka.support.serializer.JsonDeserializer");
        props.put("spring.json.trusted.packages", "*");
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
        factory.setConcurrency(3); // 3 consumers (1 por partición)
        return factory;
    }
}
```

**PedidosStreamConsumer.java:**
```java
package com.example.pedidos360_streaming.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PedidosStreamConsumer {

    private final StreamProcessingService streamProcessingService;

    @KafkaListener(
            topics = "pedidos.stream",
            groupId = "pedidos360-streaming-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePedidoStream(
            @Payload Map<String, Object> evento,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("📊 [STREAMING] Recibido evento de pedido: partition={}, offset={}, pedidoId={}", 
                    partition, offset, evento.get("pedidoId"));
            
            // Procesar evento en tiempo real
            streamProcessingService.procesarEventoPedido(evento);
            
            // ACK manual
            acknowledgment.acknowledge();
            log.info("✅ ACK - Evento procesado");
            
        } catch (Exception e) {
            log.error("❌ Error procesando evento: {}", e.getMessage(), e);
            // No hacer ACK - el mensaje se reintentará
        }
    }
}
```

---

### **FASE 5: CREAR 2 TÓPICOS KAFKA (1 hora)**

**Script de inicialización:**

Crear archivo: `init-kafka-topics.sh`

```bash
#!/bin/bash

echo "🚀 Creando tópicos Kafka..."

# Esperar a que Kafka esté listo
sleep 30

# Crear topic 1: pedidos.stream (3 particiones, 3 réplicas)
docker exec kafka-broker-1 kafka-topics \
  --create \
  --topic pedidos.stream \
  --partitions 3 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --bootstrap-server kafka-broker-1:9092

# Crear topic 2: productos.analytics (3 particiones, 3 réplicas)
docker exec kafka-broker-1 kafka-topics \
  --create \
  --topic productos.analytics \
  --partitions 3 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --bootstrap-server kafka-broker-1:9092

echo "✅ Tópicos creados"

# Verificar
docker exec kafka-broker-1 kafka-topics \
  --list \
  --bootstrap-server kafka-broker-1:9092
```

**O usando el microservicio admin (desde PowerShell):**

```powershell
# Crear topic 1
Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics?name=pedidos.stream&partitions=3&replicas=3" -Method POST

# Crear topic 2
Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics?name=productos.analytics&partitions=3&replicas=3" -Method POST

# Listar topics
Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics" -Method GET
```

---

## 📊 VERIFICACIÓN DEL CUMPLIMIENTO

### **EP5 - Checklist:**

- [ ] ✅ Productores Kafka implementados con DTOs (14%)
- [ ] ✅ Consumidores Kafka con @KafkaListener (14%)
- [ ] ✅ Configuración centralizada en application.yml (12%)
- [ ] ✅ Docker Compose con Zookeeper + 3 brokers + Kafka UI (10%)
- [ ] ✅ Microservicio administrador Kafka (10%)
- [ ] ✅ Kafka coexiste con RabbitMQ (10%)
- [ ] ✅ Código compila sin errores (10%)
- [ ] ✅ Frontend actualizado (10%)
- [ ] ✅ JWT validado (5%)
- [ ] ✅ .gitignore correcto (5%)

### **EP6 - Checklist:**

- [ ] ✅ Kafka UI muestra 2 tópicos × 3 particiones × 3 réplicas (15%)
- [ ] ✅ Monitoreo de offsets y lag visible (15%)
- [ ] ✅ Demo de streaming en tiempo real (15%)
- [ ] ✅ Kafka y RabbitMQ funcionando juntos (12%)
- [ ] ✅ Docker Compose levanta clúster Kafka (10%)
- [ ] ✅ Mostrar código productor (10%)
- [ ] ✅ Mostrar código consumidor (10%)
- [ ] ✅ Configuración centralizada (8%)
- [ ] ✅ JWT validado (5%)

---

## 🎬 GUION PARA VIDEO EP6 (PRESENTACIÓN)

### **1. Introducción (30 seg)**
```
"Hola, voy a presentar la implementación de Apache Kafka en Pedidos360.
El sistema ahora tiene streaming de eventos en tiempo real con Kafka,
además de mantener RabbitMQ para notificaciones."
```

### **2. Mostrar Kafka UI (2 min)**
- Abrir: http://localhost:8090
- Ir a **Topics**
- Mostrar `pedidos.stream`:
  - 3 particiones
  - 3 réplicas
  - ISR (In-Sync Replicas)
- Mostrar `productos.analytics`:
  - 3 particiones
  - 3 réplicas

**Decir:**
```
"Aquí vemos Kafka UI con 2 tópicos configurados. Cada uno tiene 3 particiones
para paralelismo y 3 réplicas para alta disponibilidad. Los 3 brokers están
sincronizados (ISR)."
```

### **3. Mostrar Consumer Groups y Offsets (2 min)**
- En Kafka UI, ir a **Consumer Groups**
- Mostrar `pedidos360-streaming-group`
- Ver lag por partición
- Mostrar offset commit

**Decir:**
```
"El consumer group tiene 3 consumidores, uno por partición. El lag muestra
cuántos mensajes están pendientes. Los offsets se commitean manualmente
después de procesar cada mensaje."
```

### **4. Demo en Vivo (3 min)**
- Ir al frontend: https://100.56.50.91
- Crear un pedido
- Volver a Kafka UI
- Refrescar tópico `pedidos.stream`
- Ver el mensaje nuevo en la partición
- Ver que el offset avanzó

**Decir:**
```
"Voy a crear un pedido. El evento se publica a Kafka en el tópico pedidos.stream.
Como pueden ver, el mensaje llegó a la partición 2, el offset avanzó a 47,
y el consumer group ya lo procesó (lag = 0)."
```

### **5. Mostrar Código Productor (1.5 min)**
- Abrir VS Code
- Mostrar `KafkaProducerService.java`
- Destacar:
  - `KafkaTemplate`
  - Serialización JSON
  - Callback con metadata

**Decir:**
```
"El productor usa KafkaTemplate de Spring. Serializa el evento a JSON,
lo envía al tópico y recibe confirmación con la partición y offset asignados."
```

### **6. Mostrar Código Consumidor (1.5 min)**
- Mostrar `PedidosStreamConsumer.java`
- Destacar:
  - `@KafkaListener`
  - ACK manual
  - Manejo de errores

**Decir:**
```
"El consumidor usa @KafkaListener con ACK manual. Procesa el evento y solo
hace acknowledge cuando termina exitosamente. Si falla, el mensaje se reintenta."
```

### **7. Kafka + RabbitMQ Juntos (1 min)**
- Abrir RabbitMQ: http://100.56.50.91:15672
- Mostrar las 9 colas funcionando
- Volver a Kafka UI
- Mostrar ambos corriendo

**Decir:**
```
"RabbitMQ se mantiene para notificaciones, auditoría e inventario.
Kafka se usa para streaming y analítica en tiempo real. Ambos coexisten
sin conflictos."
```

### **8. Cierre (30 seg)**
```
"En resumen, el sistema ahora tiene:
- Kafka con 2 tópicos, 3 particiones y 3 réplicas cada uno
- Productores y consumidores implementados
- Monitoreo de offsets y lag
- Streaming de eventos en tiempo real
- Coexistencia con RabbitMQ

Código en GitHub, sistema funcionando en AWS. Gracias."
```

---

## ⏰ CRONOGRAMA DE IMPLEMENTACIÓN

| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| 1. Infraestructura Kafka (Docker) | 2-3 horas | 🔥 Crítica |
| 2. Microservicio Admin Kafka | 3-4 horas | 🔥 Crítica |
| 3. Productores en Órdenes | 4-5 horas | 🔥 Crítica |
| 4. Consumidores Streaming | 4-5 horas | 🔥 Crítica |
| 5. Crear 2 tópicos | 1 hora | 🔥 Crítica |
| 6. Pruebas integración | 2-3 horas | ⚠️ Alta |
| 7. Actualizar frontend | 2-3 horas | 📝 Media |
| 8. Documentación | 1-2 horas | 📝 Media |
| 9. Video presentación | 2 horas | 🔥 Crítica |

**TOTAL:** ~24-30 horas (3-4 días de trabajo full)

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. ✅ **HOY:** Actualizar `docker-compose.yml` con Kafka
2. ✅ **HOY:** Levantar clúster y verificar en Kafka UI
3. ✅ **MAÑANA:** Crear microservicio admin Kafka
4. ✅ **MAÑANA:** Crear 2 tópicos con script
5. ✅ **DÍA 3:** Implementar productores en Órdenes
6. ✅ **DÍA 3:** Implementar consumidores Streaming
7. ✅ **DÍA 4:** Pruebas completas + video

---

## 📝 NOTAS IMPORTANTES

### **¿Por qué Kafka Y RabbitMQ juntos?**

**RabbitMQ (mantener):**
- ✅ Fire-and-forget (notificaciones)
- ✅ Work queues con ACK/NACK
- ✅ DLQ para errores
- ✅ Perfecto para comandos puntuales

**Kafka (nuevo):**
- ✅ Event streaming (histórico completo)
- ✅ Múltiples consumidores leyendo lo mismo
- ✅ Replay de eventos
- ✅ Perfecto para analítica y auditoría

### **Configuraciones críticas:**

- `acks=all` → Garantiza escritura en todas las réplicas
- `enable.idempotence=true` → Evita duplicados
- `min.insync.replicas=2` → Mínimo 2 réplicas sincronizadas
- `auto.offset.reset=earliest` → Leer desde el inicio
- ACK manual → Control total del procesamiento

---

**¿Listo para empezar? Te recomiendo comenzar con la Fase 1 (Docker Compose).** 🚀

**¿Necesitas que te cree algún archivo específico primero?**
