# 🎯 PLAN EJECUTABLE COMPLETO — KAFKA EN PEDIDOS360
## Basado en Rúbricas Reales + Código del Profesor + Tu Arquitectura Actual

> **Objetivo:** Conseguir 100% en EP5 (12%) + EP6 (18%) = 30% de tu nota final  
> **Estrategia:** Implementación incremental SIN romper RabbitMQ  
> **Tiempo estimado:** 12-15 horas de trabajo efectivo

---

## 📊 ANÁLISIS DE TU SITUACIÓN ACTUAL

### ✅ Lo que YA TIENES (y funciona perfectamente):
```
✅ 4 microservicios Java Spring Boot (BFF, Órdenes, Catálogo, Mensajería)
✅ RabbitMQ con 9 colas (3 dominios: notificaciones, auditoría, inventario)
✅ Azure AD autenticación (JWT validado)
✅ Docker Compose con RabbitMQ, MySQL, Prometheus, Grafana
✅ Frontend Angular 18 desplegado
✅ Sistema funcionando en AWS EC2 (IP 100.56.50.91)
✅ Scripts de inicio automatizados (start-all.sh)
```

### 🎯 Lo que DEBES AGREGAR (según rúbricas exactas):

**EP5 (Encargo - 12%):**
| Criterio | Peso | Qué implementar |
|----------|------|-----------------|
| Configuración cliente Kafka | 12% | application.yml con bootstrap-servers, serializers, consumer groups |
| Productores + Consumidores DTOs | 12% | Clases DTO estructuradas, @KafkaListener |
| Microservicio Admin Kafka | 6% | REST endpoints: crear/listar/eliminar tópicos |
| Productores con serializers | 14% | KafkaTemplate con JsonSerializer |
| Consumidores @KafkaListener | 14% | Separación lógica dominio vs mensajería |
| Manejo errores | 12% | Logging, validación payloads, reintentos |
| Parámetros tópicos | 12% | Retention, cleanup policy, particiones, réplicas |
| Consumer Groups | 12% | Balanceo carga, distribución |
| Admin scripts | 6% | KafkaAdmin + AdminClient |

**EP6 (Presentación - 18%):**
| Criterio | Peso | Qué demostrar |
|----------|------|---------------|
| Docker Compose Kafka | 10% | 3 Zookeeper + 3 brokers funcionando |
| 2 tópicos × 3 particiones × 3 réplicas | 10% | Visible en Kafka UI |
| Kafka UI | 5% | Administración visual |
| Flujo eventos | 12% | Productor → Tópico → Consumidor en tiempo real |
| Diseño eventos | 6% | DTOs estructurados con justificación |
| Reacción tiempo real | 12% | Log < 2 segundos |
| Administración conceptos | 15% | Explicar particiones, réplicas, retention |
| Monitoreo offsets/lag | 15% | Kafka UI mostrando consumer groups |
| Casos de uso streaming | 15% | Por qué Kafka vs RabbitMQ aquí |

---

## 🏗️ ARQUITECTURA PROPUESTA (KAFKA + RABBITMQ)

### **Separación de Responsabilidades:**

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND ANGULAR 18                     │
│                     (Ya funcionando ✅)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │   BFF (8080) — API Gateway  │
         │     (Ya funcionando ✅)      │
         └─────────────┬───────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  ÓRDENES    │ │  CATÁLOGO   │ │ MENSAJERÍA  │
│   (8081)    │ │   (8082)    │ │   (8083)    │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       │               │               │
       ├───────────────┴───────────────┤
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│    RABBITMQ      │          │      KAFKA       │
│  (Ya funciona)   │          │     (NUEVO)      │
├──────────────────┤          ├──────────────────┤
│ • notificaciones │          │ • pedidos.stream │
│ • auditoria      │          │ • productos.     │
│ • inventario     │          │   analytics      │
└──────────────────┘          └──────────────────┘
```

### **¿Cuándo usar RabbitMQ vs Kafka?**

**RabbitMQ (mantener como está):**
- ✉️ Notificaciones (emails/SMS confirmación de pedido)
- 📋 Auditoría (logs de acciones: quién, cuándo, qué)
- 📦 Inventario (sincronización stock entre catálogo y órdenes)

**Kafka (nuevo):**
- 📊 **Streaming de pedidos** en tiempo real (dashboard de ventas en vivo)
- 📈 **Analítica de productos** (top 10 más vendidos, trending)
- 🔔 **Eventos de negocio** (pedido creado, pedido enviado, pedido entregado)
- 💰 **Métricas agregadas** (ventas por hora, ingresos por categoría)

**Por qué esta separación:**
- RabbitMQ: "Fire and forget" → publicar y olvidar → ACK rápido
- Kafka: "Event sourcing" → todos los eventos quedan guardados → múltiples consumers pueden leerlos → replay posible

---

## 📝 PLAN DE IMPLEMENTACIÓN PASO A PASO

### **FASE 0: PREPARACIÓN (30 minutos)**

#### 0.1 Verificar sistema actual
```bash
# Desde EC2 (conectado via SSH)
docker ps
# Deberías ver: rabbitmq, mysql, prometheus, grafana

