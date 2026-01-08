import React from 'react';
import Swal from 'sweetalert2';

const EmbedCodeModal = ({ isOpen, onClose, formId, websiteId, appId }) => {
    if (!isOpen) return null;

    const vercelUrl = 'https://koru-form-app.vercel.app/';
    const apiUrl = import.meta.env.VITE_API_URL || 'https://koru-contact-form-app-production.up.railway.app';

    const embedCode = `<!-- Contenedor del Widget -->
<div class="koru-contact-form" data-form-id="${formId}"></div>

<!-- Koru SDK & Widget Script -->
<script 
  src="${vercelUrl}" 
  data-website-id="${websiteId}" 
  data-app-id="${appId}" 
  data-custom-data="${formId}"
  data-api-url="${apiUrl}"
  data-app-manager-url="https://app-manager.vercel.app"
  async
></script>`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Código copiado',
            showConfirmButton: false,
            timer: 2000,
            background: '#fff',
            color: '#00C896',
            iconColor: '#00C896'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Código de Instalación</h3>
                        <p className="text-gray-500 text-sm mt-1">Integra tu formulario en cualquier sitio web</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-3">
                        Copia y pega este fragmento HTML en el `&lt;body&gt;` de tu página donde desees mostrar el formulario.
                    </p>
                    <div className="relative group">
                        <pre className="bg-gray-900 text-gray-300 p-5 rounded-xl overflow-x-auto text-xs font-mono border border-gray-800 shadow-inner">
                            {embedCode}
                        </pre>
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-3 right-3 bg-[#00C896] hover:bg-[#00A080] text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copiar
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmbedCodeModal;
