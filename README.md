# 🛒 Pedidos360

Sistema de gestión de pedidos con arquitectura de microservicios desplegado en AWS con autenticación Azure Entra ID.

## 🌐 Demo en Vivo

**URL:** https://54.145.51.231

## 🏗️ Arquitectura

```
┌─────────────────┐
│  Azure Entra ID │  ← Autenticación JWT
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Frontend │  (Angular + NGINX)
    │   EC2    │
    └────┬─────┘
         │
    ┌────▼──────┐
    │    API    │  (AWS API Gateway)
    │  Gateway  │
    └────┬──────┘
         │
    ┌────▼─────────────────────┐
    │   Microservicios EC2     │
    │  ┌────┐ ┌─────┐ ┌─────┐ │
    │  │BFF │ │Cat. │ │Ord. │ │
    │  └─┬──┘ └──┬──┘ └──┬──┘ │
    │    └───────┴───────┘     │
    │         MariaDB          │
    └──────────────────────────┘
```

## 🔑 Características

- ✅ **Autenticación Azure AD** con JWT
- ✅ **3 Roles de usuario** (Admin, Operador, Cliente)
- ✅ **Microservicios Spring Boot** (BFF, Catálogo, Órdenes)
- ✅ **Frontend Angular 18**
- ✅ **Base de datos persistente** (MariaDB)
- ✅ **100% en la nube** (AWS EC2 + API Gateway)
- ✅ **Extracción de usuario del token** para filtrado por usuario

## 👥 Usuarios de Prueba

| Email | Rol | Password |
|-------|-----|----------|
| admin@nachoduoccl.onmicrosoft.com | Administrador | (Azure) |
| operador@nachoduoccl.onmicrosoft.com | Operador | (Azure) |
| cliente@nachoduoccl.onmicrosoft.com | Cliente | (Azure) |

## 🛠️ Tecnologías

### Backend
- Java 22
- Spring Boot 3.3.4
- Spring Security (OAuth2 Resource Server)
- MariaDB 10.5
- Gradle

### Frontend
- Angular 18
- TypeScript
- Azure MSAL
- Bootstrap

### Infraestructura
- AWS EC2 (Amazon Linux 2023)
- AWS API Gateway
- NGINX con HTTPS
- IP Elástica AWS

## 🚀 Instalación Local

### Requisitos
- Java 22
- Node.js 18+
- Gradle

### Backend

```bash
# Compilar microservicio de Órdenes
cd pedidos360-ordenes
./gradlew build -x test

# Compilar microservicio de Catálogo
cd ../pedidos360-catalogo
./gradlew build -x test

# Compilar BFF
cd ../pedidos360-bff
./gradlew build -x test
```

### Frontend

```bash
cd pedidos360-frontend
npm install
ng serve
```

## 📋 Configuración Azure

### Tenant y Client ID

Configurado en `application.yml` de cada microservicio:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://sts.windows.net/{TENANT_ID}/
          jwk-set-uri: https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys
```

### Extracción de Usuario del Token

El sistema extrae el `preferred_username` del JWT para identificar al usuario:

**Archivo:** `pedidos360-bff/src/main/java/com/example/pedidos360_bff/TokenDebugController.java`

```java
@GetMapping
public ResponseEntity<Map<String, Object>> verTokenPorDentro(@AuthenticationPrincipal Jwt jwt) {
    String correoUsuario = jwt.getClaimAsString("preferred_username");
    // Permite filtrar datos por usuario específico
}
```

**Endpoint de prueba:** https://54.145.51.231/api/debug-token

## 📦 Estructura del Proyecto

```
Pedidos_360/
├── pedidos360-bff/              # Backend For Frontend
├── pedidos360-catalogo/         # Microservicio Catálogo
├── pedidos360-ordenes/          # Microservicio Órdenes
├── pedidos360-frontend/         # Frontend Angular
├── ENTREGA_FINAL.md            # Documentación completa
└── README.md                    # Este archivo
```

## 🔐 Seguridad

- OAuth2 con Azure Entra ID
- JWT para autenticación
- CORS configurado
- HTTPS con certificado SSL
- Roles basados en claims del token

## 🌟 Funcionalidades por Rol

### Administrador
- Gestión completa de pedidos
- Ver todos los pedidos
- Eliminar pedidos
- Cambiar estados

### Operador
- Ver pedidos
- Cambiar estados
- Agregar comentarios

### Cliente
- Ver solo sus propios pedidos
- Crear nuevos pedidos
- Ver estado de sus pedidos

## 🎯 Base de Datos Persistente

El sistema utiliza **MariaDB** (compatible con MySQL) para persistencia de datos:

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/ordenesdb
  driver-class-name: com.mysql.cj.jdbc.Driver
```

Los datos **persisten entre reinicios** del servidor.

## 📊 Endpoints Principales

| Endpoint | Descripción |
|----------|-------------|
| `/api/pedidos` | Gestión de pedidos |
| `/api/catalogo` | Productos disponibles |
| `/api/debug-token` | Debug del JWT (dev) |

## 🚢 Deployment en AWS

### Servicios AWS Utilizados
- **EC2:** Hosting de aplicación
- **API Gateway:** Proxy y routing
- **Elastic IP:** IP permanente
- **Security Groups:** Firewall

### IP y Puertos
- **IP Pública:** 54.145.51.231
- **Frontend:** Puerto 443 (HTTPS)
- **BFF:** Puerto 8080
- **Órdenes:** Puerto 8081
- **Catálogo:** Puerto 8082

## 📝 Licencia

Proyecto académico - Computación en la Nube  
DuocUC - 2026

## 👨‍💻 Autor

Ignacio - [Ignaciogvr](https://github.com/Ignaciogvr)

---

**⭐ Si te gusta el proyecto, dale una estrella!**
