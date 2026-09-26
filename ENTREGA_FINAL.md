# 🎓 PROYECTO PEDIDOS360 - ENTREGA FINAL

## 📌 INFORMACIÓN DEL PROYECTO

**Nombre:** Pedidos360  
**Curso:** Computación en la Nube  
**IP Permanente AWS:** `54.145.51.231` (Elastic IP)  
**Fecha:** Septiembre 2026

---

## 🌐 URLS DE ACCESO

- **Aplicación:** https://54.145.51.231
- **Token Debug:** https://54.145.51.231/api/debug-token
- **API Gateway:** https://6yhwhad3ea.execute-api.us-east-1.amazonaws.com

---

## 👥 USUARIOS DE PRUEBA

| Email | Rol | Funciones |
|-------|-----|-----------|
| admin@nachoduoccl.onmicrosoft.com | Administrador | Gestión completa |
| operador@nachoduoccl.onmicrosoft.com | Operador | Cambiar estados, comentarios |
| cliente@nachoduoccl.onmicrosoft.com | Cliente | Ver y crear pedidos propios |

---

## 🏗️ ARQUITECTURA

### Frontend
- **Tecnología:** Angular 18
- **Ubicación:** EC2 (NGINX con HTTPS)
- **Autenticación:** Azure MSAL

### Backend
- **Tecnología:** Spring Boot 3.3.4 con Java 22
- **Microservicios:**
  1. **BFF** (puerto 8080) - Backend For Frontend
  2. **Catálogo** (puerto 8082) - Gestión de productos
  3. **Órdenes** (puerto 8081) - Gestión de pedidos
- **Ubicación:** EC2 con MariaDB

### Base de Datos
- **Tipo:** MariaDB 10.5 (compatible MySQL)
- **Persistencia:** ✅ Datos persisten entre reinicios
- **Ubicación:** EC2

### Infraestructura AWS
- **EC2:** i-0ceffe4eb31aad74a (Amazon Linux 2023)
- **IP Elástica:** 54.145.51.231 (permanente)
- **API Gateway:** 6yhwhad3ea
- **Security Group:** sg-07a34896b925e81a4

### Autenticación
- **Proveedor:** Azure Entra ID
- **Tenant ID:** b6f34517-563c-4ce9-a10b-6f3958083091
- **Client ID:** 6979a62f-803d-40d1-a7be-75ecd52f12a0
- **Tokens:** JWT con extracción de `preferred_username`

---

## ✅ REQUISITOS CUMPLIDOS

### 1. Configuración Azure (MSAL)
**Ubicación:** `application.yml` en cada microservicio

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://sts.windows.net/b6f34517-563c-4ce9-a10b-6f3958083091/
          jwk-set-uri: https://login.microsoftonline.com/b6f34517-563c-4ce9-a10b-6f3958083091/discovery/v2.0/keys
```

### 2. Extracción de Usuario del Token
**Archivo:** `pedidos360-bff/src/main/java/com/example/pedidos360_bff/TokenDebugController.java`

```java
@GetMapping
public ResponseEntity<Map<String, Object>> verTokenPorDentro(@AuthenticationPrincipal Jwt jwt) {
    // Extraer el usuario del token
    String correoUsuario = jwt.getClaimAsString("preferred_username");
    if (correoUsuario == null) {
        correoUsuario = jwt.getClaimAsString("upn");
    }
    // ... resto del código
}
```

**Propósito:** Permite identificar al usuario específico (Juan, Ana, Pedro) para filtrar sus datos, no solo su rol.

### 3. Base de Datos Persistente
**Configuración:** `application.yml` de Catálogo y Órdenes

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/catalogodb
  driver-class-name: com.mysql.cj.jdbc.Driver
  username: pedidos360
  password: Pedidos360Pass!

jpa:
  hibernate:
    ddl-auto: update  # Persiste datos entre reinicios
```

### 4. Todo en la Nube
- ✅ Frontend: EC2 con NGINX
- ✅ Backend: EC2 con 3 microservicios
- ✅ Base de datos: MariaDB en EC2
- ✅ API Gateway: AWS API Gateway
- ✅ NO hay componentes corriendo en localhost

### 5. Tres Roles Funcionando
- ✅ Administrador: Gestión completa
- ✅ Operador: Cambio de estados
- ✅ Cliente: Visualización de pedidos propios