# Verificar microservicios
ps aux | grep pedidos360
# Deberías ver: BFF (8080), Órdenes (8081), Catálogo (8082), Mensajería (8083)
```

#### 0.2 Crear backup del código actual
```bash
# En tu máquina local
cd c:\Users\nacho\Desktop\evaclion2\Pedidos_360-deploy-aws
git add .
git commit -m "BACKUP: Sistema funcional antes de agregar Kafka"
git push origin main
```

---

### **FASE 1: INFRAESTRUCTURA KAFKA (2 horas)**

#### 1.1 Actualizar docker-compose.yml

**Ubicación:** `c:\Users\nacho\Desktop\evaclion2\Pedidos_360-deploy-aws\docker-compose.yml`

**Agregar al final del archivo (después de Grafana, antes de volumes):**

```yaml
  # ============================================
  #  KAFKA CLUSTER (NUEVO - EP5/EP6)
  # ============================================
  
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
    healthcheck:
      test: ["CMD-SHELL", "echo stat | nc localhost 2181"]
      interval: 10s
      timeout: 5s
      retries: 5

  kafka-broker-1:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker-1
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9092:9092"
      - "19092:19092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://kafka-broker-1:9092,PLAINTEXT_HOST://0.0.0.0:19092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker-1:9092,PLAINTEXT_HOST://localhost:19092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "false"
      KAFKA_LOG_RETENTION_MINUTES: 10080
      KAFKA_LOG_RETENTION_BYTES: 1073741824
      KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
      KAFKA_NUM_NETWORK_THREADS: 8
      KAFKA_NUM_IO_THREADS: 8
    volumes:
      - kafka1_data:/var/lib/kafka/data
    networks:
      - pedidos360-network
    healthcheck:
      test: ["CMD-SHELL", "timeout 2 bash -c '</dev/tcp/localhost/9092' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  kafka-broker-2:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker-2
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9093:9093"
      - "19093:19093"
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://kafka-broker-2:9093,PLAINTEXT_HOST://0.0.0.0:19093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker-2:9093,PLAINTEXT_HOST://localhost:19093
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "false"
      KAFKA_LOG_RETENTION_MINUTES: 10080
      KAFKA_LOG_RETENTION_BYTES: 1073741824
      KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
      KAFKA_NUM_NETWORK_THREADS: 8
      KAFKA_NUM_IO_THREADS: 8
    volumes:
      - kafka2_data:/var/lib/kafka/data
    networks:
      - pedidos360-network
    healthcheck:
      test: ["CMD-SHELL", "timeout 2 bash -c '</dev/tcp/localhost/9093' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  kafka-broker-3:
    image: confluentinc/cp-kafka:7.5.0
    container_name: kafka-broker-3
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9094:9094"
      - "19094:19094"
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENERS: PLAINTEXT://kafka-broker-3:9094,PLAINTEXT_HOST://0.0.0.0:19094
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker-3:9094,PLAINTEXT_HOST://localhost:19094
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_DEFAULT_REPLICATION_FACTOR: 3
      KAFKA_MIN_INSYNC_REPLICAS: 2
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "false"
      KAFKA_LOG_RETENTION_MINUTES: 10080
      KAFKA_LOG_RETENTION_BYTES: 1073741824
      KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
      KAFKA_NUM_NETWORK_THREADS: 8
      KAFKA_NUM_IO_THREADS: 8
    volumes:
      - kafka3_data:/var/lib/kafka/data
    networks:
      - pedidos360-network
    healthcheck:
      test: ["CMD-SHELL", "timeout 2 bash -c '</dev/tcp/localhost/9094' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 20s

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: kafka-ui-pedidos360
    depends_on:
      kafka-broker-1:
        condition: service_healthy
      kafka-broker-2:
        condition: service_healthy
      kafka-broker-3:
        condition: service_healthy
    ports:
      - "8090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: pedidos360-cluster
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka-broker-1:9092,kafka-broker-2:9093,kafka-broker-3:9094
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
      DYNAMIC_CONFIG_ENABLED: 'true'
    networks:
      - pedidos360-network
```

**Agregar al final de la sección volumes:**
```yaml
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

#### 1.2 Subir y probar Kafka en AWS

**Desde tu máquina local:**
```powershell
# Subir docker-compose.yml actualizado
scp -i tu-clave.pem docker-compose.yml ubuntu@100.56.50.91:~/Pedidos_360-main/

# O si usas git (recomendado):
git add docker-compose.yml
git commit -m "feat: Agregar cluster Kafka (3 brokers + Zookeeper + Kafka UI)"
git push origin main
```

**Desde EC2:**
```bash
# Conectar
aws ec2-instance-connect ssh --instance-id i-00287c46080489deb --os-user ubuntu

# Ir al proyecto
cd ~/Pedidos_360-main

# Si usaste git:
git pull origin main

# Levantar Kafka (manteniendo RabbitMQ y MySQL)
docker-compose up -d

# Verificar que todo esté UP
docker ps
# Deberías ver 10 contenedores:
# - rabbitmq-pedidos360
# - mysql-pedidos360
# - prometheus-pedidos360
# - grafana-pedidos360
# - zookeeper-pedidos360
# - kafka-broker-1
# - kafka-broker-2
# - kafka-broker-3
# - kafka-ui-pedidos360

# Ver logs de Kafka
docker logs -f kafka-broker-1
# Esperar a ver: "INFO Kafka version: 7.5.0" y "[KafkaServer id=1] started"
```

#### 1.3 Acceder a Kafka UI

**Desde tu navegador:**
```
http://100.56.50.91:8090
```

Deberías ver:
- **Cluster:** pedidos360-cluster
- **Brokers:** 3 (IDs 1, 2, 3)
- **Topics:** 0 (porque aún no creamos ninguno)

**✅ CHECKPOINT FASE 1:**
- [ ] docker-compose.yml actualizado
- [ ] 10 contenedores corriendo en EC2
- [ ] Kafka UI accesible en puerto 8090
- [ ] RabbitMQ y MySQL siguen funcionando (no se rompió nada)

---

### **FASE 2: MICROSERVICIO ADMINISTRADOR KAFKA (3 horas)**

Este microservicio es **OBLIGATORIO** para EP5 (vale 6% de la rúbrica).

#### 2.1 Crear nuevo microservicio

**Estructura:**
```
pedidos360-kafka-admin/
├── build.gradle
├── settings.gradle
├── gradle.properties
└── src/
    └── main/
        ├── java/com/example/pedidos360_kafka_admin/
        │   ├── Pedidos360KafkaAdminApplication.java
        │   ├── config/
        │   │   ├── KafkaAdminConfig.java
        │   │   └── SecurityConfig.java
        │   ├── controller/
        │   │   ├── TopicController.java
        │   │   └── ConsumerGroupController.java
        │   ├── service/
        │   │   └── KafkaAdminService.java
        │   └── dto/
        │       ├── TopicCreateRequest.java
        │       └── TopicDescriptionDTO.java
        └── resources/
            └── application.yml
```

#### 2.2 Crear archivos base

**`pedidos360-kafka-admin/settings.gradle`:**
```gradle
rootProject.name = 'pedidos360-kafka-admin'
```

**`pedidos360-kafka-admin/gradle.properties`:**
```properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.caching=true
org.gradle.parallel=true
```

**`pedidos360-kafka-admin/build.gradle`:**
```gradle
plugins {
	id 'java'
	id 'org.springframework.boot' version '3.2.0'
	id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
	sourceCompatibility = '17'
}

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-starter-security'
	implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
	implementation 'org.springframework.kafka:spring-kafka'
	implementation 'org.apache.kafka:kafka-clients:3.5.1'
	implementation 'org.springframework.boot:spring-boot-starter-actuator'
	implementation 'io.micrometer:micrometer-registry-prometheus'
	
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.kafka:spring-kafka-test'
	testImplementation 'org.springframework.security:spring-security-test'
}

tasks.named('test') {
	useJUnitPlatform()
}
```

**`pedidos360-kafka-admin/src/main/resources/application.yml`:**
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
        request.timeout.ms: 10000
        connections.max.idle.ms: 300000
    
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

#### 2.3 Código Java

**`Pedidos360KafkaAdminApplication.java`:**
```java
package com.example.pedidos360_kafka_admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Pedidos360KafkaAdminApplication {
	public static void main(String[] args) {
		SpringApplication.run(Pedidos360KafkaAdminApplication.java, args);
	}
}
```

**`config/KafkaAdminConfig.java`:**
```java
package com.example.pedidos360_kafka_admin.config;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
public class KafkaAdminConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public AdminClient kafkaAdminClient() {
        Properties props = new Properties();
        props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 10000);
        props.put(AdminClientConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 300000);
        return AdminClient.create(props);
    }
}
```

**`config/SecurityConfig.java`:**
```java
package com.example.pedidos360_kafka_admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());
        
        return http.build();
    }
}
```

**`dto/TopicCreateRequest.java`:**
```java
package com.example.pedidos360_kafka_admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicCreateRequest {
    private String name;
    private int partitions = 3;
    private short replicas = 3;
    private Long retentionMs = 604800000L; // 7 días por defecto
    private String cleanupPolicy = "delete";
}
```

**`dto/TopicDescriptionDTO.java`:**
```java
package com.example.pedidos360_kafka_admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicDescriptionDTO {
    private String name;
    private int partitions;
    private int replicas;
    private boolean internal;
}
```

**`service/KafkaAdminService.java`:**
```java
package com.example.pedidos360_kafka_admin.service;

import com.example.pedidos360_kafka_admin.dto.TopicCreateRequest;
import com.example.pedidos360_kafka_admin.dto.TopicDescriptionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.config.TopicConfig;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaAdminService {

    private final AdminClient adminClient;

    /**
     * Crear tópico con configuración personalizada
     */
    public void createTopic(TopicCreateRequest request) throws ExecutionException, InterruptedException {
        
        Map<String, String> configs = new HashMap<>();
        configs.put(TopicConfig.RETENTION_MS_CONFIG, request.getRetentionMs().toString());
        configs.put(TopicConfig.CLEANUP_POLICY_CONFIG, request.getCleanupPolicy());
        configs.put(TopicConfig.MIN_IN_SYNC_REPLICAS_CONFIG, "2");
        
        NewTopic topic = new NewTopic(request.getName(), request.getPartitions(), request.getReplicas())
                .configs(configs);
        
        CreateTopicsResult result = adminClient.createTopics(Collections.singleton(topic));
        result.all().get();
        
        log.info("✅ Tópico creado: {} con {} particiones y {} réplicas", 
                request.getName(), request.getPartitions(), request.getReplicas());
    }

    /**
     * Listar todos los tópicos
     */
    public Set<String> listTopics() throws ExecutionException, InterruptedException {
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    /**
     * Describir tópico
     */
    public TopicDescriptionDTO describeTopic(String topicName) 
            throws ExecutionException, InterruptedException {
        
        DescribeTopicsResult result = adminClient.describeTopics(Collections.singleton(topicName));
        TopicDescription desc = result.allTopicNames().get().get(topicName);
        
        return TopicDescriptionDTO.builder()
                .name(desc.name())
                .partitions(desc.partitions().size())
                .replicas(desc.partitions().get(0).replicas().size())
                .internal(desc.isInternal())
                .build();
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
    public List<String> listConsumerGroups() throws ExecutionException, InterruptedException {
        ListConsumerGroupsResult result = adminClient.listConsumerGroups();
        return result.all().get().stream()
                .map(ConsumerGroupListing::groupId)
                .collect(Collectors.toList());
    }

    /**
     * Describir consumer group
     */
    public Map<String, Object> describeConsumerGroup(String groupId) 
            throws ExecutionException, InterruptedException {
        
        DescribeConsumerGroupsResult result = adminClient.describeConsumerGroups(
                Collections.singleton(groupId)
        );
        
        ConsumerGroupDescription desc = result.all().get().get(groupId);
        
        Map<String, Object> info = new HashMap<>();
        info.put("groupId", desc.groupId());
        info.put("state", desc.state().toString());
        info.put("members", desc.members().size());
        info.put("coordinator", desc.coordinator().host());
        
        return info;
    }
}
```

**`controller/TopicController.java`:**
```java
package com.example.pedidos360_kafka_admin.controller;

import com.example.pedidos360_kafka_admin.dto.TopicCreateRequest;
import com.example.pedidos360_kafka_admin.dto.TopicDescriptionDTO;
import com.example.pedidos360_kafka_admin.service.KafkaAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/kafka/topics")
@RequiredArgsConstructor
public class TopicController {

    private final KafkaAdminService kafkaAdminService;

    @PostMapping
    public ResponseEntity<?> createTopic(@RequestBody TopicCreateRequest request) {
        try {
            kafkaAdminService.createTopic(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Tópico creado exitosamente",
                    "topic", request.getName(),
                    "partitions", request.getPartitions(),
                    "replicas", request.getReplicas()
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
    public ResponseEntity<TopicDescriptionDTO> describeTopic(@PathVariable String name) {
        try {
            TopicDescriptionDTO dto = kafkaAdminService.describeTopic(name);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error describiendo tópico: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteTopic(@PathVariable String name) {
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

**`controller/ConsumerGroupController.java`:**
```java
package com.example.pedidos360_kafka_admin.controller;

import com.example.pedidos360_kafka_admin.service.KafkaAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/kafka/consumer-groups")
@RequiredArgsConstructor
public class ConsumerGroupController {

    private final KafkaAdminService kafkaAdminService;

    @GetMapping
    public ResponseEntity<List<String>> listConsumerGroups() {
        try {
            List<String> groups = kafkaAdminService.listConsumerGroups();
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            log.error("Error listando consumer groups: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Map<String, Object>> describeConsumerGroup(@PathVariable String groupId) {
        try {
            Map<String, Object> info = kafkaAdminService.describeConsumerGroup(groupId);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Error describiendo consumer group: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
```

#### 2.4 Compilar y probar localmente

**En tu máquina local:**
```powershell
cd c:\Users\nacho\Desktop\evaclion2\Pedidos_360-deploy-aws\pedidos360-kafka-admin

# Compilar
.\gradlew build

# Ejecutar localmente (asumiendo que tienes Kafka corriendo en localhost)
.\gradlew bootRun

# Deberías ver:
# "Started Pedidos360KafkaAdminApplication in X seconds"
# "Listening on port 8084"
```

**Probar endpoints (desde otra terminal PowerShell):**
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:8084/actuator/health" -Method GET

# Listar tópicos (aún vacío)
Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics" -Method GET
```

**✅ CHECKPOINT FASE 2:**
- [ ] Microservicio compilado sin errores
- [ ] Puerto 8084 levantado
- [ ] Endpoints responden (aunque sin JWT por ahora)

---

### **FASE 3: CREAR TÓPICOS KAFKA (1 hora)**

Ahora crearemos los 2 tópicos requeridos por la rúbrica EP6:
- `pedidos.stream` (3 particiones, 3 réplicas)
- `productos.analytics` (3 particiones, 3 réplicas)

#### 3.1 Usando el microservicio Admin

**Crear tópico 1:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    name = "pedidos.stream"
    partitions = 3
    replicas = 3
    retentionMs = 604800000
    cleanupPolicy = "delete"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Crear tópico 2:**
```powershell
$body = @{
    name = "productos.analytics"
    partitions = 3
    replicas = 3
    retentionMs = 604800000
    cleanupPolicy = "delete"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Verificar:**
```powershell
# Listar tópicos
Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics" -Method GET

# Describir tópico 1
Invoke-RestMethod -Uri "http://localhost:8084/api/kafka/topics/pedidos.stream" -Method GET

# Deberías ver:
# {
#   "name": "pedidos.stream",
#   "partitions": 3,
#   "replicas": 3,
#   "internal": false
# }
```

#### 3.2 Verificar en Kafka UI

**Abrir navegador:**
```
http://100.56.50.91:8090
```

Ir a **Topics** → Deberías ver:

| Topic Name | Partitions | Replication Factor | Retention |
|------------|------------|---------------------|-----------|
| pedidos.stream | 3 | 3 | 7 days |
| productos.analytics | 3 | 3 | 7 days |

**✅ CHECKPOINT FASE 3:**
- [ ] 2 tópicos creados
- [ ] Visible en Kafka UI
- [ ] Cada uno con 3 particiones y 3 réplicas

---

### **FASE 4: PRODUCTORES KAFKA (3 horas)**

Ahora actualizaremos el microservicio `pedidos360-ordenes` para que publique eventos a Kafka (además de RabbitMQ).

#### 4.1 Actualizar build.gradle de pedidos360-ordenes

**Agregar dependencia:**
```gradle
dependencies {
    // ... (dependencias existentes)
    
    // NUEVO: Kafka
    implementation 'org.springframework.kafka:spring-kafka'
}
```

#### 4.2 Actualizar application.yml

**Agregar al final:**
```yaml
spring:
  # ... (configuraciones existentes)
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:19092,localhost:19093,localhost:19094}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
        max.in.flight.requests.per.connection: 5
        compression.type: snappy
```

#### 4.3 Crear configuración Kafka

**Archivo:** `pedidos360-ordenes/src/main/java/com/example/pedidos360_ordenes/config/KafkaProducerConfig.java`

```java
package com.example.pedidos360_ordenes.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

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
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

#### 4.4 Crear DTO para eventos

**Archivo:** `pedidos360-ordenes/src/main/java/com/example/pedidos360_ordenes/dto/PedidoEventDTO.java`

```java
package com.example.pedidos360_ordenes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEventDTO {
    private Long pedidoId;
    private String clienteEmail;
    private String clienteNombre;
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private String estado;
    private String eventType; // "CREATED", "UPDATED", "CANCELLED"
    private LocalDateTime timestamp;
    private String categoria; // Para analítica de productos
}
```

#### 4.5 Crear servicio productor Kafka

**Archivo:** `pedidos360-ordenes/src/main/java/com/example/pedidos360_ordenes/service/KafkaProducerService.java`

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
    private static final String TOPIC_PRODUCTOS_ANALYTICS = "productos.analytics";

    /**
     * Enviar evento de pedido al stream
     */
    public void enviarEventoPedido(PedidoEventDTO evento) {
        try {
            String key = String.valueOf(evento.getPedidoId());
            
            CompletableFuture<SendResult<String, Object>> future = 
                    kafkaTemplate.send(TOPIC_PEDIDOS_STREAM, key, evento);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("✅ [KAFKA] Evento pedido enviado: topic={}, partition={}, offset={}, key={}", 
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset(),
                            key);
                } else {
                    log.error("❌ [KAFKA] Error enviando evento pedido: {}", ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("❌ [KAFKA] Excepción enviando evento: {}", e.getMessage(), e);
        }
    }

    /**
     * Enviar evento de producto para analítica
     */
    public void enviarEventoProducto(PedidoEventDTO evento) {
        try {
            String key = String.valueOf(evento.getProductoId());
            
            CompletableFuture<SendResult<String, Object>> future = 
                    kafkaTemplate.send(TOPIC_PRODUCTOS_ANALYTICS, key, evento);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("✅ [KAFKA] Evento producto enviado: topic={}, partition={}, offset={}, key={}", 
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset(),
                            key);
                } else {
                    log.error("❌ [KAFKA] Error enviando evento producto: {}", ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("❌ [KAFKA] Excepción enviando evento producto: {}", e.getMessage(), e);
        }
    }
}
```

#### 4.6 Integrar en el servicio de pedidos

**Actualizar:** `pedidos360-ordenes/src/main/java/com/example/pedidos360_ordenes/service/PedidoService.java`

**ANTES (solo RabbitMQ):**
```java
@Service
@RequiredArgsConstructor
public class PedidoService {
    
    private final PedidoRepository pedidoRepository;
    private final RabbitTemplate rabbitTemplate;

    public Pedido crearPedido(PedidoRequest request, String userEmail) {
        // ... lógica de creación
        
        Pedido saved = pedidoRepository.save(pedido);
        
        // Publicar a RabbitMQ
        rabbitTemplate.convertAndSend("pedidos.exchange", "pedido.creado", saved);
        
        return saved;
    }
}
```

**DESPUÉS (RabbitMQ + Kafka):**
```java
@Service
@RequiredArgsConstructor
public class PedidoService {
    
    private final PedidoRepository pedidoRepository;
    private final RabbitTemplate rabbitTemplate;  // Mantener
    private final KafkaProducerService kafkaProducerService;  // NUEVO

    public Pedido crearPedido(PedidoRequest request, String userEmail) {
        // ... lógica de creación (igual que antes)
        
        Pedido saved = pedidoRepository.save(pedido);
        
        // 1. Publicar a RabbitMQ (mantener como estaba - para notificaciones)
        rabbitTemplate.convertAndSend("pedidos.exchange", "pedido.creado", saved);
        
        // 2. Publicar a Kafka (NUEVO - para streaming/analítica)
        PedidoEventDTO eventoPedido = PedidoEventDTO.builder()
                .pedidoId(saved.getId())
                .clienteEmail(saved.getClienteEmail())
                .clienteNombre(saved.getClienteNombre())
                .productoId(saved.getProductoId())
                .productoNombre(saved.getProductoNombre())
                .cantidad(saved.getCantidad())
                .precioUnitario(saved.getPrecioUnitario())
                .total(saved.getTotal())
                .estado(saved.getEstado())
                .categoria(saved.getCategoria())
                .eventType("CREATED")
                .timestamp(LocalDateTime.now())
                .build();
        
        kafkaProducerService.enviarEventoPedido(eventoPedido);
        kafkaProducerService.enviarEventoProducto(eventoPedido);
        
        return saved;
    }
}
```

#### 4.7 Compilar y probar

**Compilar:**
```powershell
cd c:\Users\nacho\Desktop\evaclion2\Pedidos_360-deploy-aws\pedidos360-ordenes
.\gradlew build
```

**Ejecutar localmente:**
```powershell
.\gradlew bootRun
```

**Crear un pedido desde Postman/Bruno/curl:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer tu_jwt_token_aqui"
}

$body = @{
    productoId = 1
    productoNombre = "Laptop Dell XPS 15"
    categoria = "Computadores"
    cantidad = 2
    precioUnitario = 1500.00
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8081/api/pedidos" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Ver logs:**
```
✅ [KAFKA] Evento pedido enviado: topic=pedidos.stream, partition=1, offset=0, key=123
✅ [KAFKA] Evento producto enviado: topic=productos.analytics, partition=2, offset=0, key=1
```

**Verificar en Kafka UI:**
```
http://100.56.50.91:8090 → Topics → pedidos.stream → Messages
```

Deberías ver el evento JSON con todos los campos del DTO.

**✅ CHECKPOINT FASE 4:**
- [ ] Productores compilados
- [ ] Eventos llegan a Kafka
- [ ] RabbitMQ sigue funcionando (no se rompió nada)
- [ ] Logs muestran partición y offset

---

### **FASE 5: CONSUMIDORES KAFKA (4 horas)**

Ahora crearemos un nuevo microservicio `pedidos360-streaming` que consume los eventos de Kafka.

#### 5.1 Crear estructura base

**Estructura:**
```
pedidos360-streaming/
├── build.gradle
├── settings.gradle
├── gradle.properties
└── src/
    └── main/
        ├── java/com/example/pedidos360_streaming/
        │   ├── Pedidos360StreamingApplication.java
        │   ├── config/
        │   │   ├── KafkaConsumerConfig.java
        │   │   └── SecurityConfig.java
        │   ├── consumer/
        │   │   ├── PedidosStreamConsumer.java
        │   │   └── ProductosAnalyticsConsumer.java
        │   └── service/
        │       ├── StreamProcessingService.java
        │       └── AnalyticsService.java
        └── resources/
            └── application.yml
```

#### 5.2 Archivos base

**`pedidos360-streaming/settings.gradle`:**
```gradle
rootProject.name = 'pedidos360-streaming'
```

**`pedidos360-streaming/gradle.properties`:**
```properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.caching=true
org.gradle.parallel=true
```

**`pedidos360-streaming/build.gradle`:**
```gradle
plugins {
	id 'java'
	id 'org.springframework.boot' version '3.2.0'
	id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
	sourceCompatibility = '17'
}

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-web'
	implementation 'org.springframework.boot:spring-boot-starter-security'
	implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
	implementation 'org.springframework.kafka:spring-kafka'
	implementation 'org.springframework.boot:spring-boot-starter-actuator'
	implementation 'io.micrometer:micrometer-registry-prometheus'
	
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.kafka:spring-kafka-test'
}

tasks.named('test') {
	useJUnitPlatform()
}
```

**`pedidos360-streaming/src/main/resources/application.yml`:**
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
        max.poll.records: 10
        session.timeout.ms: 30000
        heartbeat.interval.ms: 10000
      enable-auto-commit: false
    listener:
      ack-mode: manual
      concurrency: 3
    
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
    com.example.pedidos360_streaming: DEBUG
    org.apache.kafka: INFO
```

#### 5.3 Código Java

**`Pedidos360StreamingApplication.java`:**
```java
package com.example.pedidos360_streaming;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@EnableKafka
@SpringBootApplication
public class Pedidos360StreamingApplication {
	public static void main(String[] args) {
		SpringApplication.run(Pedidos360StreamingApplication.class, args);
	}
}
```

**`config/KafkaConsumerConfig.java`:**
```java
package com.example.pedidos360_streaming.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.support.serializer.JsonDeserializer;

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
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 10);
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
        props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 10000);
        
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

**`config/SecurityConfig.java`:**
```java
package com.example.pedidos360_streaming.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());
        
        return http.build();
    }
}
```

**`consumer/PedidosStreamConsumer.java`:**
```java
package com.example.pedidos360_streaming.consumer;

import com.example.pedidos360_streaming.service.StreamProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

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
            @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("📊 [STREAMING] Evento recibido: partition={}, offset={}, key={}, pedidoId={}", 
                    partition, offset, key, evento.get("pedidoId"));
            
            // Procesar evento en tiempo real
            streamProcessingService.procesarEventoPedido(evento);
            
            // ACK manual
            acknowledgment.acknowledge();
            log.info("✅ [STREAMING] ACK confirmado - Evento procesado exitosamente");
            
        } catch (Exception e) {
            log.error("❌ [STREAMING] Error procesando evento: {}", e.getMessage(), e);
            // No hacer ACK - el mensaje se reintentará según configuración
        }
    }
}
```

**`consumer/ProductosAnalyticsConsumer.java`:**
```java
package com.example.pedidos360_streaming.consumer;

import com.example.pedidos360_streaming.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductosAnalyticsConsumer {

    private final AnalyticsService analyticsService;

    @KafkaListener(
            topics = "productos.analytics",
            groupId = "pedidos360-streaming-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeProductoAnalytics(
            @Payload Map<String, Object> evento,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("📈 [ANALYTICS] Evento recibido: partition={}, offset={}, key={}, productoId={}", 
                    partition, offset, key, evento.get("productoId"));
            
            // Procesar analítica de producto
            analyticsService.procesarEventoProducto(evento);
            
            // ACK manual
            acknowledgment.acknowledge();
            log.info("✅ [ANALYTICS] ACK confirmado - Analítica actualizada");
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Error procesando analítica: {}", e.getMessage(), e);
            // No hacer ACK - reintento
        }
    }
}
```

**`service/StreamProcessingService.java`:**
```java
package com.example.pedidos360_streaming.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class StreamProcessingService {

    /**
     * Procesar evento de pedido en tiempo real
     */
    public void procesarEventoPedido(Map<String, Object> evento) {
        log.info("🔄 Procesando pedido stream:");
        log.info("   - Pedido ID: {}", evento.get("pedidoId"));
        log.info("   - Cliente: {}", evento.get("clienteNombre"));
        log.info("   - Producto: {}", evento.get("productoNombre"));
        log.info("   - Total: ${}", evento.get("total"));
        log.info("   - Estado: {}", evento.get("estado"));
        log.info("   - Tipo Evento: {}", evento.get("eventType"));
        
        // Aquí puedes agregar lógica de negocio:
        // - Actualizar dashboard en tiempo real
        // - Enviar notificación WebSocket
        // - Detectar patrones de fraude
        // - Calcular métricas en tiempo real
        
        String eventType = (String) evento.get("eventType");
        if ("CREATED".equals(eventType)) {
            log.info("✨ Nuevo pedido detectado - Actualizar dashboard de ventas en vivo");
        }
    }
}
```

**`service/AnalyticsService.java`:**
```java
package com.example.pedidos360_streaming.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class AnalyticsService {

    // Simulación de agregación en memoria (en producción usarías Redis o base de datos)
    private final Map<String, AtomicInteger> productoContador = new ConcurrentHashMap<>();
    private final Map<String, Double> productoIngresos = new ConcurrentHashMap<>();

    /**
     * Procesar analítica de producto
     */
    public void procesarEventoProducto(Map<String, Object> evento) {
        String productoId = String.valueOf(evento.get("productoId"));
        String productoNombre = (String) evento.get("productoNombre");
        Integer cantidad = (Integer) evento.get("cantidad");
        Double total = (Double) evento.get("total");
        String categoria = (String) evento.get("categoria");
        
        log.info("📊 Procesando analítica de producto:");
        log.info("   - Producto: {} (ID: {})", productoNombre, productoId);
        log.info("   - Categoría: {}", categoria);
        log.info("   - Cantidad vendida: {}", cantidad);
        log.info("   - Ingresos: ${}", total);
        
        // Actualizar contadores
        productoContador.computeIfAbsent(productoId, k -> new AtomicInteger(0))
                .addAndGet(cantidad);
        
        productoIngresos.merge(productoId, total, Double::sum);
        
        // Log de agregación
        int totalVendido = productoContador.get(productoId).get();
        double totalIngresos = productoIngresos.get(productoId);
        
        log.info("📈 ACUMULADO - Producto {}: {} unidades vendidas, ${} generados",
                productoNombre, totalVendido, totalIngresos);
        
        // Detectar trending products
        if (totalVendido > 10) {
            log.warn("🔥 TRENDING: {} superó las 10 ventas!", productoNombre);
        }
    }
    
    /**
     * Obtener top productos (para endpoint REST)
     */
    public Map<String, AtomicInteger> getTopProductos() {
        return productoContador;
    }
    
    /**
     * Obtener ingresos por producto (para endpoint REST)
     */
    public Map<String, Double> getIngresosProductos() {
        return productoIngresos;
    }
}
```

#### 5.4 Compilar y probar

**Compilar:**
```powershell
cd c:\Users\nacho\Desktop\evaclion2\Pedidos_360-deploy-aws\pedidos360-streaming
.\gradlew build
```

**Ejecutar:**
```powershell
.\gradlew bootRun
```

**Ver logs (deberías ver):**
```
INFO Started Pedidos360StreamingApplication in X seconds
INFO Kafka consumer started on topics: [pedidos.stream, productos.analytics]
INFO Consumer group: pedidos360-streaming-group
```

**Crear un pedido desde otro microservicio** (desde otra terminal):
```powershell
# El productor (pedidos360-ordenes) enviará evento a Kafka
# Y automáticamente verás en logs del streaming:
📊 [STREAMING] Evento recibido: partition=1, offset=5, key=123, pedidoId=123
🔄 Procesando pedido stream:
   - Pedido ID: 123
   - Cliente: Juan Pérez
   - Producto: Laptop Dell XPS 15
   - Total: $3000.0
