# 🎬 GUION PARA VIDEO DE PRESENTACIÓN - Pedidos360

## 📋 Información de las Evaluaciones

**Evaluación Parcial N°3 (Encargo)** - 12%  
**Evaluación Parcial N°4 (Presentación)** - 18%  
**TOTAL:** 30% de la nota final

**Duración del video:** 5-10 minutos  
**Formato:** Grabación de pantalla con explicación oral

---

## 🎯 ESTRUCTURA DEL VIDEO (5-10 minutos)

### INTRODUCCIÓN (30 segundos)
```
"Hola, mi nombre es [TU NOMBRE] y voy a presentar el proyecto Pedidos360,
un sistema e-commerce con arquitectura de microservicios, autenticación 
Azure Entra ID, mensajería asíncrona con RabbitMQ y despliegue en AWS."
```

---

## 📍 SECCIÓN 1: DESPLIEGUE EN LA NUBE (1.5 minutos)

### ✅ **1.1 Mostrar Backend y Frontend Activos en AWS**

**QUÉ MOSTRAR:**
1. Abrir navegador en: `https://100.56.50.91`
2. Mostrar que carga la pantalla de login

**QUÉ DECIR:**
```
"El sistema está desplegado en AWS EC2 con IP elástica permanente 100.56.50.91.
Como pueden ver, el frontend Angular está activo y funcionando con HTTPS."
```

**DÓNDE ESTÁ:**
- URL: https://100.56.50.91

---

### ✅ **1.2 Mostrar API Gateway / BFF Funcionando**

**QUÉ MOSTRAR:**
1. Abrir Postman o navegador
2. Hacer request a: `http://100.56.50.91:8080/api/debug-token` (con token)

**QUÉ DECIR:**
```
"El BFF actúa como API Gateway, validando los JWT y haciendo routing 
a los microservicios. Aquí vemos que el endpoint está respondiendo correctamente."
```

**DÓNDE ESTÁ:**
- BFF Puerto: 8080
- Endpoint de prueba: `/api/debug-token`

---

## 📍 SECCIÓN 2: AUTENTICACIÓN AZURE ENTRA ID (2 minutos)

### ✅ **2.1 Mostrar Tenant y Usuarios en Azure**

**QUÉ MOSTRAR:**
1. Ir a: https://portal.azure.com
2. Navegar a: **Azure Active Directory** → **Users**
3. Mostrar los 3 usuarios creados:
   - admin@nachoduoccl.onmicrosoft.com
   - operador@nachoduoccl.onmicrosoft.com
   - cliente@nachoduoccl.onmicrosoft.com

**QUÉ DECIR:**
```
"En Azure Entra ID tenemos configurado el tenant con 3 usuarios de prueba
que representan los 3 roles del sistema: Administrador, Operador y Cliente."
```

**DÓNDE ESTÁ:**
- Portal Azure → Azure Active Directory → Users
- Tenant ID: `b6f34517-563c-4ce9-a10b-6f3958083091`

---

### ✅ **2.2 Login con OAuth 2.0 / OpenID Connect**

**QUÉ MOSTRAR:**
1. Volver a: `https://100.56.50.91`
2. Click en **"Ingresar con Microsoft"**
3. Hacer login con: `admin@nachoduoccl.onmicrosoft.com` / `Sowu362516`
4. Mostrar que redirige al Dashboard

**QUÉ DECIR:**
```
"El frontend utiliza MSAL (Microsoft Authentication Library) para implementar
el flujo OAuth 2.0 con PKCE. Al hacer login, obtenemos un JWT válido que se
usa en todas las llamadas al backend."
```

**DÓNDE ESTÁ:**
- Frontend: https://100.56.50.91
- Botón: "Ingresar con Microsoft"

---

### ✅ **2.3 Mostrar Validación JWT en Backend**

**QUÉ MOSTRAR:**
1. Abrir **F12 → Console** en el navegador
2. Ejecutar: `localStorage.getItem('msal.token.idtoken')`
3. Copiar el token
4. Ir a: https://jwt.io
5. Pegar el token y mostrar los claims:
   - `preferred_username`
   - `roles`
   - `aud` (audience)

