import React from 'react';

const EmbedCodeModal = ({ isOpen, onClose, formId, websiteId, appId }) => {
    if (!isOpen) return null;

    const vercelUrl = 'https://koru-form-b008ydvyx-karens-projects-c3e39980.vercel.app/index.js';
    const embedCode = `<!-- Contenedor del Widget -->
<div class="koru-contact-form" data-form-id="${formId}"></div>

<!-- Koru SDK & Widget Script -->
<script 
  src="${vercelUrl}" 
  data-website-id="${websiteId}" 
  data-app-id="${appId}" 
  data-custom-data="${formId}"
  data-app-manager-url="https://www.korusuite.com"
  async
></script>`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        alert('¡Código copiado al portapapeles!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Código de Instalación</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-gray-600 mb-4">
                    Copia y pega este código en el lugar de tu sitio web donde quieras que aparezca el formulario.
                </p>

                <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                        {embedCode}
                    </pre>
                    <button
                        onClick={copyToClipboard}
                        className="absolute top-2 right-2 bg-primary text-white px-3 py-1.5 rounded-md text-xs hover:bg-opacity-90 transition-all shadow-lg"
                    >
                        Copiar Código
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmbedCodeModal;
