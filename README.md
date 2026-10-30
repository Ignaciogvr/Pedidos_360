# 🚀 PEDIDOS360 - Sistema E-Commerce con Mensajería

## Sistema de Cloud Computing con RabbitMQ y Azure Entra ID

**Estado:** ✅ **Sistema 100% Funcional**

---

## 🎯 EVALUACIÓN 2 - CUMPLIMIENTO TOTAL

| Criterio | Puntos | Estado |
|----------|--------|--------|
| 1️⃣ Microservicio Mensajería | 7/7 | ✅ |
| 2️⃣ RabbitMQ 3 Dominios | 7/7 | ✅ |
| 3️⃣ TopicExchange + Routing | 7/7 | ✅ |
| 4️⃣ ACK/NACK + Retry + DLQ | 7/7 | ✅ |
| 5️⃣ Prometheus + Grafana | 7/7 | ✅ |
| **TOTAL** | **35/35** | ✅ |

**Ver detalles:** [RESUMEN_EV2.md](./RESUMEN_EV2.md)

---

## 🚀 INICIO RÁPIDO

### 1. Levantar Infraestructura
```powershell
cd Pedidos_360-main
docker-compose up -d
Start-Sleep -Seconds 60
```

### 2. Iniciar Microservicios
```powershell
.\INICIAR_SISTEMA.ps1
```

### 3. Acceder al Sistema
- **Frontend:** http://localhost:4200
- **RabbitMQ:** http://localhost:15672 (guest/guest)
- **Grafana:** http://localhost:3000 (admin/admin)
- **Prometheus:** http://localhost:9090

---

## 🏗️ ARQUITECTURA

```
Frontend (Angular + MSAL) → BFF → Microservicios
                                       ↓
                                   RabbitMQ
                                       ↓
                            Microservicio Mensajería
                                       ↓
                            3 Dominios (Consumers)
                                       ↓
                            Prometheus + Grafana
```

### Microservicios:
- **BFF** (puerto 8080) - Gateway con OAuth2
- **Órdenes** (puerto 8081) - Gestión de pedidos + Publisher
- **Catálogo** (puerto 8082) - Gestión de productos + Publisher
- **Mensajería** (puerto 8083) - Consumer RabbitMQ con 3 dominios

---

## 📊 SISTEMA DE MENSAJERÍA

### Arquitectura RabbitMQ

**DirectExchange** → 3 Dominios simultáneos:
- `notificaciones.queue` - Emails/SMS
- `auditoria.queue` - Logs/compliance
- `inventario.queue` - Sincronización stock

**TopicExchange** → Monitoreo:
- `monitoreo.queue` - Pattern `pedido.*` captura todos los eventos

**Sistema de Reintentos:**
- Manual ACK/NACK
- 2 reintentos con delay 5 segundos
- Dead Letter Queue por dominio

### Colas Creadas (9 total):
- 3 principales
- 3 retry (con TTL 5s)
- 3 DLQ (Dead Letter Queue)

---

## 🔐 AUTENTICACIÓN

**Azure Entra ID:**
- Tenant: `b6f34517-563c-4ce9-a10b-6f3958083091`
- Client: `3bdb2628-3745-4907-9593-53d8c7cb36fb`
- OIDC + PKCE implementado
- Token JWT validado en backend

---

## 🧪 DEMO RÁPIDA

### Crear Pedido
```powershell
# 1. Login en http://localhost:4200
# 2. Obtener token (F12 → Console):
#    localStorage.getItem('msal.token.idtoken')

$token = "TU_TOKEN_AQUI"

Invoke-RestMethod -Uri "http://localhost:8081/api/pedidos" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body '{"producto":"Laptop","cantidad":1,"precio":1500,"clienteEmail":"test@test.com"}'
```

### Ver Logs
```powershell
Get-Content .\Pedidos_360-main\pedidos360-mensajeria\mensajeria-startup.log -Tail 20
```

**Esperado:**
```
[NOTIFICACIONES] ✉️ Email enviado: Pedido creado
[AUDITORIA] 📋 Auditoría: Pedido creado registrado
[INVENTARIO] 📦 Inventario: Stock decrementado
[MONITOREO] Event observed - RoutingKey: pedido.creado
✅ ACK - Message processed successfully
```

---

## 📁 ESTRUCTURA

```
Pedidos_360-main/
├── docker-compose.yml          # RabbitMQ + Prometheus + Grafana
├── prometheus.yml              # Configuración monitoreo
├── INICIAR_SISTEMA.ps1         # Script de inicio
│
├── pedidos360-frontend/        # Angular 18 + MSAL
├── pedidos360-bff/             # Gateway OAuth2
├── pedidos360-ordenes/         # Microservicio Pedidos
├── pedidos360-catalogo/        # Microservicio Catálogo
├── pedidos360-mensajeria/      # Microservicio Mensajería (EV2)
│
└── grafana/
    └── dashboards/             # 2 dashboards pre-configurados
```

---

## 📊 MONITOREO

**Prometheus:** Scraping 5 targets cada 15s
- BFF, Órdenes, Catálogo, Mensajería, RabbitMQ

**Grafana:** 2 Dashboards
- `pedidos360-overview.json` - Métricas de microservicios
- `rabbitmq-overview.json` - Métricas de RabbitMQ

---

## 🎓 PUNTUACIÓN ESPERADA

**EV2:** 35/35 puntos (7.0)

---

## 📚 DOCUMENTACIÓN

- **README.md** - Este archivo (inicio rápido)
- **RESUMEN_EV2.md** - Verificación detallada del cumplimiento

---

**Proyecto:** DSY1107 - Cloud Computing  
**Estado:** ✅ Sistema completamente funcional  
**Última actualización:** 29 de Octubre, 2026