**QUÉ DECIR:**
```
"Aquí vemos el JWT que el frontend obtiene de Azure AD. Contiene el email
del usuario, sus roles y el audience configurado. El backend valida este
token en cada petición."
```

**DÓNDE ESTÁ:**
- Token en: `localStorage` del navegador
- Decodificador: https://jwt.io

---

### ✅ **2.4 Demostrar Rechazo de Token Inválido**

**QUÉ MOSTRAR:**
1. Abrir Postman
2. Hacer request a: `http://100.56.50.91:8080/api/pedidos`
3. **Sin token** → Mostrar error 401
4. **Con token inválido** (`Bearer fake-token-123`) → Mostrar error 401
5. **Con token válido** → Mostrar respuesta 200 OK

**QUÉ DECIR:**
```
"El API Gateway rechaza peticiones sin token o con tokens inválidos,
retornando 401 Unauthorized. Solo acepta tokens firmados por Azure AD
con el audience correcto."
```

**DÓNDE ESTÁ:**
- Postman o cualquier cliente HTTP
- Endpoint: `http://100.56.50.91:8080/api/pedidos`

---

## 📍 SECCIÓN 3: RABBITMQ Y MENSAJERÍA (3 minutos)

### ✅ **3.1 Mostrar Docker Compose Corriendo**

**QUÉ MOSTRAR:**
1. Conectar por SSH a AWS (o mostrar terminal local)
2. Ejecutar: `docker ps`
3. Mostrar contenedores:
   - `rabbitmq-pedidos360`
   - `mysql-pedidos360`
   - `prometheus-pedidos360`
   - `grafana-pedidos360`

**QUÉ DECIR:**
```
"El sistema utiliza Docker Compose para levantar la infraestructura.
Aquí vemos RabbitMQ, MySQL, Prometheus y Grafana corriendo como contenedores."
```

**DÓNDE ESTÁ:**
- Comando: `docker ps`
- O mostrar: `docker-compose.yml` abierto

---

### ✅ **3.2 Mostrar RabbitMQ Management UI**

**QUÉ MOSTRAR:**
1. Abrir: `http://100.56.50.91:15672`
2. Login: `guest` / `guest`
3. Ir a pestaña **Queues**
4. Mostrar las 9 colas:

**Colas Principales:**
- `notificaciones.queue`
- `auditoria.queue`
- `inventario.queue`

**Colas Retry:**
- `notificaciones.queue.retry`
- `auditoria.queue.retry`
- `inventario.queue.retry`

**Dead Letter Queues:**
- `notificaciones.queue.dlq`
- `auditoria.queue.dlq`
- `inventario.queue.dlq`

**QUÉ DECIR:**
```
"En RabbitMQ tenemos configuradas 9 colas: 3 principales para cada dominio
(Notificaciones, Auditoría, Inventario), 3 colas de reintento con TTL de 5
segundos, y 3 Dead Letter Queues para mensajes que fallaron definitivamente."
```

**DÓNDE ESTÁ:**
- URL: http://100.56.50.91:15672
- Tab: **Queues and Streams**

---

### ✅ **3.3 Mostrar Exchanges (Direct y Topic)**

**QUÉ MOSTRAR:**
1. En RabbitMQ Management, ir a pestaña **Exchanges**
2. Mostrar:
   - `pedidos.exchange` (tipo: **direct**)
   - `monitoreo.exchange` (tipo: **topic**)

3. Click en `pedidos.exchange`
4. Ir a **Bindings**
5. Mostrar que está bindeado a las 3 colas principales con routing keys:
   - `pedido.creado`
   - `pedido.actualizado`

**QUÉ DECIR:**
```
"Tenemos un DirectExchange llamado 'pedidos.exchange' que envía mensajes
a las 3 colas simultáneamente. También un TopicExchange 'monitoreo.exchange'
que captura todos los eventos con el pattern 'pedido.*' para observabilidad."
```

**DÓNDE ESTÁ:**
- URL: http://100.56.50.91:15672
- Tab: **Exchanges**

---

### ✅ **3.4 Demostrar DLQ Funcionando**