✅ [STREAMING] ACK confirmado - Evento procesado exitosamente

📈 [ANALYTICS] Evento recibido: partition=2, offset=3, key=1, productoId=1
📊 Procesando analítica de producto:
   - Producto: Laptop Dell XPS 15 (ID: 1)
   - Cantidad vendida: 2
📈 ACUMULADO - Producto Laptop Dell XPS 15: 15 unidades vendidas, $45000.0 generados
🔥 TRENDING: Laptop Dell XPS 15 superó las 10 ventas!
✅ [ANALYTICS] ACK confirmado - Analítica actualizada
```

**Verificar en Kafka UI:**
```
http://100.56.50.91:8090
→ Consumer Groups
→ pedidos360-streaming-group
```

Deberías ver:
- **Members:** 3 (consumers)
- **Lag:** 0 (si está al día)
- **Partitions:** 6 (3 de pedidos.stream + 3 de productos.analytics)

**✅ CHECKPOINT FASE 5:**
- [ ] Consumidores compilados
- [ ] Eventos llegan y se procesan
- [ ] ACK manual funciona
- [ ] Logs muestran partition, offset, key
- [ ] Consumer group visible en Kafka UI

---

## 📊 MATRIZ DE VERIFICACIÓN EP5 + EP6

### **EP5 (Encargo - 12%):**

| Criterio | Peso | Archivo/Ubicación | ✅ |
|----------|------|-------------------|---|
| Configuración cliente Kafka | 12% | `application.yml` de cada microservicio con bootstrap-servers | [ ] |
| Productores + Consumidores DTOs | 12% | `PedidoEventDTO.java`, `@KafkaListener` | [ ] |
| Microservicio Admin Kafka | 6% | `pedidos360-kafka-admin` completo | [ ] |
| Productores con serializers | 14% | `KafkaProducerConfig.java`, `JsonSerializer` | [ ] |
| Consumidores @KafkaListener | 14% | `PedidosStreamConsumer.java`, `ProductosAnalyticsConsumer.java` | [ ] |
| Manejo errores | 12% | try/catch + logs, ACK manual | [ ] |
| Parámetros tópicos | 12% | retention, cleanup policy, partitions, replicas | [ ] |
| Consumer Groups | 12% | group-id, concurrency: 3 | [ ] |
| Admin scripts | 6% | `KafkaAdminService.java` con AdminClient | [ ] |

### **EP6 (Presentación - 18%):**

| Criterio | Peso | Qué Mostrar | ✅ |
|----------|------|-------------|---|
| Docker Compose Kafka | 10% | `docker-compose.yml` con 3 Zookeeper + 3 brokers | [ ] |
| 2 tópicos × 3 × 3 | 10% | Kafka UI mostrando pedidos.stream y productos.analytics | [ ] |
| Kafka UI | 5% | http://100.56.50.91:8090 funcionando | [ ] |
| Flujo eventos | 12% | Crear pedido → ver logs de productor y consumidor | [ ] |
| Diseño eventos | 6% | Mostrar `PedidoEventDTO.java` con justificación de cada campo | [ ] |
| Reacción tiempo real | 12% | Log < 2 segundos entre publicación y consumo | [ ] |
| Administración conceptos | 15% | Explicar particiones, réplicas, retention, ISR | [ ] |
| Monitoreo offsets/lag | 15% | Kafka UI → Consumer Groups → pedidos360-streaming-group | [ ] |
| Casos de uso streaming | 15% | Explicar por qué Kafka (streaming) vs RabbitMQ (mensajería) | [ ] |

---

## 🎬 GUION PARA VIDEO EP6 (8-10 MINUTOS)

### **1. Introducción (30 seg)**
```
"Hola, voy a presentar la integración de Apache Kafka en Pedidos360.
El sistema ahora tiene streaming de eventos en tiempo real con Kafka,
coexistiendo con RabbitMQ para mensajería tradicional."
```

### **2. Arquitectura General (1 min)**
**Mostrar diagrama o PowerPoint:**
```
"El sistema tiene dos capas de mensajería:
- RabbitMQ: para notificaciones, auditoría e inventario (fire-and-forget)
- Kafka: para streaming, analítica y eventos de negocio (event sourcing)"
```

### **3. Docker Compose Kafka (2 min)**
**Mostrar terminal:**
```bash
docker ps | grep kafka
# Mostrar: zookeeper, kafka-broker-1, 2, 3, kafka-ui

