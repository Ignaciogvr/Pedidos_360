# 🚀 ALTERNATIVAS SIN POSTMAN - Cómo Demostrar las APIs

## ❌ Problema: No tengo Postman instalado

## ✅ Soluciones Fáciles (sin instalar nada)

---

## 🌐 OPCIÓN 1: Usar el Navegador (MÁS FÁCIL)

### ✅ Para Endpoints GET (Ver datos)

**1. Abrir el navegador**
**2. Ir directamente a las URLs:**

```
http://100.56.50.91:8080/api/pedidos
http://100.56.50.91:8080/api/catalogo
http://100.56.50.91:8080/api/usuarios
```

**3. Aparecerá error 401 (ESTO ES BUENO - Muestra que valida JWT)**

**4. Explicar:**
```
"Como pueden ver, sin token JWT obtengo error 401 Unauthorized.
Esto demuestra que el API Gateway está validando correctamente."
```

**5. Para hacer request CON token:**
- Presiona **F12** → Ve a la pestaña **Console**
- Pega este código:

```javascript
// Obtener token
const token = localStorage.getItem('msal.token.idtoken');

// Hacer request con token
fetch('http://100.56.50.91:8080/api/pedidos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

**6. Presiona Enter** → Verás la respuesta en la consola

---

## 💻 OPCIÓN 2: Usar PowerShell (SÚPER FÁCIL)

### ✅ Demostrar Rechazo sin Token

**Abre PowerShell y ejecuta:**

```powershell
# Sin token - Error 401
Invoke-WebRequest -Uri "http://100.56.50.91:8080/api/pedidos" | Select-Object StatusCode, StatusDescription
```

**Resultado esperado:**
```
StatusCode StatusDescription
---------- -----------------
       401 Unauthorized
```

---

### ✅ Demostrar Request CON Token

**1. Obtener el token:**
- Abre el frontend: https://100.56.50.91
- Login con admin
- Presiona **F12** → **Console**
- Ejecuta: `localStorage.getItem('msal.token.idtoken')`
- Copia el token

**2. En PowerShell:**

```powershell
# Pega tu token aquí
$token = "PEGA_TU_TOKEN_AQUI"

# Hacer request
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://100.56.50.91:8080/api/pedidos" -Headers $headers | ConvertTo-Json
```

**Resultado esperado:**
```json
[
  {
    "id": 1,
    "producto": "Laptop",
    "cantidad": 1,
    "estado": "Pendiente",
    ...
  }
]
```

---

## 🔧 OPCIÓN 3: Extension de VS Code (REST Client)

### ✅ Instalar REST Client (1 minuto)

**1. En VS Code:**
- Click en **Extensions** (icono cuadrados en la izquierda)
- Buscar: `REST Client`
- Instalar la de **Huachao Mao**

**2. Crear archivo de prueba:**

Crea archivo: `test-api.http`

```http
### Test 1: Sin token (debe fallar con 401)
GET http://100.56.50.91:8080/api/pedidos

### Test 2: Con token válido
@token = PEGA_TU_TOKEN_AQUI

GET http://100.56.50.91:8080/api/pedidos
Authorization: Bearer {{token}}

### Test 3: Ver catálogo
GET http://100.56.50.91:8080/api/catalogo
Authorization: Bearer {{token}}
```

**3. Usar:**
- Click en **"Send Request"** sobre cada línea GET
- Verás la respuesta al lado

---

## 🎯 OPCIÓN 4: Usar curl (Terminal)

### ✅ Windows PowerShell con curl

```powershell
# Sin token
curl http://100.56.50.91:8080/api/pedidos

# Con token
curl http://100.56.50.91:8080/api/pedidos `
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📹 LO QUE DEBES MOSTRAR EN EL VIDEO (SIN POSTMAN)

### ✅ ESCENARIO 1: Navegador (Súper simple)

**1. Abrir navegador**
**2. Ir a:** `http://100.56.50.91:8080/api/pedidos`
**3. Mostrar error 401**

**Decir:**
```
"Aquí vemos que sin token JWT, el API Gateway rechaza la petición
con un error 401 Unauthorized."
```

**4. Presionar F12 → Console**
**5. Ejecutar:**

```javascript
fetch('http://100.56.50.91:8080/api/pedidos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('msal.token.idtoken')}`
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

**6. Mostrar resultado en consola**

**Decir:**
```
"Ahora con el token JWT válido, la petición es aceptada y vemos
la lista de pedidos del usuario."
```

---

### ✅ ESCENARIO 2: PowerShell (Más técnico)

**1. Abrir PowerShell**

**2. Ejecutar:**

