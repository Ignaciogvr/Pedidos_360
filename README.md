# 🚀 Pedidos360

Sistema de gestión de pedidos con arquitectura de microservicios, mensajería asíncrona y monitoreo en tiempo real, desplegado en AWS con autenticación Azure Entra ID.

---

## 🌐 Demo en Vivo

**URL:** https://100.56.50.91  
**IP Elástica AWS:** `100.56.50.91` (permanente)

### 📊 Monitoreo y Administración

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|------------|
| **Frontend** | https://100.56.50.91 | Azure AD | Azure AD |
| **RabbitMQ Management** | http://100.56.50.91:15672 | `guest` | `guest` |
| **Grafana Dashboards** | http://100.56.50.91:3000 | `admin` | `admin` |
| **Prometheus Metrics** | http://100.56.50.91:9090 | - | - |

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
                    │  (NGINX + SSL)   │
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
        └───────────────────┴────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   RabbitMQ     │
                    │  (Mensajería)  │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐      ┌───────▼──────┐    ┌─────▼──────┐
   │Notifica-│      │  Auditoría   │    │ Inventario │
   │ ciones  │      │              │    │            │
   └─────────┘      └──────────────┘    └────────────┘
                            │
                    ┌───────▼────────┐
                    │   Prometheus   │
                    │   + Grafana    │
                    └────────────────┘
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

## 🚀 Instalación y Despliegue

### Requisitos Previos
- **Java 22** instalado
- **Node.js 18+** con npm
- **Gradle** (incluido en wrapper)
- **Docker** y **Docker Compose**

### 1. Clonar Repositorio
```bash
git clone https://github.com/Ignaciogvr/Pedidos_360.git
cd Pedidos_360
git checkout deploy-aws
```

### 2. Levantar Infraestructura Docker
```bash
docker-compose up -d
```

Esto levanta:
- RabbitMQ (puertos 5672, 15672, 15692)
- MySQL (puerto 3306)
- Prometheus (puerto 9090)
- Grafana (puerto 3000)

### 3. Compilar Microservicios

#### BFF
```bash
cd pedidos360-bff
./gradlew build -x test
java -jar build/libs/pedidos360-bff-0.0.1-SNAPSHOT.jar &
```

#### Órdenes
```bash
cd pedidos360-ordenes
./gradlew build -x test
java -jar build/libs/pedidos360-ordenes-0.0.1-SNAPSHOT.jar &
```

#### Catálogo
```bash
cd pedidos360-catalogo
./gradlew build -x test
java -jar build/libs/pedidos360-catalogo-0.0.1-SNAPSHOT.jar &
```

#### Mensajería
```bash
cd pedidos360-mensajeria
./gradlew build -x test
java -jar build/libs/pedidos360-mensajeria-0.0.1-SNAPSHOT.jar &
```

### 4. Compilar y Servir Frontend

#### Desarrollo
```bash
cd pedidos360-frontend
npm install
ng serve
```

#### Producción
```bash
cd pedidos360-frontend
npm install
npm run build
```

Los archivos compilados estarán en `dist/pedidos360-frontend`

---

## 🐳 Iniciar Sistema Completo (Windows PowerShell)

```powershell
# 1. Levantar Docker
docker-compose up -d
Start-Sleep -Seconds 60

# 2. Iniciar microservicios
.\INICIAR_SISTEMA.ps1
```

### Detener Sistema
```powershell
.\DETENER_SISTEMA.ps1
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
| HTTPS (Frontend) | 443 | Público |
| HTTP (Redirect) | 80 | Público |
| BFF | 8080 | Interno |
| Órdenes | 8081 | Interno |
| Catálogo | 8082 | Interno |
| Mensajería | 8083 | Interno |
| MySQL | 3306 | Interno |
| RabbitMQ AMQP | 5672 | Interno |
| RabbitMQ Management | 15672 | Público |
| RabbitMQ Metrics | 15692 | Interno |
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

### ✅ Evaluación 3 - Cloud Deployment
| Criterio | Estado |
|----------|--------|
| Despliegue en AWS EC2 | ✅ |
| IP Elástica permanente | ✅ |
| HTTPS con SSL | ✅ |
| Autenticación Azure Entra ID | ✅ |
| Arquitectura de microservicios | ✅ |
| Persistencia de datos (MySQL) | ✅ |
| Autostart en boot | ✅ |

---

## 🐛 Troubleshooting

### El frontend no carga
```bash
# Verificar que NGINX esté corriendo
sudo systemctl status nginx

# Ver logs de NGINX
sudo tail -f /var/log/nginx/error.log
```

### RabbitMQ no recibe mensajes
```bash
# Verificar conexión
docker logs rabbitmq-pedidos360

# Ver estado de colas
curl -u guest:guest http://100.56.50.91:15672/api/queues
```

### Microservicio no inicia
```bash
# Ver logs del microservicio
tail -f logs/ordenes.log
tail -f logs/catalogo.log
tail -f logs/mensajeria.log

# Verificar puerto disponible
netstat -tuln | grep 8081
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

## 🎯 Última Actualización

**Fecha:** 4 de Noviembre, 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Sistema 100% funcional en producción

**IP AWS:** `100.56.50.91` (Elástica permanente)  
**URL:** https://100.56.50.91