docker logs kafka-broker-1 | tail -20
# Mostrar: "[KafkaServer id=1] started"
```

**Explicar:**
```
"Cluster de 3 brokers + Zookeeper para coordinación.
Factor de replicación 3: si un broker cae, el sistema sigue funcionando."
```

### **4. Kafka UI - Tópicos (2 min)**
**Abrir navegador:** `http://100.56.50.91:8090`

**Ir a Topics → pedidos.stream:**
```
"Tópico pedidos.stream:
- 3 particiones: permite 3 consumers en paralelo
- 3 réplicas: tolerancia a fallos
- Retention: 7 días
- 125 mensajes acumulados (mostrar)"
```

**Ir a Topics → productos.analytics:**
```
"Tópico productos.analytics:
- Misma configuración
- Para analítica agregada de ventas por producto"
```

### **5. Consumer Groups - Monitoreo (1.5 min)**
**Ir a Consumer Groups → pedidos360-streaming-group:**
```
"Consumer group con 3 members activos:
- Lag: 0 (está al día)
- Offset committed: 125 (último mensaje procesado)
- Distribución: cada consumer lee 1 partición"
```

### **6. Demo en Vivo - Flujo Completo (2 min)**
**Terminal 1: Logs del consumidor**
```bash
docker logs -f pedidos360-streaming
```

