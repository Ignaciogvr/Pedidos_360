# 🚀 DEPLOYMENT EN AWS CON AZURE AD

## 🎯 ARQUITECTURA
```
Usuario → Azure AD (login) → AWS EC2 (aplicación completa)
```

**Azure:** Solo autenticación (GRATIS, ya configurado)  
**AWS:** Toda la aplicación (con tus créditos de estudiante)

---

## 📋 PREREQUISITOS

✅ Cuenta AWS Academy (tienes créditos de estudiante)  
✅ Azure AD configurado (Tenant y Client ID)  
✅ Sistema funcionando localmente

---

## 🚀 PASO 1: CREAR EC2 EN AWS (10 min)

### 1.1 Entrar a AWS Academy
1. Ir a [AWS Academy](https://awsacademy.instructure.com/)
2. Login con tu cuenta de estudiante
3. Ir a tu curso → **AWS Academy Learner Lab**
4. Click en **Start Lab** (espera que el círculo se ponga verde)
5. Click en **AWS** (te lleva a la consola)

### 1.2 Crear instancia EC2
1. En la consola AWS, buscar: **EC2**
2. Click en **Launch Instance**
3. Configuración:

```
Name: pedidos360-app

Application and OS Images:
- Ubuntu Server 22.04 LTS (Free tier eligible)

Instance type:
- t2.medium (2 vCPU, 4GB RAM)
  * Si no está disponible: t3.medium
  * Si solo puedes free tier: t2.micro (más lento pero funciona)

Key pair:
- Create new key pair
  - Name: pedidos360-key
  - Type: RSA
  - Format: .pem (para Windows con OpenSSH) o .ppk (para PuTTY)
  - Download (GUÁRDALA BIEN, no se puede recuperar)

Network settings:
- ✅ Allow SSH traffic from: Anywhere (0.0.0.0/0)
- ✅ Allow HTTP traffic from: Anywhere
- ✅ Allow HTTPS traffic from: Anywhere

Configure storage:
- 20 GB gp3 (suficiente para todo)

Advanced details:
- Dejar todo por defecto
```

4. Click en **Launch Instance**
5. Esperar 2-3 minutos
6. Click en **View Instances**

### 1.3 Configurar Security Group (IMPORTANTE)
1. En la lista de instancias, click en tu instancia `pedidos360-app`
2. Tab **Security** → Click en el Security Group (sg-xxxxx)
3. Tab **Inbound rules** → **Edit inbound rules**
4. **Add rule** para cada puerto:

```
Type          | Port | Source      | Description
------------- | ---- | ----------- | -----------
SSH           | 22   | 0.0.0.0/0   | SSH access
HTTP          | 80   | 0.0.0.0/0   | HTTP
Custom TCP    | 4200 | 0.0.0.0/0   | Frontend Angular
Custom TCP    | 8080 | 0.0.0.0/0   | BFF
Custom TCP    | 8081 | 0.0.0.0/0   | MS Órdenes
Custom TCP    | 8082 | 0.0.0.0/0   | MS Catálogo
Custom TCP    | 8083 | 0.0.0.0/0   | MS Mensajería
Custom TCP    | 15672| 0.0.0.0/0   | RabbitMQ Management
Custom TCP    | 3000 | 0.0.0.0/0   | Grafana
Custom TCP    | 9090 | 0.0.0.0/0   | Prometheus
```

5. **Save rules**

### 1.4 Obtener IP Pública
1. Volver a **EC2 Dashboard** → **Instances**
2. Seleccionar tu instancia `pedidos360-app`
3. Copiar **Public IPv4 address** (ejemplo: `54.123.45.67`)
4. **ANOTAR ESTA IP** - la necesitarás en Azure y en el código

---

## 🔐 PASO 2: CONFIGURAR AZURE AD (2 min)

### 2.1 Agregar Redirect URI
1. Ir a [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** → **App registrations**
3. Buscar tu app: `Pedidos360`
4. **Authentication** → **Add URI** (en Single-page application)
5. Agregar:
   ```
   http://TU-IP-AWS:4200
   http://TU-IP-AWS:4200/
   ```
   *(Reemplaza TU-IP-AWS con la IP que anotaste, ejemplo: http://54.123.45.67:4200)*

6. **Save**

---

## 💻 PASO 3: CONECTAR A EC2 (5 min)

### 3.1 Preparar la Key
```powershell
# En Windows PowerShell (como administrador)
# Mover la key a un lugar seguro
Move-Item "C:\Users\nacho\Downloads\pedidos360-key.pem" "C:\Users\nacho\.ssh\"

# Dar permisos correctos (solo para ti)
icacls "C:\Users\nacho\.ssh\pedidos360-key.pem" /inheritance:r
icacls "C:\Users\nacho\.ssh\pedidos360-key.pem" /grant:r "$($env:USERNAME):(R)"
```

### 3.2 Conectar por SSH
```powershell
ssh -i "C:\Users\nacho\.ssh\pedidos360-key.pem" ubuntu@TU-IP-AWS
```

**Si dice "Host key can't be verified"** → Escribir `yes` y Enter

---

## 📦 PASO 4: INSTALAR DEPENDENCIAS (10 min)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo apt install docker-compose -y

# Instalar Java 17
sudo apt install openjdk-17-jdk -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Gradle
sudo apt install gradle -y

# Verificar instalaciones
docker --version
docker-compose --version
java -version
node --version
npm --version

# Cerrar sesión para aplicar grupo docker
exit
```

```powershell
# Reconectar
ssh -i "C:\Users\nacho\.ssh\pedidos360-key.pem" ubuntu@TU-IP-AWS
```

---

## 📤 PASO 5: SUBIR CÓDIGO A AWS (5 min)

### Opción A: Git (Recomendado)

**Primero, sube tu código a GitHub:**
```powershell
# En tu PC Windows (en la carpeta del proyecto)
cd "c:\Users\nacho\Desktop\cloud\Pedidos_360-main"

# Si no tienes Git inicializado
git init
git add .
git commit -m "Sistema Pedidos360 completo"

# Crear repo en GitHub y subir
git remote add origin https://github.com/TU-USUARIO/pedidos360.git
git branch -M main
git push -u origin main
```

**Luego, clona en AWS:**
```bash
# En AWS EC2
cd ~
git clone https://github.com/TU-USUARIO/pedidos360.git
cd pedidos360
```

### Opción B: SCP (Más lento pero directo)
```powershell
# Desde tu PC Windows
scp -i "C:\Users\nacho\.ssh\pedidos360-key.pem" -r "c:\Users\nacho\Desktop\cloud\Pedidos_360-main" ubuntu@TU-IP-AWS:~/
```

---

## ⚙️ PASO 6: CONFIGURAR VARIABLES (3 min)

```bash
# En AWS EC2
cd ~/Pedidos_360-main  # o ~/pedidos360 si usaste Git

# Crear archivo .env
cat > .env << 'EOF'
# Database
MYSQL_ROOT_PASSWORD=Pedidos360Root!
MYSQL_DATABASE=pedidos360
DB_USERNAME=pedidos360
DB_PASSWORD=Pedidos360Pass!
DB_HOST=localhost
DB_PORT=3306

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Monitoring
GRAFANA_PASS=admin
PROMETHEUS_PASS=admin

# Azure AD (Ya configurado en el código)
AZURE_TENANT_ID=b6f34517-563c-4ce9-a10b-6f3958083091
AZURE_CLIENT_ID=3bdb2628-3745-4907-9593-53d8c7cb36fb
EOF

# Ver que se creó correctamente
cat .env
```

---

## 🔧 PASO 7: CONFIGURAR FRONTEND (3 min)

```bash
# Editar app.config.ts
nano pedidos360-frontend/src/app/app.config.ts
```

Buscar y cambiar estas líneas:
```typescript
// BUSCAR:
redirectUri: 'http://localhost:4200'

// CAMBIAR A (reemplaza con TU IP):
redirectUri: 'http://54.123.45.67:4200'

// BUSCAR:
apiUrl: 'http://localhost:8080/api'

// CAMBIAR A (reemplaza con TU IP):
apiUrl: 'http://54.123.45.67:8080/api'
```

**Atajos de nano:**
- `Ctrl + W` = Buscar
- `Ctrl + O` = Guardar
- `Ctrl + X` = Salir

---

## 🏗️ PASO 8: COMPILAR BACKEND (10 min)

```bash
cd ~/Pedidos_360-main  # o ~/pedidos360

# BFF
echo "Compilando BFF..."
cd pedidos360-bff
chmod +x gradlew
./gradlew build -x test
cd ..

# Órdenes
echo "Compilando Órdenes..."
cd pedidos360-ordenes
chmod +x gradlew
./gradlew build -x test
cd ..

# Catálogo
echo "Compilando Catálogo..."
cd pedidos360-catalogo
chmod +x gradlew
./gradlew build -x test
cd ..

# Mensajería
echo "Compilando Mensajería..."
cd pedidos360-mensajeria
chmod +x gradlew
./gradlew build -x test
cd ..

echo "✅ Backend compilado"
```

---

## 🎨 PASO 9: COMPILAR FRONTEND (5 min)

```bash
cd ~/Pedidos_360-main/pedidos360-frontend  # o ~/pedidos360/...

# Instalar dependencias
npm install

# Compilar para producción
npm run build

echo "✅ Frontend compilado"
```

---

## 🐳 PASO 10: INICIAR DOCKER (3 min)

```bash
cd ~/Pedidos_360-main  # o ~/pedidos360

# Levantar MySQL, RabbitMQ, Prometheus, Grafana
docker-compose up -d

# Verificar que están corriendo
docker ps

# Deberías ver 4 contenedores:
# - mysql-pedidos360
# - rabbitmq-pedidos360
# - prometheus-pedidos360
# - grafana-pedidos360

# Esperar 30 segundos para que MySQL inicie
sleep 30

echo "✅ Docker iniciado"
```

---

## 🚀 PASO 11: INICIAR MICROSERVICIOS (5 min)

```bash
cd ~/Pedidos_360-main  # o ~/pedidos360

# BFF
echo "Iniciando BFF..."
cd pedidos360-bff
nohup ./gradlew bootRun > ../logs/bff.log 2>&1 &
echo $! > bff_pid.txt
cd ..
sleep 10

# Órdenes
echo "Iniciando Órdenes..."
cd pedidos360-ordenes
nohup ./gradlew bootRun > ../logs/ordenes.log 2>&1 &
echo $! > ordenes_pid.txt
cd ..
sleep 10

# Catálogo
echo "Iniciando Catálogo..."
cd pedidos360-catalogo
nohup ./gradlew bootRun > ../logs/catalogo.log 2>&1 &
echo $! > catalogo_pid.txt
cd ..
sleep 10

# Mensajería
echo "Iniciando Mensajería..."
cd pedidos360-mensajeria
nohup ./gradlew bootRun > ../logs/mensajeria.log 2>&1 &
echo $! > mensajeria_pid.txt
cd ..

echo "✅ Microservicios iniciados"
```

---

## 🌐 PASO 12: SERVIR FRONTEND (2 min)

```bash
cd ~/Pedidos_360-main/pedidos360-frontend/dist/pedidos360-frontend/browser
# o ~/pedidos360/pedidos360-frontend/dist/pedidos360-frontend/browser

# Servir con http-server
sudo npm install -g http-server
nohup http-server -p 4200 > frontend.log 2>&1 &

echo "✅ Frontend sirviendo en puerto 4200"
```

---

## ✅ PASO 13: VERIFICAR TODO (3 min)

```bash
# Ver todos los puertos activos
sudo netstat -tuln | grep -E '8080|8081|8082|8083|4200|3306|5672|15672|3000|9090'

# Ver procesos Java
ps aux | grep java

# Ver logs en tiempo real
tail -f logs/bff.log
# Ctrl+C para salir

# Ver estado Docker
docker ps
```

**Deberías ver:**
- ✅ Puerto 4200: Frontend
- ✅ Puerto 8080: BFF
- ✅ Puerto 8081: Órdenes
- ✅ Puerto 8082: Catálogo
- ✅ Puerto 8083: Mensajería
- ✅ Puerto 3306: MySQL
- ✅ Puerto 5672: RabbitMQ
- ✅ Puerto 15672: RabbitMQ Management
- ✅ Puerto 3000: Grafana
- ✅ Puerto 9090: Prometheus

---

## 🎉 PASO 14: PROBAR LA APLICACIÓN (2 min)

### 14.1 Abrir en navegador
```
http://TU-IP-AWS:4200
```
*(Ejemplo: http://54.123.45.67:4200)*

### 14.2 Hacer login
1. Click en **"Login con Microsoft"**
2. Redirige a Azure AD
3. Ingresar credenciales Microsoft
4. Redirige de vuelta a la app
5. ✅ Deberías ver el dashboard

### 14.3 Probar funcionalidad
- Ver catálogo de productos
- Crear un pedido
- Ver pedidos
- Verificar RabbitMQ: `http://TU-IP-AWS:15672` (guest/guest)
- Ver métricas Grafana: `http://TU-IP-AWS:3000` (admin/admin)

---

## 📝 MANTENER CORRIENDO

```bash
# Crear script de inicio
cat > ~/start-pedidos360.sh << 'EOF'
#!/bin/bash
cd ~/Pedidos_360-main

# Docker
docker-compose up -d
sleep 30

# Backend
cd pedidos360-bff && nohup ./gradlew bootRun > ../logs/bff.log 2>&1 & cd ..
sleep 10
cd pedidos360-ordenes && nohup ./gradlew bootRun > ../logs/ordenes.log 2>&1 & cd ..
sleep 10
cd pedidos360-catalogo && nohup ./gradlew bootRun > ../logs/catalogo.log 2>&1 & cd ..
sleep 10
cd pedidos360-mensajeria && nohup ./gradlew bootRun > ../logs/mensajeria.log 2>&1 & cd ..

# Frontend
cd pedidos360-frontend/dist/pedidos360-frontend/browser
nohup http-server -p 4200 > frontend.log 2>&1 &

echo "✅ Sistema iniciado"
EOF

chmod +x ~/start-pedidos360.sh

# Para iniciar todo:
~/start-pedidos360.sh
```

---

## 🛑 DETENER TODO

```bash
# Detener microservicios
pkill -f 'gradlew bootRun'

# Detener frontend
pkill -f 'http-server'

# Detener Docker
cd ~/Pedidos_360-main
docker-compose down
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Frontend no carga
```bash
# Ver logs
tail -f ~/Pedidos_360-main/pedidos360-frontend/dist/pedidos360-frontend/browser/frontend.log

# Verificar puerto
sudo netstat -tuln | grep 4200
```

### Microservicio no arranca
```bash
# Ver logs
tail -f ~/Pedidos_360-main/logs/bff.log

# Verificar Java
ps aux | grep java
```

### Azure AD no redirige
1. Verificar Redirect URI en Azure Portal
2. Verificar IP en `app.config.ts`
3. Probar en ventana privada/incógnito

### Base de datos no conecta
```bash
# Ver contenedores
docker ps

# Ver logs MySQL
docker logs mysql-pedidos360

# Conectar a MySQL
docker exec -it mysql-pedidos360 mysql -upedidos360 -pPedidos360Pass! pedidos360
```

---

## 💰 COSTOS

### AWS Academy (Estudiante)
- **Tienes créditos gratis** ✅
- **t2.medium:** ~$0.05/hora (~$36/mes)
- **t2.micro (free tier):** GRATIS primer año

### Azure AD
- **GRATIS** (no pagas nada por autenticación) ✅

---

## 📌 RESUMEN DE URLs

| Servicio | URL |
|----------|-----|
| **Frontend** | http://TU-IP:4200 |
| **BFF** | http://TU-IP:8080 |
| **Órdenes** | http://TU-IP:8081 |
| **Catálogo** | http://TU-IP:8082 |
| **Mensajería** | http://TU-IP:8083 |
| **RabbitMQ** | http://TU-IP:15672 |
| **Grafana** | http://TU-IP:3000 |
| **Prometheus** | http://TU-IP:9090 |

---

## ✅ CHECKLIST FINAL

- [ ] EC2 creada y corriendo
- [ ] Security Group con todos los puertos abiertos
- [ ] IP pública anotada
- [ ] Azure AD Redirect URI agregado
- [ ] Código subido a EC2
- [ ] Variables .env configuradas
- [ ] Frontend configurado con IP pública
- [ ] Backend compilado (4 microservicios)
- [ ] Frontend compilado
- [ ] Docker corriendo (4 contenedores)
- [ ] Microservicios corriendo (4 procesos)
- [ ] Frontend sirviendo
- [ ] Login funcionando
- [ ] Aplicación completamente funcional

---

## 🎓 PARA ENTREGAR AL PROFESOR

**URL de la aplicación:**
```
http://TU-IP-AWS:4200
```

**Credenciales de prueba:**
- Cualquier cuenta Microsoft (@outlook.com, @hotmail.com, tu email institucional)

**URLs de monitoreo:**
- RabbitMQ: http://TU-IP-AWS:15672 (guest/guest)
- Grafana: http://TU-IP-AWS:3000 (admin/admin)

---

## 🚀 ¡LISTO!

Tu sistema está corriendo en AWS con autenticación Azure AD.

**Próximos pasos opcionales:**
- Dominio personalizado (pedidos360.tudominio.com)
- HTTPS con Let's Encrypt
- Elastic IP (IP estática permanente)
- Auto Scaling Groups
- Load Balancer
