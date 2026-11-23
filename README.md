# 🚀 Pedidos360 - Sistema Cloud con Kafka

Sistema de gestión de pedidos desplegado en AWS EC2 con Apache Kafka para streaming de eventos en tiempo real.

**IP AWS:** `100.56.50.91` (elástica permanente)  
**Instancia:** `i-00287c46080489deb` (t2.medium con 4GB SWAP)

---

## ⚡ Inicio Rápido (AWS)

### Iniciar todo
```bash
cd ~/Pedidos_360-main
git pull origin deploy-aws
bash iniciar.sh
```
Espera ~3 minutos. Todo se levanta automáticamente.

### Detener todo
```bash
bash ~/Pedidos_360-main/detener.sh
```

### URLs del Sistema
- **Frontend:** http://100.56.50.91:4200
- **Kafka UI:** http://100.56.50.91:8090
- **RabbitMQ:** http://100.56.50.91:15672 (guest/guest)
- **Grafana:** http://100.56.50.91:3000 (admin/admin)

---

## 📊 Lo que tiene este sistema

- ✅ **6 microservicios Java** (BFF, Órdenes, Catálogo, Mensajería, Kafka Admin, Streaming)
- ✅ **Frontend Angular 18** (puerto 4200)
- ✅ **Apache Kafka** (3 brokers + 2 tópicos con 3 particiones cada uno)
- ✅ **RabbitMQ** (9 colas con retry + DLQ)
- ✅ **MySQL 8.0** (persistencia)
- ✅ **Prometheus + Grafana** (monitoreo)
- ✅ **Azure AD** (autenticación JWT)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure Entra ID                           │
│                    (Autenticación JWT)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │    Frontend      │
                    │  Angular 18      │
                    │    :4200         │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────┐
                    │       BFF         │
                    │  (Gateway OAuth2) │
                    │    Puerto 8080    │
                    └────────┬──────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
   │ Órdenes  │      │  Catálogo   │     │ Mensajería  │
   │   8081   │      │    8082     │     │    8083     │
   └────┬─────┘      └──────┬──────┘     └──────┬──────┘
        │                   │                    │
        ├───────────────────┴────────────────────┤
        │                                        │
        ▼ RabbitMQ                               ▼ Apache Kafka
   ┌─────────────┐                      ┌────────────────┐
   │RabbitMQ     │                      │  Kafka Cluster │
   │(Mensajería) │                      │  3 Brokers     │
   └──────┬──────┘                      └────────┬───────┘
          │                                      │
          ├──────────┬──────────┐               ├─────────────┬──────────┐
          │          │          │               │             │          │
   ┌──────▼──┐ ┌────▼───┐ ┌───▼────┐    ┌─────▼────┐  ┌────▼─────┐    │
   │Notifica-│ │Audito- │ │Inventa-│    │pedidos.  │  │productos.│    │
   │ciones   │ │ría     │ │rio     │    │stream    │  │analytics │    │
   └─────────┘ └────────┘ └────────┘    │(3p,3r)   │  │(3p,3r)   │    │
                                         └──────────┘  └──────────┘    │
                                                │                       │
                                         ┌──────▼───────────────────────▼──┐
                                         │   Streaming Consumer (8085)     │
                                         │   pedidos360-streaming-group    │
                                         └─────────────────────────────────┘
                                                │
                           ┌────────────────────┼────────────────────┐
                           │                    │                    │
                    ┌──────▼──────┐      ┌─────▼──────┐      ┌─────▼──────┐
                    │ Kafka Admin │      │ Prometheus │      │  Kafka UI  │
                    │   :8084     │      │  + Grafana │      │   :8090    │
                    └─────────────┘      └────────────┘      └────────────┘