**Terminal 2: Crear pedido**
```powershell
# Ejecutar API desde Postman/Bruno
POST http://100.56.50.91:8081/api/pedidos
```

**Mostrar logs en tiempo real:**
```
[Productor] ✅ Evento enviado: partition=1, offset=126
[Consumidor] 📊 Evento recibido: partition=1, offset=126
[Consumidor] 🔄 Procesando pedido: Cliente Juan, Producto Laptop, Total $3000
[Consumidor] ✅ ACK confirmado
```

**Cronometrar tiempo:** "Menos de 2 segundos de latencia end-to-end"

### **7. Código Productor (1 min)**
**Mostrar pantalla:**
```java
// PedidoService.java línea 85
kafkaProducerService.enviarEventoPedido(eventoPedido);
```

**Explicar:**
```
"Después de guardar en BD, publicamos a RabbitMQ Y a Kafka.
RabbitMQ: para email de confirmación
Kafka: para dashboard de ventas en tiempo real"
```

### **8. Código Consumidor (1 min)**
**Mostrar pantalla:**
```java
// PedidosStreamConsumer.java
@KafkaListener(topics = "pedidos.stream", groupId = "...")
public void consumePedidoStream(..., Acknowledgment ack) {
    // Procesar
    ack.acknowledge(); // ACK manual
}
```

