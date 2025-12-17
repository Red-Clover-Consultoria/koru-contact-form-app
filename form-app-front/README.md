# Koru Frontend - Form Builder App

Aplicación frontend moderna para la construcción y gestión de formularios interactivos. Permite a los usuarios crear, editar y desplegar formularios personalizados como widgets embebibles en sitios web.

## 📋 Descripción del Proyecto

**Koru Contact Form App** es una aplicación de construcción de formularios basada en React que proporciona una interfaz intuitiva para:

- ✅ Crear y editar formularios dinámicos
- ✅ Personalizar campos, layouts y estilos
- ✅ Configurar ajustes de email y respuestas automáticas
- ✅ Obtener vista previa en tiempo real
- ✅ Generar widgets embebibles en sitios terceros
- ✅ Gestionar autenticación de usuarios
-

## 🚀 Características Principales

### 1. **Autenticación de Usuarios**
- Login con email y contraseña
- Recuperación de contraseña
- Almacenamiento seguro de tokens en cookies

### 2. **Constructor de Formularios**
- **Sección de Campos**: Agregar, editar y eliminar campos de formulario
- **Configuración de Layout**: Personalizar tipo de display (Inline, Floating, Popup), posición, iconos y colores
- **Configuración de Email**: Establecer email de administrador, línea de asunto y respuesta automática

### 3. **Gestión de Formularios**
- Crear nuevos formularios
- Editar formularios existentes
- Eliminar formularios
- Dashboard para visualizar todos los formularios

### 4. **Widget Embebible**
- Vista previa pública de formularios
- Acceso mediante ID de aplicación único
- Sin requerimiento de autenticación

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **React 19** | Librería UI |
| **Vite** | Build tool y dev server |
| **React Router v7** | Enrutamiento |
| **Zustand** | State management |
| **Axios** | Cliente HTTP |
| **Tailwind CSS** | Estilos y diseño responsive |
| **PostCSS** | Procesamiento de CSS |
| **ESLint** | Linting de código |

## 📁 Estructura de Carpetas

```
src/
├── pages/                      # Páginas principales
│   ├── Login.jsx              # Página de login
│   ├── Register.jsx           # Página de registro
│   ├── ForgotPassword.jsx     # Recuperación de contraseña
│   ├── ResetPassword.jsx      # Reset de contraseña
│   ├── Dashboard.jsx          # Dashboard del usuario
│   ├── FormBuilder.jsx        # Editor de formularios
│   └── WidgetPreview.jsx      # Vista previa del widget
├── components/                 # Componentes reutilizables
│   ├── RequireAuth.jsx        # Protección de rutas
│   └── builder/               # Componentes del builder
│       ├── SectionFields.jsx  # Gestión de campos
│       ├── SectionLayout.jsx  # Configuración de layout
│       └── SectionEmail.jsx   # Configuración de email
├── layouts/
│   └── Layout.jsx             # Layout protegido
├── stores/                     # Estado global (Zustand)
│   ├── useAuthStore.js        # Store de autenticación
│   └── useFormStore.js        # Store de formularios
├── services/                   # Servicios API
│   ├── api.js                 # Cliente HTTP configurado
│   └── authService.js         # Servicio de autenticación
├── assets/                     # Recursos estáticos
├── App.jsx                     # Componente raíz
├── main.jsx                    # Punto de entrada
├── App.css                     # Estilos globales
└── index.css                   # Estilos base
```

## 🔄 Flujo de Rutas

```
/login                     - Página de login
/forgot-password           - Solicitar reset de contraseña
/reset-password/:token     - Resetear contraseña
/dashboard                 - Dashboard principal (protegido)
/forms/new                 - Crear nuevo formulario (protegido)
/forms/:id                 - Editar formulario (protegido)
/widget/:appId             - Widget público (sin autenticación)
/                          - Redirect a /dashboard
```

## 🔐 Rutas Protegidas

Las siguientes rutas requieren autenticación:
- `/dashboard` - Dashboard principal
- `/forms/new` - Creación de formularios
- `/forms/:id` - Edición de formularios

La protección se maneja mediante el componente `RequireAuth` que verifica la presencia de token válido.

## 📊 Estado Global