```powershell
# Test sin token
Write-Host "=== TEST SIN TOKEN ===" -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://100.56.50.91:8080/api/pedidos" -ErrorAction Stop
} catch {
    Write-Host "ERROR 401 - Token no válido ✅" -ForegroundColor Red
}

# Test con token
Write-Host "`n=== TEST CON TOKEN ===" -ForegroundColor Yellow
$token = "PEGA_TOKEN_AQUI"
$headers = @{"Authorization" = "Bearer $token"}
$response = Invoke-RestMethod -Uri "http://100.56.50.91:8080/api/pedidos" -Headers $headers
Write-Host "Respuesta exitosa - $($response.Count) pedidos ✅" -ForegroundColor Green
```

---

## 🎬 SCRIPT COMPLETO PARA EL VIDEO (SIN POSTMAN)

### 📍 SECCIÓN: Validación JWT

**QUÉ HACER:**

1. **Abrir navegador en:** `https://100.56.50.91`
2. **Login con admin**
3. **Abrir otra pestaña:** `http://100.56.50.91:8080/api/pedidos`
4. **Mostrar error 401**

**QUÉ DECIR:**
```
"Voy a demostrar que el API Gateway valida correctamente el JWT.
Si intento acceder sin token, obtengo un error 401 Unauthorized."
```

5. **Volver a la pestaña del frontend**
6. **Presionar F12 → Console**
7. **Ejecutar:**

```javascript
// Ver el token
console.log('Token JWT:', localStorage.getItem('msal.token.idtoken').substring(0, 50) + '...');

// Hacer request con token
fetch('http://100.56.50.91:8080/api/pedidos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('msal.token.idtoken')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log(`✅ Éxito - ${data.length} pedidos obtenidos`);
  console.log(data);
});
```

**QUÉ DECIR:**
```
"Ahora hago la misma petición pero incluyendo el token JWT que
obtuvimos al hacer login. Como pueden ver, la petición es exitosa
y obtengo los pedidos del usuario autenticado."
```

8. **Mostrar la respuesta en la consola**

---

## 📋 OPCIÓN HÍBRIDA: Mostrar en RabbitMQ Management

### ✅ Para demostrar que los endpoints funcionan:

**En lugar de usar Postman, puedes:**

1. **Usar el propio frontend** para crear pedidos
2. **Mostrar en RabbitMQ Management** que los mensajes llegaron
3. **Ver en los logs** que se procesaron

**FLUJO:**

```
1. Frontend → Crear pedido
   ↓
2. RabbitMQ Management → Ver que llegó el mensaje
   ↓
3. Logs → Ver que se procesó
   ↓
4. Frontend → Ver el pedido creado
```

**ESTO DEMUESTRA TODO EL FLUJO END-TO-END sin necesidad de Postman**

---

## 🎯 RECOMENDACIÓN FINAL

### ✅ **MEJOR OPCIÓN PARA EL VIDEO:**

**Usar la CONSOLA DEL NAVEGADOR (F12)**

**VENTAJAS:**
- ✅ No necesitas instalar nada
- ✅ Muy visual
- ✅ Fácil de explicar
- ✅ Puedes copiar/pegar los comandos

**DESVENTAJAS:**
- ❌ Ninguna (perfecto para demos)

---

## 📝 COMANDOS PARA COPIAR/PEGAR EN EL VIDEO

### 🔹 Comando 1: Ver token

```javascript
const token = localStorage.getItem('msal.token.idtoken');
console.log('Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
```

### 🔹 Comando 2: Test GET Pedidos

```javascript
fetch('http://100.56.50.91:8080/api/pedidos', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('msal.token.idtoken')}`}
})
.then(r => r.json())
.then(data => {
  console.log(`✅ ${data.length} pedidos obtenidos`);
  console.table(data);
});
```

### 🔹 Comando 3: Test GET Catálogo

```javascript
fetch('http://100.56.50.91:8080/api/catalogo', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('msal.token.idtoken')}`}
})
.then(r => r.json())
.then(data => {
  console.log(`✅ ${data.length} productos obtenidos`);
  console.table(data);
});
```

### 🔹 Comando 4: Ver claims del JWT

```javascript
const token = localStorage.getItem('msal.token.idtoken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Email:', payload.preferred_username);
console.log('Roles:', payload.roles);
console.log('Audience:', payload.aud);
```

---

## ✅ CHECKLIST FINAL

- [ ] Frontend funcionando (https://100.56.50.91)
- [ ] Login con Azure AD OK
- [ ] Token en localStorage visible
- [ ] Consola del navegador abierta (F12)
- [ ] Comandos copiados y listos para pegar

---

## 🎬 RESUMEN

**SIN POSTMAN puedes demostrar TODO usando:**

1. **Navegador directo** → Para mostrar error 401
2. **Consola del navegador (F12)** → Para requests exitosos con token
3. **PowerShell** → Para algo más técnico (opcional)
4. **Flujo completo en el frontend** → Crear pedido y ver en RabbitMQ

**¡NO NECESITAS POSTMAN! La consola del navegador es PERFECTA para el video.** 🎯

---

**Archivo creado:** 4 de Noviembre, 2026  
**Propósito:** Alternativas a Postman para demostración del video  
**Recomendación:** Usar consola del navegador (F12) ✅
