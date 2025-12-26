# 🧪 Guía de Pruebas API (Postman/Curl)

Esta guía detalla los endpoints disponibles para probar en Postman.

## 🟡 1. Autenticación (Público)
URL Base: `http://localhost:3001`

### A. Registrar Usuario (Público -> Rol 'client')
**Método:** `POST`
**URL:** `/auth/register`
**Body (JSON):**
```json
{
  "name": "Nuevo Cliente",
  "email": "nuevo@cliente.com",
  "password": "password123"
}
```

### B. Iniciar Sesión (Obtener Token)
**Método:** `POST`
**URL:** `/auth/login`
**Body (JSON):**
```json
{
  "email": "ksimari@redclover.com.ar", 
  "password": "admin123"
}
```
> **Nota:** Para probar rol normal, usa `simarikaren@gmail.com` / `client123`.
> **Respuesta:** Copia el `accessToken` devuelto para usar en los siguientes pasos.

---

## 🔐 2. Gestión de Usuarios (Admin Only)
**Headers Requeridos:**
- `Authorization`: `Bearer <TU_TOKEN_ADMIN>`

### A. Listar Usuarios
**Método:** `GET`
**URL:** `/users`

### B. Crear Usuario Manualmente
**Método:** `POST`
**URL:** `/users`
**Body (JSON):**
```json
{
  "name": "Otro Admin",
  "email": "admin2@test.com",
  "password": "123",
  "role": "admin"
}
```

---

## 📝 3. Gestión de Formularios

En **modo desarrollo** (sin login real de Koru):
- No es necesario enviar el header `Authorization`.
- Todos los formularios creados se asignan automáticamente a un **cliente de pruebas** (ver README).

En **modo producción** (cuando tengas el JWT de Koru integrado):
- Deberás volver a activar los guards en `FormsController` y enviar `Authorization: Bearer <TU_TOKEN>`.

### A. Crear Formulario
**Método:** `POST`
**URL:** `/forms`
**Body (JSON):**
```json
{
  "title": "Mi Nuevo Formulario",
  "form_id": "mi-form-002",
  "fields_config": [
    {
      "id": "nombre",
      "type": "text",
      "label": "Tu Nombre",
      "required": true,
      "width": "100%"
    },
    {
      "id": "email",
      "type": "email",
      "label": "Tu Email",
      "required": true,
      "width": "100%"
    },
    {
      "id": "motivo",
      "type": "select",
      "label": "Motivo de contacto",
      "required": true,
      "options": "Ventas, Soporte, Devoluciones",
      "width": "100%"
    },
    {
      "id": "acepto_politicas",
      "type": "checkbox",
      "label": "Acepto la Política de Privacidad",
      "required": true,
      "width": "100%"
    }
  ],
  "layout_settings": {
    "display_type": "Inline",
    "position": "Bottom-Right",
    "bubble_icon": "Envelope",
    "accent_color": "#00C896",
    "submit_text": "Enviar Mensaje",
    "success_msg": "¡Gracias! Te responderemos pronto.",
    "redirect_url": "https://mi-tienda.com/gracias"
  },
  "email_settings": {
    "admin_email": "mi-email@test.com",
    "subject_line": "Nuevo contacto web: {{nombre}}",
    "autoresponder": true
  }
}
```

### B. Listar Formularios
**Método:** `GET`
**URL:** `/forms`
> **Modo DEV:** Devuelve todos los formularios.
> **Modo PROD:** Con guards activos, el cliente verá solo sus formularios.

### C. Actualizar Formulario
**Método:** `PATCH`
**URL:** `/forms/:id` (Reemplaza `:id` por el `_id` real del form)
**Body (JSON):**
```json
{
  "title": "Título Actualizado",
  "status": "active",
  "layout_settings": {
    "display_type": "Floating",
    "position": "Bottom-Left",
    "bubble_icon": "Chat",
    "accent_color": "#FF6600",
    "submit_text": "Enviar",
    "success_msg": "¡Recibimos tu mensaje!",
    "redirect_url": null
  },
  "email_settings": {
    "admin_email": "otro-admin@test.com",
    "subject_line": "Nuevo contacto desde el sitio",
    "autoresponder": false
  }
}
```

### D. Eliminar Formulario
**Método:** `DELETE`
**URL:** `/forms/:id`
> Elimina el formulario indicado. En modo DEV no se valida el dueño; en modo PROD se aplica el filtro por `owner_id`.

---

## 🚀 4. Widget Público (Envío de Datos)
**Sin Autenticación Requerida** (Simula el frontend)

### A. Obtener Configuración
**Método:** `GET`
**URL:** `/forms/config/test-form-001`
> Reemplaza `test-form-001` por el `form_id` que quieras consultar.

### B. Enviar Formulario (Submit)
**Método:** `POST`
**URL:** `/api/forms/submit`
**Body (JSON):**
```json
{
  "form_id": "test-form-001",
  "website_id": "localhost",
  "data": {
    "Nombre Completo": "Tester Postman",
    "Correo Electrónico": "tester@gmail.com",
    "Mensaje": "Probando desde Postman"
  },
  "metadata": {
    "user_agent": "PostmanRuntime"
  }
}
```
