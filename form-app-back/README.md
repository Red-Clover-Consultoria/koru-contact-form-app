# KORU Form App Backend

Backend desarrollado en **NestJS** para la gestión de formularios dinámicos, usuarios y envíos de contacto. Este servicio permite a clientes (dueños de tiendas) configurar sus propios formularios de contacto y recibir notificaciones y auto-respuestas vía email.

## 🚀 Características Principales

- **Gestión de Roles (RBAC)**:
  - **Admin**: Gestión global de usuarios y formularios.
  - **Cliente**: Gestión de su propio perfil y formularios asignados.
- **Formularios Dinámicos**: Configuración de campos, estilos y mensajes almacenada en base de datos.
- **Gestión de Envíos (Submissions)**: Procesamiento de datos recibidos desde el widget.
- **Notificaciones por Email**:
  - Notificación al dueño del formulario (Cliente).
  - Auto-respuesta personalizable para el usuario final.
  - Integración con **SendGrid** y plantillas Handlebars.
- **Seguridad**:
  - Autenticación JWT.
  - Protección contra Spam (Honeypot).
  - Validación de datos con DTOs.

## 🛠️ Tecnologías

- **Framework**: [NestJS](https://nestjs.com/)
- **Base de Datos**: MongoDB (con Mongoose)
- **Email**: Nodemailer + SendGrid
- **Autenticación**: Passport + JWT + Bcrypt

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (Local o Atlas)
- Cuenta de SendGrid (para envío de emails)

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/ksimari92/koru-form-app-back.git
   cd koru-form-app-back
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente ejemplo:

   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/koru-forms-db

   # Auth
   JWT_SECRET=tu_secreto_super_seguro

   # Email Service (SendGrid)
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USER=apikey
   MAIL_PASS=SG.xxxxxxxxxxxxxxxx_TU_API_KEY_AQUI
   MAIL_FROM_EMAIL=notificaciones@tu-dominio.com
   MAIL_FROM_NAME="KORU Forms"

   # Modo desarrollo (dueño por defecto de los formularios)
   # Si no se envía JWT en /forms, se usará este email para buscar el usuario cliente.
   # Debe existir en la colección `users` (lo crea el seed por defecto).
   KORU_DEV_CLIENT_EMAIL=simarikaren@gmail.com
   ```

4. **Inicializar Base de Datos (Seed)**:
   Ejecuta el script para crear usuarios iniciales (Admin y Cliente) y un formulario de prueba.
   ```bash
   npx ts-node -r tsconfig-paths/register src/seed.ts
   ```
   > Esto creará:
   > - **Admin**: `ksimari@redclover.com.ar` / `admin123`
   > - **Cliente**: `simarikaren@gmail.com` / `client123`

## ▶️ Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🧪 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registrar nuevo cliente.
- `POST /auth/login` - Iniciar sesión (Devuelve JWT).

### Usuarios (Solo Admin)
- `GET /users` - Listar todos los usuarios.
- `POST /users` - Crear usuario manualmente.

### Formularios
- `GET /forms` - Listar formularios.
- `POST /forms` - Crear nuevo formulario.
- `GET /forms/config/:appId` - (Público) Obtener configuración para el widget.

### Envíos (Submissions)
- `POST /api/forms/submit` - (Público) Endpoint para recibir datos del formulario.

## 🧩 Modo desarrollo vs producción (auth de Koru)

### Modo desarrollo (sin login real de Koru)

- Los endpoints de gestión de formularios (`POST /forms`, `GET /forms`, `GET /forms/:id`, `PATCH /forms/:id`, `DELETE /forms/:id`) **no requieren JWT**.
- El servicio `FormsService` asigna automáticamente como dueño (`owner_id`) al usuario cuyo email coincide con `KORU_DEV_CLIENT_EMAIL` (por defecto `simarikaren@gmail.com`, creado por `src/seed.ts`).
- Puedes crear, listar, actualizar y borrar formularios desde Postman o tu panel sin preocuparte por el token.

### Cómo pasar a producción (con JWT de Koru)

Cuando tengas el JWT real emitido por Koru y quieras aplicar multi-tenant real:

1. **Reactivar guards en `FormsController`** (`src/forms/forms.controller.ts`):
   - Volver a agregar los imports de `AuthGuard`, `RolesGuard`, `Roles` y `Req`.
   - Añadir `@UseGuards(AuthGuard('jwt'), RolesGuard)` y `@Roles('admin','client')` en los métodos de CRUD.
   - Pasar `req.user.id` como `ownerId` a `FormsService.create/findAll/findOne/update/remove` según corresponda.
2. **Mantener `FormsService` tal cual**:
   - El servicio ya soporta un `ownerId` opcional; si lo pasas desde el controller, dejará de usar el usuario por defecto y aplicará el filtro multi-tenant.
3. **Seguir usando endpoints públicos para el widget**:
   - `GET /forms/config/:appId` y `POST /api/forms/submit` permanecen públicos y no usan JWT (el widget nunca envía la clave de Koru).

## 🐳 Docker (Opcional)

Si prefieres ejecutar la aplicación usando Docker:

1. **Construir la imagen**:
   ```bash
   docker build -t koru-form-backend .
   ```

2. **Ejecutar el contenedor**:
   Asegúrate de tener tu archivo `.env` configurado.
   ```bash
   docker run -p 3001:3001 --env-file .env koru-form-backend
   ```

---
**Desarrollado por Red Clover**