**Explicar:**
```
"ACK manual: el consumer confirma cuando terminó de procesar.
Si falla, Kafka reintenta automáticamente."
```

### **9. Casos de Uso (1 min)**
```
"¿Por qué Kafka y no solo RabbitMQ?

RabbitMQ:
- 1 consumer lee y el mensaje desaparece
- Perfecto para: enviar email, guardar log

Kafka:
- Múltiples consumers pueden leer el mismo evento
- El evento queda guardado 7 días
- Perfecto para: dashboard en vivo, analítica, audit trail, replay"
```

### **10. Cierre (30 seg)**
```
"Sistema completo integrado:
✅ Kafka + RabbitMQ coexistiendo
✅ 2 tópicos con 3 particiones y 3 réplicas
✅ Producer/Consumer funcionando
✅ Monitoreo de offsets y lag
✅ Streaming en tiempo real < 2 segundos
Gracias."
```

---

## 🚀 DEPLOY A AWS EC2 (COMPLETO)

### Actualizar start-all.sh

**Archivo:** `Pedidos_360-main/start-all.sh`

```bash
#!/bin/bash

echo "🚀 Iniciando Pedidos360 con Kafka..."

# 1. Docker (RabbitMQ, MySQL, Kafka, Prometheus, Grafana)
echo "📦 Iniciando contenedores Docker..."
docker-compose up -d

echo "⏳ Esperando 60 segundos a que Docker esté completamente listo..."
sleep 60

# 2. Kafka Admin (puerto 8084)
echo "🔧 Iniciando Kafka Admin..."
cd ~/Pedidos_360-main/pedidos360-kafka-admin
nohup java -jar build/libs/pedidos360-kafka-admin-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --KAFKA_BOOTSTRAP_SERVERS=localhost:19092,localhost:19093,localhost:19094 \
  > logs/kafka-admin.log 2>&1 &
echo "✅ Kafka Admin iniciado (PID: $!)"
sleep 10

# 3. BFF (puerto 8080)
echo "🌐 Iniciando BFF..."
cd ~/Pedidos_360-main/pedidos360-bff
nohup java -jar build/libs/pedidos360-bff-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  > logs/bff.log 2>&1 &
echo "✅ BFF iniciado (PID: $!)"
sleep 10

# 4. Órdenes (puerto 8081)
echo "📦 Iniciando Órdenes..."
cd ~/Pedidos_360-main/pedidos360-ordenes
nohup java -jar build/libs/pedidos360-ordenes-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --KAFKA_BOOTSTRAP_SERVERS=localhost:19092,localhost:19093,localhost:19094 \
  > logs/ordenes.log 2>&1 &
echo "✅ Órdenes iniciado (PID: $!)"
sleep 10

# 5. Catálogo (puerto 8082)
echo "📚 Iniciando Catálogo..."
cd ~/Pedidos_360-main/pedidos360-catalogo
nohup java -jar build/libs/pedidos360-catalogo-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  > logs/catalogo.log 2>&1 &
echo "✅ Catálogo iniciado (PID: $!)"
sleep 10

# 6. Mensajería (puerto 8083)
echo "✉️ Iniciando Mensajería..."
cd ~/Pedidos_360-main/pedidos360-mensajeria
nohup java -jar build/libs/pedidos360-mensajeria-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  > logs/mensajeria.log 2>&1 &
echo "✅ Mensajería iniciado (PID: $!)"
sleep 10

# 7. Streaming (puerto 8085) - NUEVO
echo "📊 Iniciando Streaming Analytics..."
cd ~/Pedidos_360-main/pedidos360-streaming
nohup java -jar build/libs/pedidos360-streaming-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --KAFKA_BOOTSTRAP_SERVERS=localhost:19092,localhost:19093,localhost:19094 \
  > logs/streaming.log 2>&1 &
echo "✅ Streaming iniciado (PID: $!)"
sleep 10

echo ""
echo "✅ ¡SISTEMA COMPLETAMENTE INICIADO!"
echo ""
echo "📊 URLs disponibles:"
echo "   - Frontend:        http://100.56.50.91"
echo "   - BFF:             http://100.56.50.91:8080"
echo "   - Órdenes:         http://100.56.50.91:8081"
echo "   - Catálogo:        http://100.56.50.91:8082"
echo "   - Mensajería:      http://100.56.50.91:8083"
echo "   - Kafka Admin:     http://100.56.50.91:8084"
echo "   - Streaming:       http://100.56.50.91:8085"
echo "   - RabbitMQ:        http://100.56.50.91:15672"
echo "   - Kafka UI:        http://100.56.50.91:8090"
echo "   - Grafana:         http://100.56.50.91:3000"
echo "   - Prometheus:      http://100.56.50.91:9090"
echo ""
```

