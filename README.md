# AgendaGol - Sistema de Reservas de Canchas de Fútbol

Aplicación web Frontend desarrollada con Next.js 14 y TypeScript para la gestión de reservas de canchas de fútbol.

## 🚀 Características Principales

- ✅ Autenticación de usuarios con JWT
- ✅ Gestión de canchas deportivas
- ✅ Sistema de reservas con múltiples estados
- ✅ Dashboard con estadísticas
- ✅ Diseño responsive y moderno
- ✅ Manejo robusto de errores
- ✅ Protección de rutas por rol
- ✅ Validación de formularios
- ✅ Estados de carga optimizados

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm, yarn o pnpm
- Backend de AgendaGol ejecutándose (ver repositorio: https://github.com/javiermercado1/agendaGol)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd agenda-gol-frontend
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Application
NEXT_PUBLIC_APP_NAME=AgendaGol
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### 5. Compilar para producción

```bash
npm run build
npm run start
# o
yarn build
yarn start
```

## 📁 Estructura del Proyecto

```
agenda-gol-frontend/
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── (auth)/              # Rutas de autenticación
│   │   │   └── login/           # Página de login
│   │   ├── (dashboard)/         # Rutas protegidas
│   │   │   ├── layout.tsx       # Layout del dashboard
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── canchas/         # Gestión de canchas
│   │   │   └── reservas/        # Gestión de reservas
│   │   └── globals.css          # Estilos globales
│   │
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── auth/                # Componentes de autenticación
│   │   │   └── ProtectedRoute.tsx
│   │   ├── canchas/             # Componentes de canchas
│   │   │   └── CanchaCard.tsx
│   │   └── reservas/            # Componentes de reservas
│   │       └── ReservaCard.tsx
│   │
│   ├── lib/                     # Librerías y utilidades
│   │   └── api/                 # Servicios de API
│   │       ├── client.ts        # Cliente HTTP configurado
│   │       ├── auth.ts          # API de autenticación
│   │       ├── canchas.ts       # API de canchas
│   │       └── reservas.ts      # API de reservas
│   │
│   ├── store/                   # Estado global (Zustand)
│   │   └── authStore.ts         # Store de autenticación
│   │
│   ├── types/                   # Definiciones TypeScript
│   │   ├── auth.types.ts
│   │   ├── cancha.types.ts
│   │   └── reserva.types.ts
│   │
│   └── middleware.ts            # Middleware de Next.js
│
├── public/                      # Archivos estáticos
├── .env.local                   # Variables de entorno
├── next.config.js              # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias del proyecto
```

## 🏗️ Arquitectura y Decisiones Técnicas

### Framework y Tecnologías

- **Next.js 14**: Elegido por su App Router, renderizado del lado del servidor, y optimizaciones automáticas
- **TypeScript**: Para type safety y mejor experiencia de desarrollo
- **Tailwind CSS**: Para estilos rápidos y consistentes
- **Zustand**: State management ligero y simple
- **Axios**: Cliente HTTP con interceptors para manejo de tokens y errores

### Patrones Implementados

#### 1. Separación de Responsabilidades

```
- Componentes UI puros en /components/ui
- Lógica de negocio en /lib/api
- Estado global en /store
- Tipos compartidos en /types
```

#### 2. Manejo de Errores en Capas

```typescript
// Capa 1: Interceptor de Axios (client.ts)
- Maneja errores HTTP globalmente
- Convierte errores a ApiError personalizado
- Redirige en caso de 401

// Capa 2: API Services
- Captura y loguea errores
- Re-lanza para manejo en componentes

// Capa 3: Componentes
- Muestra errores al usuario
- Proporciona opciones de recuperación
```

#### 3. Estado de Autenticación

```typescript
// Zustand Store
- Maneja login/logout
- Persiste en localStorage
- Sincroniza con interceptors de Axios
- Proporciona estado de carga
```

#### 4. Protección de Rutas

```typescript
// Middleware de Next.js
- Verifica token en cookies
- Redirige rutas protegidas
- Evita acceso a /login si ya autenticado

// ProtectedRoute Component
- Verifica autenticación en cliente
- Valida roles de usuario
- Muestra estados de carga
```

### Componentes Reutilizables

Todos los componentes UI siguen estos principios:

- **Props tipadas** con TypeScript
- **Variantes** para diferentes estilos
- **Estados** (loading, error, disabled)
- **Accesibilidad** con ARIA labels
- **Responsive** por defecto

### Manejo de API

Cada servicio de API (`auth.ts`, `canchas.ts`, `reservas.ts`) sigue este patrón:

```typescript
export const serviceApi = {
  // GET - Obtener recursos
  getAll: async (filters?) => { ... },
  getById: async (id) => { ... },
  
  // POST - Crear recursos
  create: async (data) => { ... },
  
  // PUT/PATCH - Actualizar recursos
  update: async (id, data) => { ... },
  
  // DELETE - Eliminar recursos
  delete: async (id) => { ... },
};
```

### Validación de Formularios

```typescript
// Validación en cliente
- Validación en tiempo real
- Mensajes de error específicos
- Prevención de envíos inválidos
- Limpieza de errores al escribir
```

## 🔒 Seguridad

### Autenticación y Autorización

- JWT almacenado en localStorage
- Token enviado en header Authorization
- Middleware protege rutas en servidor
- ProtectedRoute verifica en cliente
- Logout limpia todo el estado

### Protección XSS

- React escapa contenido automáticamente
- No uso de dangerouslySetInnerHTML
- Validación de inputs

### Variables de Entorno

- Variables sensibles en .env.local
- Prefijo NEXT_PUBLIC_ para cliente
- No se commitean archivos .env

## 🎨 UI/UX

### Diseño Responsive

```
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Sidebar colapsable en móvil
- Grid adaptativo en listados
```

### Estados de Carga

Cada página implementa:
- Skeleton loaders
- Spinners en botones
- Mensajes de progreso
- Indicadores visuales

### Feedback al Usuario

- Mensajes de error claros
- Confirmaciones de acciones
- Toast notifications (opcional)
- Validación en tiempo real

## 📝 Flujos Principales

### Flujo de Autenticación

1. Usuario ingresa a /login
2. Completa formulario con validación
3. Sistema valida credenciales
4. Backend retorna JWT y usuario
5. Token se guarda en localStorage
6. Usuario redirigido a /dashboard

### Flujo de Reserva

1. Usuario explora /canchas
2. Filtra canchas disponibles
3. Selecciona cancha deseada
4. Completa formulario de reserva
5. Sistema valida disponibilidad
6. Reserva creada y confirmada
7. Redirección a /reservas

### Flujo de Cancelación

1. Usuario ve reservas en /reservas
2. Selecciona reserva a cancelar
3. Confirma acción
4. Sistema actualiza estado
5. UI refleja cambio inmediato

## 🧪 Testing (Pendiente)

Recomendaciones para implementar:

```bash
# Unit Tests
- Jest para lógica de negocio
- React Testing Library para componentes

# Integration Tests
- Testing de flujos completos
- Mock de APIs

# E2E Tests
- Playwright o Cypress
- Pruebas de usuario completas
```

## 🚀 Deployment

### Vercel (Recomendado)

El proyecto usa Next.js 15.5.29. Hay que desplegar esta versión o una posterior de la misma línea: Vercel rechaza builds de Next.js 14.1.0 y otras versiones con vulnerabilidades conocidas.

El repositorio nació como Create React App, así que el proyecto de Vercel puede seguir con el preset **Create React App** y la carpeta de salida `build`. Ese ajuste publica la plantilla vieja y no esta app. `vercel.json` fuerza Next.js y anula esa carpeta de salida. En el dashboard, el Output Directory tiene que quedar vacío.

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | (vacío; lo gestiona Next.js) |
| Install Command | `npm install` |
| Node.js | 20.x o superior |

Las variables `NEXT_PUBLIC_*` se incrustan en el build. Si las cambias en Vercel, hay que volver a desplegar para que el sitio las use.

#### Desde el dashboard

1. Sube el repositorio a GitHub, GitLab o Bitbucket, incluyendo `package-lock.json`.
2. En [vercel.com/new](https://vercel.com/new), importa ese repositorio.
3. Confirma el Framework Preset **Next.js** y los comandos de la tabla.
4. En **Environment Variables**, añade las variables de la sección siguiente para Production (y Preview, si quieres).
5. Pulsa **Deploy**. El sitio queda en una URL `*.vercel.app`.

Cada push a la rama de producción vuelve a desplegar. El resto de ramas generan un preview.

#### Desde la CLI

```bash
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # producción
```

La CLI pregunta el directorio del proyecto y enlaza el repo local con el proyecto de Vercel. Las variables de entorno también se pueden cargar con:

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

### Otras Plataformas

- **Netlify**: Configurar build command y env vars
- **AWS Amplify**: Conectar repositorio
- **DigitalOcean App Platform**: Deploy con Dockerfile

### Variables de Entorno en Producción

En local, el frontend apunta a `localhost`. En Vercel esas URLs no sirven: usa las URLs públicas del backend y permite el dominio de Vercel en el CORS del API.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Auth (`/auth/login`, `/auth/register`, `/auth/verify`) |
| `NEXT_PUBLIC_FIELDS_API_URL` | Canchas (`/fields`) |
| `NEXT_PUBLIC_RESERVATIONS_API_URL` | Reservas (`/reservations`) |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout de Axios en milisegundos. Por defecto `30000` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la app |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend en Vercel |

Ejemplo:

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_FIELDS_API_URL=https://api.tudominio.com
NEXT_PUBLIC_RESERVATIONS_API_URL=https://api.tudominio.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=AgendaGol
NEXT_PUBLIC_APP_URL=https://agenda-gol.vercel.app
```

No hace falta definir `NODE_ENV`: Vercel lo pone en `production` durante el build.

## 📊 Optimizaciones Implementadas

- **Code Splitting**: Automático por Next.js
- **Image Optimization**: Next/Image component
- **Font Optimization**: Next/Font
- **Lazy Loading**: Componentes pesados
- **Memoization**: React.memo donde aplica

## 🐛 Troubleshooting

### Error: "Network Error"

- Verifica que el backend esté corriendo
- Confirma la URL en .env.local
- Revisa CORS en el backend

### Error: "Token expirado"

- El usuario será redirigido automáticamente
- Limpiar localStorage manualmente si persiste

### Estilos no cargan

```bash
# Regenerar Tailwind
npm run dev

# Limpiar cache
rm -rf .next
```

## 📚 Recursos Adicionales

- [Documentación Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/docs/intro)

## 🤝 Contribución

Este es un proyecto de prueba técnica. Para contribuir:

1. Fork el proyecto
2. Crea una rama feature
3. Commit cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## ✉️ Contacto

Para preguntas sobre este proyecto, contacta al desarrollador.

---

**Desarrollado con ❤️ para la prueba técnica de Naowee**