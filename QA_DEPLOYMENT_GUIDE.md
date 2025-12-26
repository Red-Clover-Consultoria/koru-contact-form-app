# QA Deployment & Integration Roadmap: Koru Contact Form

This document outlines the technical steps to move from local development to a production-ready (QA) environment integrated with **Koru Suite**.

---

## 1. Handshake de Producción y Seguridad

### 1.1 Procesamiento de Tokens en NestJS
Para autorizar peticiones en producción, tu backend debe validar dos contextos:

- **Contexto de Admin (App Manager):**
  Al hacer login, guardamos el `koru_access_token`. Cuando el admin solicita activar un formulario para un `website_id`, tu backend debe:
  1. Recuperar el token de Koru del usuario.
  2. Llamar a `GET https://www.korusuite.com/api/websites/:website_id`.
  3. Si la respuesta contiene el App ID de tu formulario en la lista de aplicaciones instaladas, el handshake es exitoso.

- **Contexto del Widget (Frontend del Cliente):**
  El widget envía su propia validación. El backend recibe el `formId`. Para mayor seguridad, el backend puede verificar el header `Referer` para asegurar que coincide con la `website_url` registrada en MongoDB para ese formulario.

### 1.2 Flujo de Activación
1. **Petición:** El usuario elige un sitio de su lista de Koru y pulsa "Activar".
2. **Registro:** El backend marca el formulario como `status: active`.
3. **Señalización:** (Opcional) El backend puede notificar a Koru Suite mediante un Webhook que la instancia de la app para ese cliente está configurada.

---

## 2. Estrategia de CDN (Widget Autoejecutable)

### 2.1 Empaquetado (Vite Bundle)
Configuramos Vite para generar un único archivo `index.js` que incluya React y todas las dependencias (bundle "fat").

**Comando de Build:**
```bash
cd form-widget
npm run build
```
Esto genera `dist/index.js` (formato IIFE).

### 2.2 Despliegue en Vercel
1. Crea un nuevo proyecto en Vercel apuntando a la carpeta `form-widget`.
2. **Build Settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Al desplegar, tu widget será accesible en: `https://tu-cdn-vercel.vercel.app/index.js`.
4. (Recomendado) Configura un CNAME en tu DNS para usar un dominio propio (ej: `cdn.koru-app.com`).

### 2.3 Carga Asincrónica
El script debe cargarse con `async` o `defer` para no bloquear el renderizado del sitio del cliente:
```html
<script src="https://cdn.koru-app.com/index.js" data-form-id="..." async></script>
```

---

## 3. Roadmap de Despliegue QA

### Checklist Técnico
- [ ] **Variables de Entorno (Vercel/Heroku/Railway):**
  - `KORU_API_URL=https://www.korusuite.com`
  - `KORU_APP_ID=...`
  - `KORU_APP_SECRET=...`
- [ ] **Honeypot Test:** El formulario incluye un campo oculto `website_id_hidden`. Si se completa (por un bot), la sumisión se descarta.
- [ ] **Responsividad:** El CSS utiliza `vw` y media queries para asegurar que el `Popup` o `Floating` no rompa el viewport en móviles.
- [ ] **Security Headers:** Configurar CORS en NestJS para permitir solo dominios registrados o el wildcard `*` si el SDK maneja la validación de origen.

---

## 4. Archivos de Registro (Discovery)

### app_manifest.json
Este archivo indica a Koru Suite dónde encontrar tu App y su configuración. Se coloca en la raíz de tu servidor backend.

```json
{
  "name": "Koru Contact Form",
  "id": "7fd1463d-cd54-420d-afc0-c874879270cf",
  "version": "1.0.0",
  "endpoints": {
    "base": "https://api.koru-app.com",
    "auth": "/auth/login",
    "config_ui": "https://manager.koru-app.com/dashboard"
  },
  "widget": {
    "script_url": "https://cdn.koru-app.com/index.js"
  }
}
```

### config_schema.json
Aunque la lógica sea interna, este esquema le dice a Koru Suite qué parámetros mínimos necesita el widget para arrancar.

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "title": "Configuración Básica",
  "type": "object",
  "properties": {
    "formId": {
      "type": "string",
      "title": "ID del Formulario Interno",
      "description": "Se vincula automáticamente al crear el formulario"
    }
  }
}
```
