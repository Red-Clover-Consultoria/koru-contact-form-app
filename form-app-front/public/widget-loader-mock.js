(function () {
    console.log("Koru Mock Loader: Iniciando...");

    // 1. Obtener parámetros del script
    const script = document.currentScript || document.getElementById('koru-loader');
    const formId = script.getAttribute('data-form-id');
    const token = script.getAttribute('data-token');

    if (!formId || formId === 'REEMPLAZAR_CON_APP_ID_REAL') {
        return console.error("Koru Loader: formId no válido. Por favor configura un formId real.");
    }

    // 2. Crear el contenedor si es modo inline (opcional)
    // Para simplificar el test, lo inyectaremos como un iframe flotante 
    // a menos que sea un test específico.

    const iframe = document.createElement('iframe');

    // Construir la URL del widget (apuntando al servidor de desarrollo de Vite)
    const baseUrl = window.location.origin; // Asume que test-widget.html está en el mismo server
    iframe.src = `${baseUrl}/widget/${formId}?token=${token || ''}`;

    // Estilos para que se vea como el widget real
    Object.assign(iframe.style, {
        // position: 'fixed',
        // bottom: '20px',
        // right: '20px',
        width: '100%',
        height: '600px',
        border: 'none',
        zIndex: '999999',
        backgroundColor: 'transparent',
        colorScheme: 'light'
    });

    iframe.id = 'koru-widget-iframe';
    document.body.appendChild(iframe);

    console.log(`Koru Mock Loader: Widget ${formId} inyectado vía iframe.`);
})();
