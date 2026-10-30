# 🛍️ Pedidos360 - Sistema de Gestión de Pedidos

Sistema web moderno para gestión de pedidos empresariales con autenticación Azure AD y arquitectura Angular 21.

## 📋 Características

- ✅ **Autenticación empresarial** con Azure Entra ID (AD)
- 🔐 **Control de acceso basado en roles** (Admin, Operador, Cliente)
- 📦 **Gestión completa de pedidos** con estados y comentarios
- 🛒 **Catálogo de productos** con carrito de compras
- 📊 **Dashboard** con estadísticas en tiempo real
- 👤 **Perfil de usuario** con información de tokens JWT
- 🎨 **Design System** moderno con CSS variables
- ⚡ **Performance optimizada** con Signals y OnPush

## 🏗️ Arquitectura

```
src/app/
├── core/                    # Servicios y estado global
│   ├── services/           # Servicios singleton (Auth, API, Permissions)
│   ├── stores/             # Estado global con Signals (User, Orders, UI)
│   ├── guards/             # Guards de rutas
│   └── interceptors/       # HTTP interceptors (Error handling)
├── shared/                  # Código compartido
│   ├── components/         # 9 componentes reutilizables
│   ├── models/             # Interfaces TypeScript
│   └── styles/             # Design System CSS
├── [feature-components]/   # Componentes de página
│   ├── dashboard/
│   ├── orders/
│   ├── products/
│   └── profile/
└── app.config.ts           # Configuración de la app
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ y npm
- Angular CLI 21+
- Cuenta Azure con permisos para Azure AD

### Setup

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd pedidos360-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Azure AD**

Editar `src/app/app.config.ts` con tus credenciales:
```typescript
auth: {
  clientId: 'TU_CLIENT_ID',
  authority: 'https://login.microsoftonline.com/TU_TENANT_ID/v2.0',
  redirectUri: 'http://localhost:4200'
}
```

4. **Configurar API Backend**

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://tu-api.com'
};
```

## 🏃 Comandos

### Desarrollo
```bash
npm start                 # Servidor dev en http://localhost:4200
npm run build             # Build de producción
npm run build:dev         # Build de desarrollo
npm test                  # Tests unitarios
npm run lint              # Linter ESLint
```

### Build
```bash
npm run build             # Optimizado para producción
npm run build -- --configuration=staging  # Build staging
```

## 🔑 Roles y Permisos

| Rol | Ver Pedidos | Crear Pedidos | Actualizar Estado | Eliminar | Gestionar Catálogo |
|-----|-------------|---------------|-------------------|----------|-------------------|
| **Admin** | ✅ Todos | ✅ | ✅ | ✅ | ✅ |
| **Operador** | ✅ Todos | ❌ | ✅ | ❌ | ❌ |
| **Cliente** | ✅ Propios | ✅ | ❌ | ❌ | ❌ |

## 🛠️ Tecnologías

- **Framework**: Angular 21 (standalone components)
- **Estado**: @ngrx/signals
- **Autenticación**: @azure/msal-angular
- **HTTP**: HttpClient con interceptors
- **Estilos**: CSS nativo con Design System
- **Change Detection**: OnPush strategy
- **TypeScript**: Strict mode

## 📦 Servicios Core

### AuthService
Maneja autenticación con Azure AD.
```typescript
authService.login()           // Login redirect
authService.logout()          // Logout
authService.user$             // Observable del usuario
```

### ApiService
Cliente HTTP centralizado con error handling.
```typescript
apiService.get<T>(endpoint)
apiService.post<T>(endpoint, body)
apiService.put<T>(endpoint, body)
apiService.delete<T>(endpoint)
```

### PermissionService
Verificación de permisos basada en roles.
```typescript
permissionService.hasRole('Admin')
permissionService.canViewAllOrders()
permissionService.canManageCatalog()
```

## 🗄️ Stores

### UserStore
Estado global del usuario autenticado.
```typescript
userStore.userName()          // Signal
userStore.userRoles()         // Signal
userStore.isAdmin()           // Computed
```

### OrdersStore
Estado y operaciones de pedidos.
```typescript
ordersStore.loadOrders()
ordersStore.filteredOrders()  // Computed
ordersStore.stats()           // Computed stats
```

## 🎨 Design System

Sistema de diseño con tokens CSS reutilizables:

```css
/* Colores */
--color-primary: #6366f1
--color-success: #10b981
--color-error: #ef4444

/* Espaciado */
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem

/* Componentes */
.glass-card              /* Tarjeta con glassmorphism */
.btn-primary             /* Botón primario */
.btn-outline             /* Botón outline */
```

## 🧪 Testing

```bash
npm test                  # Karma + Jasmine
npm run test:coverage     # Con coverage report
```

## 📝 Convenciones de Código

- **Componentes**: PascalCase, sufijo `.component.ts`
- **Servicios**: camelCase, sufijo `.service.ts`
- **Stores**: PascalCase, sufijo `.store.ts`
- **Interfaces**: PascalCase, sin prefijo
- **Path aliases**: `@core/*`, `@shared/*`, `@app/*`

## 🐛 Troubleshooting

### Error: MSAL not initialized
```bash
# Limpiar caché del navegador y localStorage
# Verificar clientId y redirectUri en app.config.ts
```

### Error: CORS
```bash
# Verificar que el backend permite el origen del frontend
# Verificar protectedResourceMap en app.config.ts
```

### Error: Token no enviado
```bash
# Verificar que la URL del API está en protectedResourceMap
# Verificar formato: 'https://api.com/' con trailing slash
```

## 📚 Más Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Decisiones de arquitectura
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía de contribución
- [Azure MSAL Docs](https://github.com/AzureAD/microsoft-authentication-library-for-js)

## 👥 Equipo

Desarrollado para gestión empresarial de pedidos.

## 📄 Licencia

Propietario - Todos los derechos reservados