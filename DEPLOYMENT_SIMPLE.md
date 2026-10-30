# 🚀 GUÍA SIMPLE DE DEPLOYMENT

## 📍 ¿DÓNDE ESTÁS AHORA?

### ✅ LO QUE TIENES:
- **Azure AD configurado** ✅
  - Tenant: `b6f34517-563c-4ce9-a10b-6f3958083091`
  - Client: `3bdb2628-3745-4907-9593-53d8c7cb36fb`
  - **Funcionando localmente (localhost:4200)**

- **Sistema funcionando al 100% en tu PC** ✅
  - Frontend: Angular + MSAL
  - Backend: 4 microservicios Spring Boot
  - BFF: Gateway con autenticación
  - Base de datos: MySQL
  - Mensajería: RabbitMQ

### ❓ LO QUE NECESITAS:
- Subir todo a la nube (Azure o AWS)
- Que funcione con una IP pública
- Configurar Azure AD para la nueva IP

---

## 🎯 RECOMENDACIÓN: AZURE (Más Fácil)

### ¿Por qué Azure?
1. **Ya tienes Azure AD configurado** - Solo agregas 1 redirect URI
2. **Todo en un solo lugar** - No mezclar Azure + AWS
3. **Más rápido** - 30 minutos vs 2 horas
4. **Gratis si eres estudiante** - Azure for Students ($100 USD gratis)

---

## 📋 PLAN PASO A PASO (AZURE)