```

---

## 🔑 Características Principales

### ✅ Autenticación y Seguridad
- **Azure Entra ID** con JWT
- **3 Roles:** Admin, Operador, Cliente
- **HTTPS** con certificado SSL
- **CORS** configurado para producción
- **IP Elástica** permanente en AWS

### ✅ Arquitectura de Microservicios
- **BFF (Backend for Frontend)** - Gateway unificado
- **Servicio de Órdenes** - Gestión de pedidos
- **Servicio de Catálogo** - Gestión de productos
- **Servicio de Mensajería** - Procesamiento asíncrono

### ✅ Mensajería Asíncrona (RabbitMQ)
- **DirectExchange** con 3 dominios simultáneos
- **TopicExchange** para monitoreo
- **ACK/NACK manual** con reintentos
- **Dead Letter Queues** por dominio
- **9 colas** en total (3 principales + 3 retry + 3 DLQ)

### ✅ Streaming de Eventos (Apache Kafka) - **NUEVO EP5/EP6**
- **Cluster de 3 brokers** con Zookeeper
- **2 tópicos con replicación:**
  - `pedidos.stream` (3 particiones, 3 réplicas)
  - `productos.analytics` (3 particiones, 3 réplicas)
- **Kafka Admin API** (puerto 8084) - Gestión de tópicos vía REST
- **Streaming Consumer** (puerto 8085) - Procesamiento en tiempo real
- **Kafka UI** (puerto 8090) - Visualización del cluster
- **Consumer group:** `pedidos360-streaming-group` con ACK manual
- **Idempotencia** y **ACK "all"** en productores

### ✅ Monitoreo en Tiempo Real
- **Prometheus** - Scraping de métricas cada 15s
- **Grafana** - 2 dashboards pre-configurados
- **RabbitMQ Management** - Consola de administración
- **Métricas de negocio** y sistema

### ✅ Persistencia de Datos
- **MySQL 8.0** para datos transaccionales
- **RabbitMQ** con persistencia de mensajes
- **Grafana** con configuración persistente

### ✅ Frontend Moderno
- **Angular 18** con standalone components
- **Dark theme** profesional
- **Responsive design**
- **Autenticación MSAL** (Microsoft)
- **Filtros y búsqueda** en tiempo real

---

## 👥 Usuarios de Prueba

| Email | Rol | Password |
|-------|-----|----------|
| admin@nachoduoccl.onmicrosoft.com | **Administrador** | Sowu362516 |
| operador@nachoduoccl.onmicrosoft.com | **Operador** | Dutu321400 |
| cliente@nachoduoccl.onmicrosoft.com | **Cliente** | Suru269006 |

### Permisos por Rol

**👑 Administrador**
- Gestión completa de pedidos y usuarios
- Ver todos los pedidos del sistema
- Eliminar y modificar pedidos
- Cambiar estados y asignar operadores
- Acceder al panel de usuarios

**🛠️ Operador**
- Ver todos los pedidos
- Cambiar estados de pedidos
- Agregar comentarios administrativos
- Filtrar por estado y cliente

**👤 Cliente**
- Ver solo sus propios pedidos
- Crear nuevos pedidos
- Ver catálogo de productos
- Seguimiento de sus pedidos

---

## 🛠️ Tecnologías

### Backend
- **Java 22**
- **Spring Boot 3.3.4**
- **Spring Security** (OAuth2 Resource Server)
- **Spring AMQP** (RabbitMQ)
- **MySQL 8.0**
- **Gradle**
- **Micrometer** (métricas)

### Frontend
- **Angular 18**
- **TypeScript**
- **Azure MSAL** (autenticación)
- **RxJS**
- **Standalone Components**

### Infraestructura
- **AWS EC2** (Amazon Linux 2023)
- **NGINX** con SSL/TLS
- **IP Elástica AWS** (permanente)
- **Docker Compose**
- **RabbitMQ 3.13**
- **Prometheus** + **Grafana**

---

## 🚀 Cómo usar esto en AWS

### Iniciar todo el sistema
Conecta a EC2 y ejecuta:
```bash
cd ~/Pedidos_360-main
git pull origin deploy-aws
bash iniciar.sh
```

Espera ~3 minutos. El script hace todo automáticamente:
- Configura SWAP (4GB)
- Levanta Docker (MySQL, RabbitMQ, Prometheus, Grafana)
- Levanta Kafka (3 brokers + Zookeeper)
- Crea los tópicos Kafka
- Inicia 6 microservicios Java
- Inicia el frontend Angular

Al final muestra las URLs y verifica que todo esté OK.

### Detener todo
```bash
bash ~/Pedidos_360-main/detener.sh
```

Te pregunta si quieres limpiar los logs. Responde `s` para borrar y liberar espacio.

### Revisar logs si algo falla
```bash
# Ver logs de un servicio específico
tail -f ~/Pedidos_360-main/logs/ordenes.log
tail -f ~/Pedidos_360-main/logs/kafka-admin.log
tail -f ~/Pedidos_360-main/logs/streaming.log