---

## 📚 DOCUMENTACIÓN FINAL

Crear archivo: `KAFKA_INTEGRATION_GUIDE.md`

```markdown
# Guía de Integración Kafka - Pedidos360

## Arquitectura

**Kafka Cluster:**
- 3 brokers (IDs: 1, 2, 3)
- 1 Zookeeper
- Factor de replicación: 3
- Min ISR: 2

**Tópicos:**
1. `pedidos.stream` (3 partitions, 3 replicas, retention 7 days)
2. `productos.analytics` (3 partitions, 3 replicas, retention 7 days)

**Microservicios:**
- Kafka Admin (8084): Administración de tópicos
- Órdenes (8081): Productor de eventos
- Streaming (8085): Consumidor de eventos

## Casos de Uso

### RabbitMQ (mantener)
- Notificaciones: emails/SMS confirmación
- Auditoría: logs de acciones
- Inventario: sincronización stock

### Kafka (nuevo)
- Streaming: dashboard ventas en vivo
- Analítica: top productos, trending
- Event sourcing: audit trail completo
- Métricas: ventas por hora/categoría

## Monitoreo

**Kafka UI:** http://100.56.50.91:8090
- Ver tópicos, particiones, réplicas
- Monitorear consumer groups, lag, offsets
- Inspeccionar mensajes

**Prometheus + Grafana:**
- Métricas de Kafka (throughput, latencia)
- Consumer lag alerts
- Broker health

## Troubleshooting

**Ver logs:**
```bash
# Kafka brokers
docker logs kafka-broker-1

