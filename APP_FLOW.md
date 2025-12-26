# Flujo de la Aplicación: Koru Contact Form & Koru Suite

Este documento describe el flujo integral de datos y seguridad entre el **App Manager (Backend/Frontend)**, el **Widget** y el ecosistema de **Koru Suite**.

## 1. Flujo de Autenticación (App Login)

Cuando el administrador accede al App Manager para gestionar sus formularios:

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant App as App Manager (Frontend)
    participant Back as App Backend (NestJS)
    participant Koru as Koru Suite API

    Admin->>App: Ingresa Credenciales
    App->>Back: POST /api/auth/login
    Back->>Koru: POST /api/auth/app-login (X-App-ID, X-App-Secret)
    alt Usuario Válido en Koru
        Koru-->>Back: 200 OK (User Data + Token)
        Back->>Back: Crear/Actualizar Usuario en MongoDB
        Back-->>App: 200 OK (Local JWT + User Info)
        App->>Admin: Acceso Permitido al Dashboard
    else Inválido
        Koru-->>Back: 401 Unauthorized
        Back-->>App: Error de Autenticación
    end
```

## 2. Configuración y Generación de Embed Code

El administrador configura su widget (campos y diseño) íntegramente desde el App Manager de Koru Contact Form.

1.  **Configuración Interna:** Todo el diseño (colores, iconos, mensajes) y la estructura del formulario se gestionan en nuestra base de datos.
2.  **Config Schema:** El archivo [`config_schema.json`](file:///c:/Users/Usuario/Desktop/Red%20Clover/Apps/koru-contact-form-app/form-widget/config_schema.json) está vacío, ya que Koru Suite solo actúa como puente de autenticación y carga.
3.  **Embed Code:** El backend genera el script con el JWT de seguridad.

## 3. Integración y Renderizado del Widget (Frontend del Cliente)

```mermaid
sequenceDiagram
    participant Web as Sitio Web Cliente
    participant SDK as @redclover/koru-sdk
    participant Koru as Koru Suite (Auth)
    participant Back as App Backend (NestJS)
    participant UI as Widget Renderer (React)

    Web->>SDK: Carga de script e inicialización
    SDK->>Koru: Validar website_id y Dominio
    alt Autorizado por Koru
        Koru-->>SDK: OK (Contexto de Autorización)
        SDK->>UI: Dispara hook onRender()
        UI->>Back: GET /api/forms/config/:formId
        Back-->>UI: Retorna Config Completa (Campos + Diseño)
        UI->>Web: Renderiza Formulario con Diseño Interno
    else No Autorizado
        Koru-->>SDK: 403 Forbidden
        SDK-->>UI: Aborta ejecución
    end
```

## 4. Envío de Datos (Submit)

Flujo final cuando el usuario completa el formulario:

1.  **Validación:** El Widget valida los campos obligatorios.
2.  **Envío:** Se realiza un `POST /api/forms/submit`.
3.  **Procesamiento (Backend):**
    -   Se guarda el log del mensaje en MongoDB.
    -   Se envía notificación por correo al Administrador.
    -   Si está activo, se envía auto-respuesta al Cliente.
4.  **Respuesta:** El Widget muestra el `success_msg` configurado en Koru Suite.

---

### Puntos Clave de Seguridad
- **Validación de Dominio:** El SDK garantiza que el widget solo funcione en sitios registrados.
- **JWT en Embed:** Protege el ID del formulario y del cliente.
- **Backend desacoplado:** La lógica de campos es interna, pero la estética es gobernada por Koru Suite.