# Ver todos los logs a la vez
tail -f ~/Pedidos_360-main/logs/*.log
```

### Ver qué está corriendo
```bash
# Contenedores Docker
docker ps

# Microservicios Java
ps aux | grep java | grep -v grep

# Espacio en disco
df -h /
```

---

## 📦 Estructura del Proyecto

```
Pedidos_360-deploy-aws/
│
├── docker-compose.yml              # Infraestructura (RabbitMQ, MySQL, Prometheus, Grafana)
├── prometheus.yml                  # Configuración de scraping de métricas
├── INICIAR_SISTEMA.ps1            # Script inicio Windows
├── DETENER_SISTEMA.ps1            # Script detención Windows
│
├── pedidos360-bff/                # Backend For Frontend (Gateway)
│   ├── src/main/java/...
│   └── build.gradle
│
├── pedidos360-ordenes/            # Microservicio de Órdenes
│   ├── src/main/java/...
│   ├── entity/Pedido.java         # Incluye campo direccionEnvio
│   └── build.gradle
│
├── pedidos360-catalogo/           # Microservicio de Catálogo
│   ├── src/main/java/...
│   └── build.gradle
│
├── pedidos360-mensajeria/         # Microservicio de Mensajería (RabbitMQ)
│   ├── src/main/java/...
│   ├── consumer/                  # 3 dominios + monitoreo
│   └── build.gradle
│
├── pedidos360-kafka-admin/       # Microservicio Admin Kafka (EP5)
│   ├── src/main/java/...
│   ├── controller/TopicController.java
│   ├── controller/ConsumerGroupController.java
│   └── build.gradle
│
├── pedidos360-streaming/         # Microservicio Streaming Kafka (EP6)
│   ├── src/main/java/...
│   ├── consumer/PedidosStreamConsumer.java
│   ├── consumer/ProductosAnalyticsConsumer.java
│   └── build.gradle
│
├── pedidos360-frontend/           # Frontend Angular 18
│   ├── src/app/
│   │   ├── app.component.ts       # Navbar mejorado con avatar
│   │   ├── dashboard/             # Dashboard con gráficas
│   │   ├── products/              # Catálogo con filtros y búsqueda
│   │   ├── orders/                # Gestión de pedidos
│   │   ├── admin/users/           # Panel de usuarios
│   │   └── profile/               # Perfil de usuario
│   ├── angular.json
│   └── package.json
│
├── grafana/
│   ├── dashboards/
│   │   ├── pedidos360-overview.json    # Dashboard del sistema
│   │   └── rabbitmq-overview.json      # Dashboard de RabbitMQ
│   └── provisioning/
│
├── init-scripts/                  # Scripts SQL de inicialización
│   ├── 01-init-users.sql
│   └── 02-init-catalogo.sql
│
├── .env.example                   # Variables de entorno (template)
├── DEPLOYMENT_AWS.md              # Guía de despliegue en AWS
├── GUIA_DEPLOYMENT_AWS_AZURE.md   # Guía completa con Azure AD
└── README.md                      # Este archivo
```

---

## 🔐 Configuración Azure Entra ID

### Tenant y Application ID
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://sts.windows.net/b6f34517-563c-4ce9-a10b-6f3958083091/
          jwk-set-uri: https://login.microsoftonline.com/b6f34517-563c-4ce9-a10b-6f3958083091/discovery/v2.0/keys
```

### Extracción de Usuario del Token
El sistema extrae automáticamente el usuario del JWT:

**Archivo:** `pedidos360-bff/.../controller/TokenDebugController.java`

```java
@GetMapping("/api/debug-token")
public ResponseEntity<Map<String, Object>> verToken(@AuthenticationPrincipal Jwt jwt) {
    String email = jwt.getClaimAsString("preferred_username");
    List<String> roles = jwt.getClaimAsStringList("roles");
    // Permite filtrar datos por usuario específico
}
```

**Endpoint de prueba:** https://100.56.50.91/api/debug-token

---

## 🐰 Sistema de Mensajería RabbitMQ

### Arquitectura de Colas

**DirectExchange** (`pedidos.exchange`)
- 3 dominios simultáneos que procesan cada mensaje:
  - `notificaciones.queue` → Envío de emails/SMS
  - `auditoria.queue` → Registro de auditoría
  - `inventario.queue` → Sincronización de stock

**TopicExchange** (`monitoreo.exchange`)
- `monitoreo.queue` → Pattern `pedido.*` captura todos los eventos

### Sistema de Reintentos y DLQ

Cada dominio tiene:
- **Cola principal** → Procesamiento normal
- **Cola retry** → Reintento con TTL 5 segundos (máx 2 reintentos)
- **Cola DLQ** → Mensajes fallidos definitivamente

**Total:** 9 colas (3 × 3)

### Eventos Publicados

| Evento | RoutingKey | Origen |
|--------|------------|--------|
| Pedido creado | `pedido.creado` | Órdenes |
| Pedido actualizado | `pedido.actualizado` | Órdenes |
| Stock bajo | `catalogo.stock.bajo` | Catálogo |
| Producto actualizado | `catalogo.producto.actualizado` | Catálogo |

---

## 📊 Monitoreo y Métricas

### Prometheus
**Targets monitoreados:**
- BFF (8080)
- Órdenes (8081)
- Catálogo (8082)
- Mensajería (8083)
- RabbitMQ (15692)

**Scraping:** Cada 15 segundos

### Grafana Dashboards

**1. Pedidos360 Overview**
- Request rates por microservicio
- Error rates
- Response times
- JVM metrics (heap, threads, GC)

**2. RabbitMQ Overview**
- Queue depths (mensajes pendientes)
- Consumer count
- Message rates (publish/deliver)
- Memory usage

---

## 🎯 Endpoints Principales

### Frontend
| Ruta | Descripción | Requiere Auth |
|------|-------------|---------------|
| `/` | Landing page | ❌ |
| `/dashboard` | Dashboard principal | ✅ |
| `/orders` | Gestión de pedidos | ✅ |
| `/catalog` | Catálogo de productos | ✅ |
| `/admin/users` | Panel de usuarios | ✅ (Admin) |
| `/profile` | Perfil de usuario | ✅ |

### Backend (BFF)
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/pedidos` | GET | Listar pedidos (filtrado por rol) |
| `/api/pedidos` | POST | Crear pedido |
| `/api/pedidos/{id}` | PUT | Actualizar pedido |
| `/api/pedidos/{id}` | DELETE | Eliminar pedido (Admin) |
| `/api/catalogo` | GET | Listar productos |
| `/api/usuarios` | GET | Listar usuarios (Admin) |
| `/api/debug-token` | GET | Inspeccionar JWT (dev) |

---

## 🚢 Deployment en AWS

### Servicios AWS Utilizados
- **EC2** (Amazon Linux 2023) - Hosting
- **Elastic IP** - IP permanente `100.56.50.91`
- **Security Groups** - Firewall
- **NGINX** - Reverse proxy con SSL

### Puertos Configurados
| Servicio | Puerto | Acceso |
|----------|--------|--------|
| Frontend Angular | 4200 | Público |
| BFF | 8080 | Interno |
| Órdenes | 8081 | Interno |
| Catálogo | 8082 | Interno |
| Mensajería | 8083 | Interno |
| **Kafka Admin API** | **8084** | **Público** |
| **Streaming Consumer** | **8085** | **Interno** |
| **Kafka UI** | **8090** | **Público** |
| MySQL | 3306 | Interno |
| RabbitMQ AMQP | 5672 | Interno |
| RabbitMQ Management | 15672 | Público |
| RabbitMQ Metrics | 15692 | Interno |
| **Kafka Broker 1** | **9092 / 19092** | **Interno** |
| **Kafka Broker 2** | **9093 / 19093** | **Interno** |
| **Kafka Broker 3** | **9094 / 19094** | **Interno** |
| **Zookeeper** | **2181** | **Interno** |
| Grafana | 3000 | Público |
| Prometheus | 9090 | Público |

### Autostart en Boot
Sistema configurado con `systemd` para iniciar automáticamente:
```bash
sudo systemctl enable pedidos360
sudo systemctl start pedidos360
```

---

## 🧪 Testing

### Crear un Pedido (curl)
```bash
# 1. Obtener token desde el navegador (F12 → Console)
# localStorage.getItem('msal.token.idtoken')

TOKEN="TU_TOKEN_AQUI"

curl -X POST https://100.56.50.91/api/pedidos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "producto": "Laptop Dell XPS",
    "cantidad": 1,
    "clienteEmail": "admin@nachoduoccl.onmicrosoft.com",
    "clienteNombre": "Admin Pedidos360",
    "direccionEnvio": "Av. Providencia 1234, Santiago",
    "total": 1500.00
  }'
```

### Ver Logs de Mensajería
```bash
# En el servidor AWS
tail -f ~/Pedidos_360-main/logs/mensajeria.log
```

**Salida esperada:**
```
[NOTIFICACIONES] ✉️ Email enviado: Pedido #123 creado
[AUDITORIA] 📋 Auditoría registrada: PEDIDO_CREADO por admin@...
[INVENTARIO] 📦 Stock decrementado: Laptop Dell XPS (-1)
[MONITOREO] 📊 Event observed - RoutingKey: pedido.creado
✅ ACK - Message processed successfully
```

---

## 🎓 Funcionalidades Destacadas

### Frontend
✨ **Navbar con Avatar de Iniciales**
- Extrae iniciales del nombre del usuario
- Badge de rol coloreado (Admin/Operador/Cliente)
- Links activos con indicador visual

✨ **Catálogo de Productos**
- Barra de estadísticas (Total/En Stock/Stock Crítico/Agotados)
- Búsqueda en tiempo real
- Filtros por categoría con iconos
- Placeholders de imagen por tipo de producto
- Badges de stock crítico

✨ **Dashboard con Gráficas**
- Estadísticas generales
- Gráfico de pedidos por estado
- Top 5 productos más vendidos
- Últimos pedidos con acceso rápido

✨ **Gestión de Pedidos**
- Tabla con dirección de envío
- Filtros por estado
- Búsqueda por cliente
- Modal de detalles mejorado

✨ **Panel de Usuarios (Admin)**
- Tarjetas modernas con avatares
- Badges de rol coloreados
- Última sesión visible
- Estadísticas por tipo de usuario

### Backend
✨ **Extracción Automática de Usuario del JWT**
- Filtrado de pedidos por usuario (Clientes ven solo los suyos)
- Asignación automática de cliente al crear pedido
- Logs con usuario que realiza la acción

✨ **Publicación Automática a RabbitMQ**
- Todo cambio en pedidos publica evento
- 3 dominios procesan simultáneamente
- Reintentos automáticos con DLQ

✨ **Métricas de Negocio**
- Contadores de pedidos por estado
- Tiempos de procesamiento
- Tasas de error por dominio

---

## 📝 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

**Principales:**
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=pedidos360
DB_PASSWORD=tu_password

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Azure AD
AZURE_TENANT_ID=b6f34517-563c-4ce9-a10b-6f3958083091
JWT_AUDIENCE=api://3bdb2628-3745-4907-9593-53d8c7cb36fb

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://100.56.50.91
```

---

## 📚 Documentación Adicional

- **[DEPLOYMENT_AWS.md](./DEPLOYMENT_AWS.md)** - Guía detallada de despliegue en AWS
- **[DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md)** - Guía rápida de inicio
- **[GUIA_DEPLOYMENT_AWS_AZURE.md](./GUIA_DEPLOYMENT_AWS_AZURE.md)** - Integración completa AWS + Azure AD
- **[.env.example](./.env.example)** - Template de variables de entorno

---

## 🏆 Cumplimiento de Requerimientos

### ✅ Evaluación 2 - Sistema de Mensajería
| Criterio | Estado |
|----------|--------|
| Microservicio Mensajería independiente | ✅ |
| RabbitMQ con 3 dominios simultáneos | ✅ |
| TopicExchange + DirectExchange | ✅ |
| Manual ACK/NACK con reintentos | ✅ |
| Dead Letter Queues por dominio | ✅ |
| Prometheus + Grafana con dashboards | ✅ |
| Métricas de negocio y sistema | ✅ |

### ✅ Evaluación 3 (EP5 + EP6) - Apache Kafka Streaming
| Criterio | Peso | Estado |
|----------|------|--------|
| **EP5 - Implementación Kafka** | **12%** | |
| Configuración cliente Kafka | 12% | ✅ |
| Productores + Consumidores DTOs | 12% | ✅ |
| Microservicio Admin Kafka (puerto 8084) | 6% | ✅ |
| Productores con serializers JSON | 14% | ✅ |
| Consumidores @KafkaListener | 14% | ✅ |
| Manejo de errores + ACK manual | 12% | ✅ |
| Parámetros tópicos (retention, partitions, replicas) | 12% | ✅ |
| Consumer Groups configurados | 12% | ✅ |
| Admin scripts (KafkaAdminService) | 6% | ✅ |
| **EP6 - Kafka Streaming Demo** | **18%** | |
| Docker Compose Kafka (3 brokers + Zookeeper) | 10% | ✅ |
| 2 tópicos × 3 particiones × 3 réplicas | 10% | ✅ |
| Kafka UI funcionando | 5% | ✅ |
| Flujo producción/consumo eventos | 12% | ✅ |
| Diseño de eventos (DTOs) | 6% | ✅ |
| Sistema reacciona en tiempo real | 12% | ✅ |
| Administración Kafka conceptos | 15% | ✅ |
| Monitoreo offsets/lag | 15% | ✅ |
| Casos de uso streaming | 15% | ✅ |

**Total EP5 + EP6:** 30% de la nota final → **✅ 100% COMPLETADO**

---

## 🐛 Problemas comunes

### Kafka UI no muestra brokers (error 500)
Los datos de Kafka se corrompieron. Borra y reinicia:
```bash
cd ~/Pedidos_360-main
docker compose down
docker volume rm $(docker volume ls -q | grep kafka) 2>/dev/null
docker compose up -d --no-deps zookeeper
sleep 10
docker compose up -d --no-deps kafka-broker-1 kafka-broker-2 kafka-broker-3
sleep 20
# Recrea los tópicos
docker exec kafka-broker-1 kafka-topics --create --if-not-exists \
  --bootstrap-server kafka-broker-1:9092 --topic pedidos.stream \
  --partitions 3 --replication-factor 3
docker exec kafka-broker-1 kafka-topics --create --if-not-exists \
  --bootstrap-server kafka-broker-1:9092 --topic productos.analytics \
  --partitions 3 --replication-factor 3
```

### Disco lleno (95%+)
```bash
# Limpiar logs
> ~/Pedidos_360-main/logs/*.log
rm -rf ~/.gradle/caches

# Ver qué ocupa más espacio
du -sh ~/Pedidos_360-main/* | sort -h
```

### Microservicio no inicia
```bash
# Ver el log específico
tail -f ~/Pedidos_360-main/logs/ordenes.log

# Reiniciar ese servicio solo
pkill -f "pedidos360-ordenes"
cd ~/Pedidos_360-main
nohup java -Xmx256m -jar pedidos360-ordenes/build/libs/*.jar > logs/ordenes.log 2>&1 &
```

### Ver si Kafka responde
```bash
docker exec kafka-broker-1 kafka-topics --list --bootstrap-server kafka-broker-1:9092
```

---

## 👨‍💻 Autor

**Ignacio González**  
Proyecto académico - Computación en la Nube  
DuocUC - 2026

---

## 📄 Licencia

Proyecto académico - Uso educativo

---

## 🔥 Kafka - Flujo de Eventos en Tiempo Real

### 🎯 Separación de Responsabilidades

**RabbitMQ (mantener como estaba):**
- ✉️ **Notificaciones:** Emails/SMS confirmación de pedido (fire-and-forget)
- 📋 **Auditoría:** Logs de acciones (quién, cuándo, qué)
- 📦 **Inventario:** Sincronización de stock

**Apache Kafka (nuevo):**
- 📊 **Streaming de pedidos:** Dashboard de ventas en tiempo real
- 📈 **Analítica de productos:** Top 10 más vendidos, trending
- 🔔 **Event sourcing:** Todos los eventos quedan guardados (7 días)
- 💰 **Métricas agregadas:** Ventas por hora, ingresos por categoría

### 📡 Flujo Completo

```
1. Usuario crea pedido → POST /api/pedidos
                │
2. PedidoService guarda en MySQL
                │
3. Publica a RabbitMQ (email, audit, inventory)
                │
4. KafkaProducerService.enviarEventoPedido()
                │
5. Evento → pedidos.stream (partition X, offset Y)
   Evento → productos.analytics (partition Z, offset W)
                │
6. PedidosStreamConsumer recibe evento (@KafkaListener)
                │
7. StreamProcessingService.procesarEventoPedido()
                │
8. ACK manual → Consumer Group actualiza offset
                │
9. Kafka UI muestra: Message Count incrementado
```

### 📊 Ver en Kafka UI

**URL:** http://100.56.50.91:8090

**Topics:**
- `pedidos.stream` → 3 particiones, 3 réplicas, ISR=3
- `productos.analytics` → 3 particiones, 3 réplicas, ISR=3

**Consumer Groups:**
- `pedidos360-streaming-group` → State: STABLE
- Lag: 0 (al día)
- 6 particiones asignadas

### 🛠️ API Kafka Admin (Puerto 8084)

**Endpoints:**
```bash
# Listar tópicos
GET http://100.56.50.91:8084/api/kafka/topics

# Crear tópico
POST http://100.56.50.91:8084/api/kafka/topics
{
  "name": "nuevo-topic",
  "partitions": 3,
  "replicas": 3,
  "retentionMs": 604800000,
  "cleanupPolicy": "delete"
}

# Describir tópico
GET http://100.56.50.91:8084/api/kafka/topics/pedidos.stream

# Listar consumer groups
GET http://100.56.50.91:8084/api/kafka/consumer-groups
```

---

---

## 📝 Resumen para usar esto

**Para iniciar todo en AWS:**
```bash
cd ~/Pedidos_360-main && git pull origin deploy-aws && bash iniciar.sh
```

**Para detener:**
```bash
bash ~/Pedidos_360-main/detener.sh
```

**URLs importantes:**
- Frontend: http://100.56.50.91:4200
- Kafka UI: http://100.56.50.91:8090
- RabbitMQ: http://100.56.50.91:15672
- Grafana: http://100.56.50.91:3000

**Si algo falla:**
1. Revisa los logs: `tail -f ~/Pedidos_360-main/logs/*.log`
2. Verifica Docker: `docker ps`
3. Verifica Java: `ps aux | grep java`
4. Chequea disco: `df -h /`

---

**Última actualización:** Noviembre 2026  
**IP AWS:** 100.56.50.91 (elástica permanente)  
**Instancia:** i-00287c46080489deb (t2.medium con 4GB SWAP)
