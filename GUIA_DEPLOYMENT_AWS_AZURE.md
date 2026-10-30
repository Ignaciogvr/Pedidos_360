# 🚀 GUÍA DE DEPLOYMENT - AWS Y AZURE

## 📋 ESTADO ACTUAL

✅ Sistema funcionando localmente:
- ✅ Docker (RabbitMQ, MySQL, Prometheus, Grafana)
- ✅ Microservicio Mensajería (puerto 8083)
- ⏳ Pendiente: BFF, Órdenes, Catálogo, Frontend

---

## 🔐 PASO 1: AZURE ENTRA ID (Autenticación)

### ✅ YA CONFIGURADO

Tu aplicación Azure ya está registrada:
- **Tenant ID:** `b6f34517-563c-4ce9-a10b-6f3958083091`
- **Client ID:** `3bdb2628-3745-4907-9593-53d8c7cb36fb`
- **Redirect URIs:** Ya configuradas para localhost

### 🔄 AGREGAR REDIRECT URI DE PRODUCCIÓN

1. Ve a [Azure Portal](https://portal.azure.com)
2. **Azure Entra ID** → **App registrations**
3. Busca tu app: `Pedidos360`
4. **Authentication** → **Add a platform** → **Single-page application**
5. Agregar Redirect URIs:
   ```
   http://<TU-IP-AWS>:4200
   http://<TU-IP-AWS>:4200/
   ```
6. **Save**

### ✅ NO TOCAR:
- Scopes (`access_as_user`)
- API permissions
- Token configuration

---

## ☁️ PASO 2: AWS EC2 (Servidor)

### A. Crear/Conectar a EC2

```bash
# Conectar por SSH
ssh -i "tu-key.pem" ec2-user@<TU-IP-AWS>
```

### B. Instalar Dependencias

```bash
# Actualizar sistema
sudo yum update -y

# Instalar Docker
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Java 17
sudo yum install java-17-amazon-corretto -y

# Instalar Node.js
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install nodejs -y

# Instalar Git
sudo yum install git -y
```

### C. Configurar Security Group

En AWS Console → EC2 → Security Groups:

| Puerto | Protocolo | Descripción |
|--------|-----------|-------------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 4200 | TCP | Angular Frontend |
| 8080 | TCP | BFF |
| 8081 | TCP | Órdenes |
| 8082 | TCP | Catálogo |
| 8083 | TCP | Mensajería |
| 3000 | TCP | Grafana |
| 9090 | TCP | Prometheus |
| 15672 | TCP | RabbitMQ Management |
| 5672 | TCP | RabbitMQ AMQP |

---

## 📦 PASO 3: SUBIR CÓDIGO A AWS

### Opción A: Git (Recomendado)

```bash
# En AWS EC2
cd ~
git clone <TU-REPO-URL>
cd Pedidos_360-main
```

### Opción B: SCP desde Local

```powershell
# Desde tu máquina local
scp -i "tu-key.pem" -r c:\Users\nacho\Desktop\cloud\Pedidos_360-main ec2-user@<TU-IP-AWS>:~/
```

---

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

### En AWS EC2:

```bash
cd ~/Pedidos_360-main

# Crear archivo .env
nano .env
```

**Contenido del .env:**
```bash
# Database
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=pedidos360
DB_USERNAME=pedidos360
DB_PASSWORD=Pedidos360Pass!

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

# Grafana
GRAFANA_USER=admin
GRAFANA_PASS=admin

# Azure (Ya configurado en código)
AZURE_TENANT_ID=b6f34517-563c-4ce9-a10b-6f3958083091
AZURE_CLIENT_ID=3bdb2628-3745-4907-9593-53d8c7cb36fb
```

---

## 🚀 PASO 5: INICIAR SISTEMA EN AWS

### A. Levantar Docker

```bash
cd ~/Pedidos_360-main
docker-compose up -d

# Esperar 60 segundos
sleep 60

# Verificar
docker ps
```

### B. Compilar Microservicios

```bash
# BFF
cd ~/Pedidos_360-main/pedidos360-bff
./gradlew build -x test

# Órdenes
cd ~/Pedidos_360-main/pedidos360-ordenes
./gradlew build -x test

# Catálogo
cd ~/Pedidos_360-main/pedidos360-catalogo
./gradlew build -x test

# Mensajería
cd ~/Pedidos_360-main/pedidos360-mensajeria
./gradlew build -x test
```

### C. Iniciar Microservicios con Screen (para que sigan corriendo)

```bash
# BFF
cd ~/Pedidos_360-main/pedidos360-bff
screen -dmS bff bash -c './gradlew bootRun'

# Órdenes
cd ~/Pedidos_360-main/pedidos360-ordenes
screen -dmS ordenes bash -c './gradlew bootRun'

# Catálogo
cd ~/Pedidos_360-main/pedidos360-catalogo
screen -dmS catalogo bash -c './gradlew bootRun'

# Mensajería
cd ~/Pedidos_360-main/pedidos360-mensajeria
screen -dmS mensajeria bash -c './gradlew bootRun'
```

### D. Compilar e Iniciar Frontend

```bash
cd ~/Pedidos_360-main/pedidos360-frontend

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Servir con http-server
npm install -g http-server
cd dist/pedidos360-frontend/browser
http-server -p 4200 &
```

---

## 🔍 PASO 6: VERIFICAR DEPLOYMENT

### URLs de Producción:

Reemplaza `<TU-IP-AWS>` con tu Elastic IP:

```
Frontend:    http://<TU-IP-AWS>:4200
BFF:         http://<TU-IP-AWS>:8080/actuator/health
Órdenes:     http://<TU-IP-AWS>:8081/actuator/health
Catálogo:    http://<TU-IP-AWS>:8082/actuator/health
Mensajería:  http://<TU-IP-AWS>:8083/actuator/health

RabbitMQ:    http://<TU-IP-AWS>:15672
Prometheus:  http://<TU-IP-AWS>:9090
Grafana:     http://<TU-IP-AWS>:3000
```

### Verificar Logs:

```bash
# Ver logs de microservicios
screen -r bff        # Ctrl+A, D para salir
screen -r ordenes
screen -r catalogo
screen -r mensajeria

# Ver logs de Docker
docker logs rabbitmq-pedidos360
docker logs mysql-pedidos360
```

---

## 📝 PASO 7: ACTUALIZAR FRONTEND PARA PRODUCCIÓN

### Modificar `app.config.ts`:

En AWS, editar el archivo:
```bash
nano ~/Pedidos_360-main/pedidos360-frontend/src/app/app.config.ts
```

**Cambiar las URLs de los microservicios:**
```typescript
export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map([
    ['http://<TU-IP-AWS>:8080/api/*', [
      'api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user'
    ]],
    ['http://<TU-IP-AWS>:8081/api/*', [
      'api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user'
    ]],
    ['http://<TU-IP-AWS>:8082/api/*', [
      'api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user'
    ]],
    ['http://<TU-IP-AWS>:8083/api/*', [
      'api://3bdb2628-3745-4907-9593-53d8c7cb36fb/access_as_user'
    ]]
  ])
};
```

**Recompilar:**
```bash
cd ~/Pedidos_360-main/pedidos360-frontend
npm run build
```

---

## 🔧 PASO 8: MANTENER SERVICIOS CORRIENDO

### Opción A: Screen (Ya hecho arriba)

Ver procesos:
```bash
screen -ls
```

### Opción B: Systemd (Más robusto)

Crear servicios systemd para cada microservicio:

```bash
sudo nano /etc/systemd/system/pedidos360-bff.service
```

**Contenido:**
```ini
[Unit]
Description=Pedidos360 BFF
After=docker.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/Pedidos_360-main/pedidos360-bff
ExecStart=/home/ec2-user/Pedidos_360-main/pedidos360-bff/gradlew bootRun
Restart=always

[Install]
WantedBy=multi-user.target
```

Repetir para cada microservicio, luego:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pedidos360-bff
sudo systemctl start pedidos360-bff
sudo systemctl status pedidos360-bff
```

---

## 🧪 PASO 9: PROBAR EL SISTEMA

### Test Completo:

1. **Abrir Frontend:** `http://<TU-IP-AWS>:4200`
2. **Login con Microsoft** (Azure Entra ID)
3. **Crear un pedido**
4. **Verificar RabbitMQ:** `http://<TU-IP-AWS>:15672`
   - Ver que las 9 queues están creadas
   - Ver mensajes procesándose
5. **Ver Grafana:** `http://<TU-IP-AWS>:3000`
   - Dashboards con métricas en tiempo real

---

## 📊 PASO 10: ENTREGA EV2

### Información para el Profesor:

**URLs de Acceso:**
```
Frontend:    http://<TU-IP-AWS>:4200
RabbitMQ:    http://<TU-IP-AWS>:15672 (guest/guest)
Grafana:     http://<TU-IP-AWS>:3000 (admin/admin)
Prometheus:  http://<TU-IP-AWS>:9090
```

**Credenciales Microsoft:**
- Usuario: `<tu-email-microsoft>`
- Password: `<tu-password>`

**Demo en Vivo:**
1. Login en frontend
2. Crear pedido
3. Mostrar logs de mensajería procesando en 3 dominios
4. Mostrar RabbitMQ Management UI con queues
5. Mostrar Grafana con métricas en tiempo real

---

## ❌ TROUBLESHOOTING

### Docker no inicia:
```bash
sudo service docker start
docker ps
```

### Microservicio no inicia:
```bash
# Ver logs
screen -r <nombre>

# Ver puerto ocupado
sudo netstat -tulpn | grep 808
```

### RabbitMQ no crea queues:
```bash
# Reiniciar mensajería
screen -X -S mensajeria quit
cd ~/Pedidos_360-main/pedidos360-mensajeria
screen -dmS mensajeria bash -c './gradlew bootRun'
```

### Frontend no conecta:
- Verificar que las URLs en `app.config.ts` tengan la IP correcta
- Verificar Security Group en AWS
- Verificar CORS en backend

---

## 📦 RESUMEN DE ARCHIVOS A MODIFICAR

1. **Azure Portal:**
   - Agregar Redirect URI de producción

2. **Frontend (app.config.ts):**
   - Cambiar localhost por IP de AWS

3. **Backend (application.yml de cada microservicio):**
   - Ya configurado con variables de entorno

4. **.env:**
   - Crear en AWS con credenciales

---

## ✅ CHECKLIST FINAL

- [ ] EC2 creada con Elastic IP
- [ ] Security Group configurado (11 puertos)
- [ ] Docker instalado y corriendo
- [ ] Código subido a AWS
- [ ] .env configurado
- [ ] Docker Compose corriendo
- [ ] 4 microservicios corriendo
- [ ] Frontend compilado y sirviendo
- [ ] Azure Redirect URI agregado
- [ ] Frontend apuntando a IP de AWS
- [ ] Login funcionando
- [ ] RabbitMQ con 9 queues
- [ ] Grafana mostrando métricas
- [ ] Demo probada completa

---

**¡LISTO PARA ENTREGAR! 🎉**

Tu IP AWS: `54.145.51.231` (según documentos anteriores)