# Consumers
tail -f ~/Pedidos_360-main/pedidos360-streaming/logs/streaming.log
```

**Reiniciar cluster:**
```bash
docker-compose restart zookeeper kafka-broker-1 kafka-broker-2 kafka-broker-3
```

**Resetear consumer group:**
```bash
docker exec kafka-broker-1 kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group pedidos360-streaming-group \
  --reset-offsets --to-earliest --execute --all-topics
```
```

---

## ✅ CHECKLIST FINAL ANTES DE ENTREGAR

### Código:
- [ ] Todos los microservicios compilan sin errores
- [ ] Tests pasan (si los hay)
- [ ] Logs NO tienen errores críticos
- [ ] `.gitignore` incluye `.env`, `logs/`, `build/`, `node_modules/`

### Docker:
- [ ] `docker-compose.yml` con 10 contenedores funcionando
- [ ] Healthchecks configurados en Kafka y Zookeeper
- [ ] Volúmenes nombrados para persistencia

### Kafka:
- [ ] 2 tópicos creados con 3 partitions y 3 replicas
- [ ] Kafka UI accesible y mostrando tópicos
- [ ] Consumer group visible con lag = 0

### Microservicios:
- [ ] Kafka Admin responde en puerto 8084
- [ ] Productor en Órdenes publicando eventos
- [ ] Consumidor en Streaming procesando eventos
- [ ] RabbitMQ sigue funcionando (no se rompió)

### Documentación:
- [ ] README.md actualizado con nuevos servicios
- [ ] KAFKA_INTEGRATION_GUIDE.md creado
- [ ] Screenshots de Kafka UI guardados

### Video:
- [ ] Duración 8-10 minutos
- [ ] Muestra código productor y consumidor
- [ ] Demo en vivo funcionando
- [ ] Explica casos de uso Kafka vs RabbitMQ

---

## 🎯 RESULTADO ESPERADO

Al terminar este plan tendrás:

✅ **EP5 (12%):** Código completo con productores, consumidores, administrador, configuraciones, DTOs, manejo de errores  
✅ **EP6 (18%):** Video mostrando Kafka UI, monitoreo, flujo en tiempo real, explicación de conceptos  
✅ **Sistema robusto:** Kafka + RabbitMQ coexistiendo sin conflictos  
✅ **Documentación:** Guías técnicas, diagramas, troubleshooting  
✅ **Nota objetivo:** 7.0 (100% en ambas evaluaciones)

---

## 🆘 SOPORTE

Si algo falla:
1. Revisar logs: `docker logs <container>` y `tail -f logs/*.log`
2. Verificar conectividad: `telnet localhost 19092`
3. Reiniciar servicios individuales: `docker-compose restart <service>`
4. Limpiar y reconstruir: `docker-compose down -v && docker-compose up -d`

---

**¡Éxito con tu evaluación! 🚀**