---

## 🚀 CÓMO EJECUTAR LOCALMENTE (Para desarrollo)

### Requisitos
- Java 22
- Node.js 18+
- Gradle

### Backend
```bash
# Compilar cada microservicio
cd pedidos360-ordenes
gradlew build -x test

cd ../pedidos360-catalogo
gradlew build -x test

cd ../pedidos360-bff
gradlew build -x test
```

### Frontend
```bash
cd pedidos360-frontend
npm install
ng serve
```

---

## 📦 ESTRUCTURA DEL PROYECTO

```
cloud ev1/
├── pedidos360-bff/              # Backend For Frontend
│   └── src/main/
│       ├── java/.../TokenDebugController.java
│       └── resources/application.yml
│
├── pedidos360-catalogo/         # Microservicio Catálogo
│   └── src/main/
│       ├── java/.../ProductoController.java
│       └── resources/application.yml
│
├── pedidos360-ordenes/          # Microservicio Órdenes
│   └── src/main/
│       ├── java/.../PedidosController.java
│       └── resources/application.yml
│
├── pedidos360-frontend/         # Frontend Angular
│   └── src/app/
│       └── app.config.ts
│
├── GUIA_RAPIDA_DEPLOYMENT.txt   # Guía de deployment
├── CHECKLIST_VIDEO.txt          # Checklist para video
├── COMANDOS_RECOMPILAR.bat      # Script recompilación
└── ENTREGA_FINAL.md            # Este documento
```

---

## 🎬 PUNTOS CLAVE PARA EL VIDEO

### 1. Mostrar Configuración Azure
- Abrir `application.yml`
- Mostrar Tenant ID y Client ID
- Explicar que se conecta a Azure Entra ID

### 2. Demostrar Extracción de Token
- Abrir `TokenDebugController.java`
- Señalar línea: `jwt.getClaimAsString("preferred_username")`
- Explicar que extrae el usuario específico del token
- Ir a `https://54.145.51.231/api/debug-token`
- Mostrar el JSON con el usuario extraído

### 3. Probar 3 Roles
- Login como admin
- Mostrar pantalla de administrador
- Logout y login como operador
- Mostrar funciones de operador
- Logout y login como cliente
- Mostrar vista de cliente

### 4. Demostrar Base de Datos Persistente
- Crear un pedido
- Explicar que se guarda en MariaDB
- Mencionar que persiste entre reinicios

### 5. Mostrar que Todo Está en AWS
- Mostrar URL: `https://54.145.51.231`
- Explicar que es IP de EC2 en AWS
- Mencionar que NADA corre en localhost

---

## 🔐 SEGURIDAD

⚠️ **IMPORTANTE:** Este proyecto contiene credenciales de desarrollo.  
**NO subir a repositorios públicos:**
- Keys de AWS
- Passwords de base de datos
- Archivos .pem
- credenciales.txt

---

## 📝 NOTAS ADICIONALES

### IP Elástica
La IP `54.145.51.231` es una Elastic IP de AWS que **nunca cambia**, incluso si se apaga/enciende el EC2.

### Recompilar Después de Cambios
Si modificas el código, usa:
```bash
COMANDOS_RECOMPILAR.bat
```

### Verificar Servicios en EC2
```bash
ssh -i pedidos360-key.pem ec2-user@54.145.51.231
ps aux | grep java
```

---

## ✅ CHECKLIST DE ENTREGA

- [x] Código fuente de 3 microservicios
- [x] Código fuente de frontend Angular
- [x] Aplicación desplegada en AWS
- [x] Base de datos persistente
- [x] Azure Entra ID integrado
- [x] Extracción de usuario del token
- [x] 3 roles funcionando
- [x] Video explicativo (pendiente)
- [x] Documentación completa

---

## 🎓 CONCLUSIÓN

Este proyecto implementa una arquitectura completa de microservicios en AWS con autenticación Azure, demostrando competencias en:
- Computación en la nube (AWS EC2, API Gateway)
- Desarrollo backend (Spring Boot, MariaDB)
- Desarrollo frontend (Angular, MSAL)
- Seguridad (OAuth2, JWT)
- DevOps (deployment en producción)

**Todo funciona 100% en la nube de AWS.**

---

**Fecha de última actualización:** 26 de Septiembre 2026  
**IP Permanente:** 54.145.51.231