### `useAuthStore` - Gestión de Autenticación
```javascript
{
  user: null,              // Datos del usuario autenticado
  token: null,             // Token JWT
  isLoading: false,        // Estado de carga
  error: null,             // Mensajes de error
  login(),                 // Login con email/password
  logout(),                // Cerrar sesión
  forgotPassword(),        // Solicitar reset
  resetPassword()          // Resetear contraseña
}
```

### `useFormStore` - Gestión de Formularios
```javascript
{
  forms: [],               // Lista de formularios
  isLoading: false,        // Estado de carga
  error: null,             // Mensajes de error
  fetchForms(),            // Obtener todos los formularios
  createForm(),            // Crear nuevo formulario
  updateForm(),            // Actualizar formulario
  deleteForm()             // Eliminar formulario
}
```

## 🔌 Configuración de la API

La aplicación se conecta a un backend mediante Axios. La URL base se configura mediante:

```javascript
// En services/api.js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

**Variables de entorno requeridas:**
- `VITE_API_URL` - URL del servidor backend (ej: http://localhost:3001)

## 🌳 Modelo de Datos del Formulario

### FormData Structure
```javascript
{
  title: string,                    // Nombre del formulario
  app_id: string,                   // ID único de la aplicación
  fields_config: [                  // Configuración de campos
    {
      id: string,
      type: string,                 // 'text', 'email', 'textarea', etc.
      label: string,
      placeholder: string,
      required: boolean,
      validation: string            // Reglas de validación
    }
  ],
  layout_settings: {
    display_type: string,           // 'Inline', 'Floating', 'Popup'
    position: string,               // 'Bottom-Right', 'Bottom-Left'
    bubble_icon: string,            // 'Envelope', 'Chat', 'User', 'Question'
    accent_color: string,           // Color hex (ej: #4F46E5)
    submit_text: string,            // Texto del botón submit
    success_msg: string,            // Mensaje de éxito
    redirect_url: string            // URL de redirección
  },
  email_settings: {
    admin_email: string,            // Email para notificaciones
    subject_line: string,           // Línea de asunto con templates
    autoresponder: boolean          // Enviar respuesta automática
  }
}
```

## 💻 Instalación y Setup

### Prerrequisitos
- Node.js >= 18
- npm o yarn
- Backend API ejecutándose en puerto 3001

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repositorio-url>
cd form-app-front
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3001
```

### Desarrollo

Iniciar servidor de desarrollo con Hot Module Replacement (HMR):
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Preview de Build

```bash
npm run preview
```

### Linting

Verificar calidad del código:
```bash
npm run lint
```

## 🎨 Estilos y Diseño

- **Framework CSS**: Tailwind CSS v3.4
- **PostCSS**: Configurado para autoprefixer
- **Responsive**: Diseño totalmente responsive para mobile, tablet y desktop
- **Temas**: Tema moderno con degradados y efectos de glassmorphism

## 🔑 Características de Seguridad

1. **Autenticación con JWT**
   - Tokens almacenados en cookies HTTP-only
   - Interceptor automático en todas las peticiones API

2. **Rutas Protegidas**
   - Validación de autenticación en rutas privadas
   - Redirección automática a login si no hay sesión

3. **CORS**
   - Configurado en el backend para aceptar solicitudes desde el frontend

## 📦 Dependencias Principales

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.10.1",
  "axios": "^1.13.2",
  "zustand": "^5.0.9",
  "tailwindcss": "^3.4.17",
  "js-cookie": "^3.0.5"
}
```

## 🐛 Debugging

- **React DevTools**: Extensión de Chrome recomendada para debugging
- **Network Tab**: Revisar peticiones API en Network tab del navegador
- **Console**: Logs de errores y advertencias

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Visualiza build de producción |
| `npm run lint` | Ejecuta ESLint |

## 🚀 Deployment

Para desplegar la aplicación:

1. **Build de producción**
```bash
npm run build
```

2. **Opciones de hosting**:
   - Vercel (recomendado para Vite)
   - Netlify
   - AWS S3 + CloudFront
   - Servidor Node.js/Express

3. **Configurar variables de entorno** en la plataforma de hosting
   - `VITE_API_URL`: URL del backend en producción

## 📞 Contacto y Soporte

Para reportar bugs o solicitar nuevas características, por favor contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto es propiedad de Red Clover - Apps
