import { useState } from 'react';

const EmbedCodeModal = ({ isOpen, onClose, appId, token }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const snippet = `<!-- Koru Contact Form Widget -->
<script 
  src="https://koru-cdn.vercel.app/widget-loader.js" 
  async 
  data-app-id="${appId}"
  data-token="${token || 'JWT_TOKEN_PENDIENTE'}"
></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Código de Inserción</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Copia y pega este código antes del cierre de la etiqueta <code>&lt;/body&gt;</code> en tu sitio web.
                    </p>

                    <div className="relative group">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                            {snippet}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded border border-white/20 backdrop-blur-sm transition-all"
                        >
                            {copied ? '¡Copiado!' : 'Copiar'}
                        </button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmbedCodeModal;