### PASO 1: Crear VM en Azure (10 min)
1. Ir a [Azure Portal](https://portal.azure.com)
2. Buscar "Virtual Machines" → **Create**
3. Configuración:
   - **Image:** Ubuntu 22.04 LTS
   - **Size:** Standard B2s (2 vCPUs, 4GB RAM) - suficiente para demo
   - **Authentication:** SSH public key
   - **Public IP:** Static (IP estática)
   - **Inbound ports:** SSH (22), HTTP (80), Custom (4200, 8080-8083, 15672, 3000, 9090)

4. **Create** → Esperar 2-3 minutos

### PASO 2: Configurar Azure AD (2 min)
1. Ir a [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** → **App registrations** → Tu app `Pedidos360`
3. **Authentication** → **Add a platform** → **Single-page application**
4. Agregar Redirect URI:
   ```
   http://TU-IP-PUBLICA:4200
   http://TU-IP-PUBLICA:4200/
   ```
   *(Reemplaza TU-IP-PUBLICA con la IP de tu VM)*

5. **Save**

### PASO 3: Conectar a la VM (1 min)
```bash
ssh azureuser@TU-IP-PUBLICA
```

### PASO 4: Instalar dependencias (5 min)
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Instalar Java 17
sudo apt install openjdk-17-jdk -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cerrar sesión y volver a conectar para aplicar grupo docker
exit
```

```bash
# Reconectar
ssh azureuser@TU-IP-PUBLICA
```

### PASO 5: Subir código (5 min)

**Opción A: Git (Recomendado)**
```bash
cd ~
git clone https://github.com/TU-USUARIO/TU-REPO.git
cd TU-REPO
```

**Opción B: SCP desde tu PC**
```powershell
# Desde tu máquina Windows
scp -r "c:\Users\nacho\Desktop\cloud\Pedidos_360-main" azureuser@TU-IP-PUBLICA:~/
```

### PASO 6: Configurar variables (3 min)
```bash
cd ~/Pedidos_360-main

# Crear archivo .env
cat > .env << 'EOF'
# Database
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_DATABASE=pedidos360
DB_USERNAME=pedidos360
DB_PASSWORD=Pedidos360Pass!

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Monitoring
GRAFANA_PASS=admin

# Azure (Ya configurado en código)
AZURE_TENANT_ID=b6f34517-563c-4ce9-a10b-6f3958083091
AZURE_CLIENT_ID=3bdb2628-3745-4907-9593-53d8c7cb36fb
EOF
```

### PASO 7: Modificar configuración del frontend (2 min)
```bash
# Editar app.config.ts para usar la IP pública
nano pedidos360-frontend/src/app/app.config.ts
```

Cambiar:
```typescript
// ANTES
redirectUri: 'http://localhost:4200'
apiUrl: 'http://localhost:8080/api'

// DESPUÉS (reemplaza TU-IP-PUBLICA)
redirectUri: 'http://TU-IP-PUBLICA:4200'
apiUrl: 'http://TU-IP-PUBLICA:8080/api'
```

### PASO 8: Compilar backend (5 min)
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

### PASO 9: Compilar frontend (3 min)
```bash
cd ~/Pedidos_360-main/pedidos360-frontend
npm install
npm run build
```

### PASO 10: Iniciar sistema (2 min)
```bash
cd ~/Pedidos_360-main

# Levantar Docker (MySQL, RabbitMQ, Prometheus, Grafana)
docker-compose up -d

# Esperar 30 segundos
sleep 30

# Iniciar microservicios
./INICIAR_SISTEMA.ps1  # Si tienes bash
# O manualmente:
cd pedidos360-bff && nohup ./gradlew bootRun > bff.log 2>&1 &
cd ../pedidos360-ordenes && nohup ./gradlew bootRun > ordenes.log 2>&1 &
cd ../pedidos360-catalogo && nohup ./gradlew bootRun > catalogo.log 2>&1 &
cd ../pedidos360-mensajeria && nohup ./gradlew bootRun > mensajeria.log 2>&1 &

# Servir frontend
cd pedidos360-frontend/dist/pedidos360-frontend/browser
nohup python3 -m http.server 4200 > frontend.log 2>&1 &
```

### PASO 11: Verificar (2 min)
```bash
# Verificar puertos
netstat -tuln | grep -E '8080|8081|8082|8083|4200|3306|5672|15672'

# Debería ver:
# 8080 (BFF)
# 8081 (Órdenes)
# 8082 (Catálogo)
# 8083 (Mensajería)
# 4200 (Frontend)
# 3306 (MySQL)
# 5672 (RabbitMQ)
# 15672 (RabbitMQ Management)
```

### PASO 12: Probar (1 min)
1. Abrir navegador: `http://TU-IP-PUBLICA:4200`
2. Click en "Login con Microsoft"
3. Debería redirigir a Azure AD
4. Después de login, regresar a la aplicación

---

## ✅ CHECKLIST FINAL

- [ ] VM creada con IP estática
- [ ] Azure AD Redirect URI agregado
- [ ] Código subido a VM
- [ ] Variables .env configuradas
- [ ] Frontend configurado con IP pública
- [ ] Backend compilado (4 microservicios)
- [ ] Frontend compilado
- [ ] Docker iniciado
- [ ] Microservicios corriendo
- [ ] Frontend sirviendo
- [ ] Login funcionando

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Frontend no carga
```bash
# Ver logs
tail -f ~/Pedidos_360-main/pedidos360-frontend/frontend.log
```

### Microservicio no arranca
```bash
# Ver logs del BFF
tail -f ~/Pedidos_360-main/pedidos360-bff/bff.log

# Ver todos los procesos Java
ps aux | grep java
```

### Base de datos no conecta
```bash
# Ver contenedores Docker
docker ps

# Ver logs de MySQL
docker logs mysql-pedidos360
```

### Azure AD no redirige
1. Verificar Redirect URI en Azure Portal
2. Verificar `app.config.ts` tiene la IP correcta
3. Limpiar caché del navegador

---

## 💰 COSTOS ESTIMADOS

### Azure VM Standard B2s
- **Precio:** ~$31 USD/mes (~$1 USD/día)
- **Con Azure for Students:** GRATIS (tienes $100 USD de crédito)

### Alternativas más baratas:
- **B1s** (1 vCPU, 1GB RAM): ~$8 USD/mes
  - Funcionará pero más lento
- **Apagar la VM cuando no uses:** $0 USD (solo pagas cuando está prendida)

---

## 🎓 PARA ESTUDIANTES

### Azure for Students
1. Ir a [Azure for Students](https://azure.microsoft.com/es-es/free/students/)
2. Registrarse con email institucional (@duoc.cl o similar)
3. Obtener $100 USD gratis (sin tarjeta de crédito)
4. Válido por 12 meses

---

## 📌 NOTAS IMPORTANTES

1. **IP Estática:** La VM debe tener IP estática para que el Redirect URI no cambie
2. **Puertos:** Asegúrate de abrir todos los puertos en el Security Group/NSG
3. **Firewall:** Ubuntu puede tener UFW activo, desactívalo: `sudo ufw disable`
4. **HTTPS:** Esta guía usa HTTP. Para producción real necesitas HTTPS con certificado SSL

---

## 🚀 SIGUIENTE NIVEL (OPCIONAL)

Cuando domines esto, puedes mejorar:
- Usar HTTPS con Let's Encrypt
- Dominio personalizado (pedidos360.tudominio.com)
- CI/CD con GitHub Actions
- Kubernetes (Azure AKS o AWS EKS)
- Monitoreo con Azure Application Insights

---

## 📞 AYUDA

Si algo falla, revisa:
1. Logs de cada servicio
2. Security Group/NSG (puertos abiertos)
3. Azure AD Redirect URI
4. Variables de entorno (.env)

**¿Todo funcionó?** 🎉
Documenta tu IP pública y comparte el enlace con tu profesor.
