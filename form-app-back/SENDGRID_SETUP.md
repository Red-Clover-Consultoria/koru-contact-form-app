# Guía de Configuración de SendGrid

## 📋 Resumen
Esta guía te ayudará a configurar SendGrid para que el backend pueda enviar emails correctamente.

## 🔑 Paso 1: Obtener API Key de SendGrid

### Opción A: Si ya tienes cuenta de SendGrid
1. Inicia sesión en [SendGrid](https://app.sendgrid.com/)
2. Ve a **Settings** → **API Keys**
3. Click en **Create API Key**
4. Nombre: `koru-form-backend`
5. Permisos: Selecciona **Full Access** (o al menos **Mail Send**)
6. Click en **Create & View**
7. **⚠️ IMPORTANTE**: Copia la API Key inmediatamente (solo se muestra una vez)

### Opción B: Si no tienes cuenta
1. Regístrate en [SendGrid](https://signup.sendgrid.com/)
2. Verifica tu email
3. Sigue los pasos de la Opción A

## ✉️ Paso 2: Verificar Dominio/Email de Remitente

SendGrid requiere que verifiques el email desde el cual enviarás correos.

### Verificar un Email Individual (Más Rápido)
1. En SendGrid, ve a **Settings** → **Sender Authentication**
2. Click en **Verify a Single Sender**
3. Completa el formulario:
   - **From Name**: KORU Forms
   - **From Email Address**: tu-email@ejemplo.com (usa un email real que controles)
   - **Reply To**: puede ser el mismo email
   - **Company Address**: tu dirección
4. Click en **Create**
5. **Revisa tu email** y click en el link de verificación

### Verificar un Dominio Completo (Recomendado para Producción)
1. Ve a **Settings** → **Sender Authentication**
2. Click en **Authenticate Your Domain**
3. Sigue el wizard para agregar registros DNS

## ⚙️ Paso 3: Actualizar Variables de Entorno

Edita tu archivo `.env`:

\`\`\`env
# SendGrid Configuration
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM_EMAIL=tu-email-verificado@ejemplo.com
MAIL_FROM_NAME=KORU Forms
\`\`\`

**Reemplaza:**
- \`MAIL_PASS\`: Tu API Key de SendGrid (comienza con "SG.")
- \`MAIL_FROM_EMAIL\`: El email que verificaste en el Paso 2

## 🔄 Paso 4: Reiniciar el Servidor

Detén el servidor (Ctrl+C) y reinícialo:

\`\`\`powershell
npm run start
\`\`\`

## ✅ Paso 5: Probar el Envío

Ejecuta el script de prueba:

\`\`\`powershell
.\\test-submission.ps1
\`\`\`

Deberías ver:
- ✅ Submission guardada en la base de datos
- ✅ Emails enviados correctamente
- 📧 Email recibido en la bandeja del admin

## 🐛 Troubleshooting

### Error: "Invalid API Key"
- Verifica que copiaste la API Key completa
- Asegúrate de que no haya espacios al inicio/final
- La API Key debe comenzar con "SG."

### Error: "The from email does not match a verified Sender Identity"
- Verifica que el email en \`MAIL_FROM_EMAIL\` esté verificado en SendGrid
- Revisa tu bandeja de entrada para el email de verificación

### El servidor se cae al enviar
- Con los cambios recientes, esto ya no debería pasar
- Revisa los logs en la consola para más detalles
- La submission se guardará aunque el email falle

## 📊 Verificar Logs en SendGrid

1. Ve a **Activity** en SendGrid
2. Verás todos los emails enviados/fallidos
3. Útil para debugging

## 🔒 Seguridad

> [!CAUTION]
> - **NUNCA** commitees el archivo \`.env\` a Git
> - La API Key es como una contraseña
> - Si la expones accidentalmente, elimínala en SendGrid y crea una nueva

## 📝 Notas Adicionales

- **Free Tier**: SendGrid permite 100 emails/día gratis
- **Rate Limits**: Para producción, considera un plan pago
- **Templates**: Puedes crear templates HTML en SendGrid para emails más bonitos