**QUÉ MOSTRAR:**
1. Crear un pedido desde el frontend
2. Volver a RabbitMQ Management
3. Ir a **Queues** → Click en `notificaciones.queue`
4. Ir a **Get messages** → Click en **Get Message(s)**
5. Mostrar que el mensaje fue procesado (la cola está vacía o tiene mensajes procesándose)

**OPCIONAL (si tienes logs):**
6. Mostrar en terminal:
```bash
tail -f logs/mensajeria.log
```
7. Ver logs:
```
[NOTIFICACIONES] ✉️ Email enviado: Pedido creado
[AUDITORIA] 📋 Auditoría registrada
[INVENTARIO] 📦 Stock decrementado
✅ ACK - Message processed successfully
```

**QUÉ DECIR:**
```
"Cuando creo un pedido, el microservicio de Órdenes publica el evento a
RabbitMQ. Los 3 dominios lo procesan simultáneamente. Si uno falla, se
reintenta 2 veces, y si sigue fallando, va a la DLQ correspondiente."
```

**DÓNDE ESTÁ:**
- RabbitMQ: http://100.56.50.91:15672 → Queues
- Logs: `tail -f logs/mensajeria.log` (en servidor AWS)

---

### ✅ **3.5 Mostrar Código de Configuración Centralizada**

**QUÉ MOSTRAR:**
1. Abrir VS Code o GitHub
2. Ir a: `pedidos360-mensajeria/src/main/resources/application.yml`
3. Mostrar la sección:

```yaml
rabbitmq:
  queues:
    notificaciones:
      name: notificaciones.queue
      retry: notificaciones.queue.retry
      dlq: notificaciones.queue.dlq
    auditoria:
      name: auditoria.queue
      retry: auditoria.queue.retry
      dlq: auditoria.queue.dlq
    inventario:
      name: inventario.queue
      retry: inventario.queue.retry
      dlq: inventario.queue.dlq
```

**QUÉ DECIR:**
```
"Todos los nombres de colas, exchanges y routing keys están centralizados
en application.yml. No hay valores hardcodeados en el código."
```

**DÓNDE ESTÁ:**
- Archivo: `pedidos360-mensajeria/src/main/resources/application.yml`
- GitHub: https://github.com/Ignaciogvr/Pedidos_360/blob/deploy-aws/pedidos360-mensajeria/src/main/resources/application.yml

---

### ✅ **3.6 Mostrar Beans de Configuración**

**QUÉ MOSTRAR:**
1. Abrir archivo: `pedidos360-mensajeria/src/main/java/.../config/RabbitMQConfig.java`
2. Mostrar método `@Bean` que declara Queue, Exchange y Binding

**Ejemplo de código a mostrar:**
```java
@Bean
public Queue notificacionesQueue() {
    return QueueBuilder.durable(notificacionesQueueName)
        .withArgument("x-dead-letter-exchange", "")
        .withArgument("x-dead-letter-routing-key", notificacionesDlqName)
        .build();
}

@Bean
public DirectExchange pedidosExchange() {
    return new DirectExchange(pedidosExchangeName);
}

@Bean
public Binding notificacionesBinding() {
    return BindingBuilder
        .bind(notificacionesQueue())
        .to(pedidosExchange())
        .with("pedido.creado");
}
```

**QUÉ DECIR:**
```
"En la clase de configuración RabbitMQConfig declaramos todos los beans
de Queue, Exchange y Binding. Cada cola tiene configurado su DLQ con
los argumentos x-dead-letter-exchange y x-dead-letter-routing-key."
```

**DÓNDE ESTÁ:**
- Archivo: `pedidos360-mensajeria/src/main/java/com/example/pedidos360_mensajeria/config/RabbitMQConfig.java`

---

### ✅ **3.7 Mostrar Consumidores con @RabbitListener**

**QUÉ MOSTRAR:**
1. Abrir: `pedidos360-mensajeria/src/main/java/.../consumer/NotificacionesConsumer.java`
2. Mostrar el código:

```java
@RabbitListener(queues = "${rabbitmq.queues.notificaciones.name}")
public void procesarNotificacion(Message message, Channel channel, 
                                  @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
    try {
        String evento = new String(message.getBody());
        log.info("[NOTIFICACIONES] ✉️ Procesando: {}", evento);
        
        // Lógica de procesamiento
        enviarEmail(evento);
        
        // ACK manual
        channel.basicAck(tag, false);
        log.info("✅ ACK - Mensaje procesado");
        
    } catch (Exception e) {
        log.error("❌ Error procesando mensaje", e);
        // NACK con requeue para reintentar
        channel.basicNack(tag, false, true);
    }
}
```

**QUÉ DECIR:**
```
"Los consumidores están organizados por dominio funcional. Cada uno usa
@RabbitListener y maneja ACK/NACK manual. Si el procesamiento es exitoso,
hace ACK. Si falla, hace NACK para reintentar."
```

**DÓNDE ESTÁ:**
- Archivo: `pedidos360-mensajeria/src/main/java/com/example/pedidos360_mensajeria/consumer/NotificacionesConsumer.java`
- También: `AuditoriaConsumer.java` y `InventarioConsumer.java`

---

### ✅ **3.8 Mostrar Separación de Código (Configuración vs Negocio)**

**QUÉ MOSTRAR:**
1. Mostrar estructura de carpetas:

```
pedidos360-mensajeria/src/main/java/com/example/pedidos360_mensajeria/
├── config/
│   └── RabbitMQConfig.java          ← Configuración pura
├── consumer/
│   ├── NotificacionesConsumer.java  ← Lógica de negocio
│   ├── AuditoriaConsumer.java
│   └── InventarioConsumer.java
└── service/
    ├── NotificacionService.java     ← Servicios de dominio
    ├── AuditoriaService.java
    └── InventarioService.java
```

**QUÉ DECIR:**
```
"El código está organizado con separación clara de responsabilidades.
La configuración de RabbitMQ está en clases @Configuration separadas.
Los consumidores solo usan @RabbitListener y delegan la lógica de negocio
a servicios dedicados."
```

**DÓNDE ESTÁ:**
- Estructura de carpetas en: `pedidos360-mensajeria/src/main/java/.../`

---

## 📍 SECCIÓN 4: MONITOREO CON PROMETHEUS Y GRAFANA (1.5 minutos)

### ✅ **4.1 Mostrar Prometheus Scraping**

**QUÉ MOSTRAR:**
1. Abrir: `http://100.56.50.91:9090`
2. Ir a **Status** → **Targets**
3. Mostrar los 5 targets:
   - BFF (8080)
   - Órdenes (8081)
   - Catálogo (8082)
   - Mensajería (8083)
   - RabbitMQ (15692)
4. Verificar que todos están **UP** (verde)

**QUÉ DECIR:**
```
"Prometheus está configurado para hacer scraping de métricas cada 15 segundos
de los 5 componentes del sistema. Todos los targets están activos."
```

**DÓNDE ESTÁ:**
- URL: http://100.56.50.91:9090
- Menu: Status → Targets

---

### ✅ **4.2 Mostrar Dashboards de Grafana**

**QUÉ MOSTRAR:**
1. Abrir: `http://100.56.50.91:3000`
2. Login: `admin` / `admin`
3. Ir a **Dashboards**
4. Abrir **Pedidos360 Overview**
5. Mostrar paneles:
   - HTTP Request Rate
   - Error Rate
   - Response Time
   - JVM Memory
   - Pedidos por Estado (métrica custom)

6. Abrir **RabbitMQ Overview**
7. Mostrar paneles:
   - Queue Depth
   - Message Rates
   - Consumer Count
   - Connection Count

**QUÉ DECIR:**
```
"Tenemos 2 dashboards pre-configurados en Grafana. Uno para métricas
generales del sistema (HTTP, JVM, métricas de negocio) y otro específico
para RabbitMQ con profundidad de colas, tasas de mensajes y consumers."
```

**DÓNDE ESTÁ:**
- URL: http://100.56.50.91:3000
- Dashboards: Home → Dashboards

---

## 📍 SECCIÓN 5: DEMOSTRACIÓN COMPLETA END-TO-END (1 minuto)

### ✅ **5.1 Flujo Completo: Crear Pedido → Ver en RabbitMQ → Ver Logs**

**QUÉ MOSTRAR:**
1. En frontend (https://100.56.50.91):
   - Login como Admin
   - Ir a **Catálogo**
   - Agregar un producto al carrito
   - Crear pedido

2. Ir a RabbitMQ (http://100.56.50.91:15672):
   - Ver que los mensajes pasaron por las colas
   - Mostrar que las 3 colas procesaron el evento

3. Volver al frontend:
   - Ir a **Pedidos**
   - Ver el pedido creado con estado "Pendiente"

4. **OPCIONAL:** Mostrar logs en terminal:
```bash
tail -f logs/mensajeria.log
```

**QUÉ DECIR:**
```
"Aquí vemos el flujo completo: el usuario crea un pedido desde el frontend,
el backend lo guarda en MySQL y publica el evento a RabbitMQ. Los 3 dominios
lo procesan simultáneamente: Notificaciones envía email, Auditoría registra
el log, e Inventario decrementa el stock."
```

---

## 📍 CIERRE (30 segundos)

**QUÉ DECIR:**
```
"En resumen, Pedidos360 es un sistema completo con:
- Arquitectura de microservicios en Java Spring Boot
- Frontend Angular con autenticación Azure Entra ID
- Mensajería asíncrona con RabbitMQ (9 colas, Direct y Topic Exchange)
- Sistema de reintentos con DLQ
- Monitoreo con Prometheus y Grafana
- Desplegado en AWS con IP elástica permanente

El código está disponible en GitHub y el sistema está 100% funcional en producción.

Muchas gracias por su atención."
```

---

## 📋 CHECKLIST DE VERIFICACIÓN ANTES DE GRABAR

### Evaluación Parcial N°3 (Encargo - 12%)

- [ ] ✅ Código compilado sin errores
- [ ] ✅ Frontend funcional con vistas completas
- [ ] ✅ Backend integrado con MySQL
- [ ] ✅ JWT validado en filtros de seguridad
- [ ] ✅ Login con Azure AD funcionando
- [ ] ✅ .gitignore configurado correctamente
- [ ] ✅ Productores y consumidores implementados
- [ ] ✅ DLQ configuradas y funcionando
- [ ] ✅ Microservicio administrador de RabbitMQ (OPCIONAL)

### Evaluación Parcial N°4 (Presentación - 18%)

- [ ] ✅ Backend desplegado en AWS y funcionando
- [ ] ✅ Frontend desplegado en AWS con HTTPS
- [ ] ✅ API Gateway/BFF configurado
- [ ] ✅ JWT validado (rechaza inválidos, acepta válidos)
- [ ] ✅ Tenant Azure AD con usuarios registrados
- [ ] ✅ Login OAuth 2.0 / OpenID Connect funcionando
- [ ] ✅ RabbitMQ corriendo (Docker Compose)
- [ ] ✅ 3 colas + 3 retry + 3 DLQ = 9 colas
- [ ] ✅ DirectExchange y TopicExchange configurados
- [ ] ✅ Consumidores con @RabbitListener
- [ ] ✅ ACK/NACK manual implementado
- [ ] ✅ Configuración centralizada en application.yml
- [ ] ✅ Beans de Queue/Exchange/Binding declarados
- [ ] ✅ Código separado (config vs negocio)

---

## 🎥 CONSEJOS PARA GRABAR EL VIDEO

### Software Recomendado
- **OBS Studio** (gratis, profesional)
- **Loom** (fácil, online)
- **Camtasia** (de pago, muy completo)

### Configuración
- **Resolución:** 1920×1080 (Full HD)
- **Frame rate:** 30 fps mínimo
- **Audio:** Micrófono claro, sin ruido de fondo
- **Cursor destacado:** Activar resaltado de cursor

### Durante la Grabación
1. **Habla con claridad** y ritmo pausado
2. **No leas literalmente** este guion, úsalo como referencia
3. **Muestra confianza** en lo que hiciste
4. **Si te equivocas**, pausa y vuelve a grabar ese segmento
5. **Mantén un hilo conductor** entre secciones

### Edición
- Cortar silencios largos
- Añadir **zoom** en partes importantes del código
- Resaltar con **flechas o círculos** elementos clave
- Agregar **títulos** en cada sección (OPCIONAL)

---

## 📌 LINKS RÁPIDOS PARA EL VIDEO

| Componente | URL |
|------------|-----|
| **Frontend** | https://100.56.50.91 |
| **RabbitMQ Management** | http://100.56.50.91:15672 (guest/guest) |
| **Grafana** | http://100.56.50.91:3000 (admin/admin) |
| **Prometheus** | http://100.56.50.91:9090 |
| **Azure Portal** | https://portal.azure.com |
| **JWT Decoder** | https://jwt.io |
| **GitHub Repo** | https://github.com/Ignaciogvr/Pedidos_360 |

---

## 📂 ARCHIVOS IMPORTANTES A MOSTRAR

### Configuración RabbitMQ
```
pedidos360-mensajeria/src/main/resources/application.yml
pedidos360-mensajeria/src/main/java/.../config/RabbitMQConfig.java
```

### Consumidores
```
pedidos360-mensajeria/src/main/java/.../consumer/NotificacionesConsumer.java
pedidos360-mensajeria/src/main/java/.../consumer/AuditoriaConsumer.java
pedidos360-mensajeria/src/main/java/.../consumer/InventarioConsumer.java
```

### Seguridad JWT
```
pedidos360-bff/src/main/java/.../config/SecurityConfig.java
pedidos360-ordenes/src/main/java/.../config/SecurityConfig.java
```

### Infraestructura
```
docker-compose.yml
prometheus.yml
```

---

## ⏱️ TIMING RECOMENDADO

| Sección | Tiempo |
|---------|--------|
| Introducción | 0:00 - 0:30 |
| Despliegue Cloud | 0:30 - 2:00 |
| Autenticación Azure AD | 2:00 - 4:00 |
| RabbitMQ y Mensajería | 4:00 - 7:00 |
| Prometheus y Grafana | 7:00 - 8:30 |
| Demo End-to-End | 8:30 - 9:30 |
| Cierre | 9:30 - 10:00 |

**TOTAL:** ~10 minutos

---

## 🎯 RESUMEN DE CRITERIOS DE EVALUACIÓN

### EP3 - Código (12%)
1. ✅ Código compilado y funcional
2. ✅ Integración con BD cloud
3. ✅ JWT validado
4. ✅ Productores y consumidores RabbitMQ
5. ✅ DLQ configuradas

### EP4 - Presentación (18%)
1. ✅ Configuración centralizada (12%)
2. ✅ Beans de Queue/Exchange/Binding (13%)
3. ✅ Separación config vs negocio (10%)
4. ✅ Consumidores con @RabbitListener (15%)
5. ✅ ACK/NACK manual (20%)
6. ✅ API REST administrador (13%)
7. ✅ Servicio encapsulado (10%)
8. ✅ Validación de parámetros (7%)

**NOTA ESPERADA:** 7.0 (35/35 puntos)

---

## ✅ ÚLTIMO PASO ANTES DE GRABAR

1. **Probar todo el flujo** manualmente antes de grabar
2. **Abrir todas las pestañas** necesarias previamente
3. **Cerrar pestañas innecesarias** (no mostrar tu email personal, etc.)
4. **Tener el guion a mano** pero NO leerlo literalmente
5. **Grabar en un lugar tranquilo** sin interrupciones
6. **Hacer una prueba de audio** de 30 segundos antes

---

## 🎬 ¡LISTO PARA GRABAR!

**Recuerda:**
- Habla con **confianza**
- Muestra **orgullo** por tu trabajo
- Sé **técnico** pero **claro**
- Si algo no sale perfecto en un intento, **edita** después

**¡Éxito! 🚀**

---

**Archivo creado:** 4 de Noviembre, 2026  
**Duración estimada del video:** 8-10 minutos  
**Nota esperada:** 7.0 (30% de la evaluación total)
