import { useState, useEffect } from 'react';
import api from '../../services/api';
import useFormStore from '../../stores/useFormStore';

const FormWidget = ({ appId, token, isPreview = false }) => {
    const { fetchConfig } = useFormStore();
    const [config, setConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false); // For popup/floating
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [activeToken, setActiveToken] = useState(token); // Local state for the token

    useEffect(() => {
        const load = async () => {
            if (!appId) return;
            try {
                const result = await fetchConfig(appId, token);
                const { config: fetchedConfig, token: fetchedToken } = result;

                setConfig(fetchedConfig);
                setActiveToken(fetchedToken);

                // Initialize form data
                const initialData = {};
                fetchedConfig.fields_config.forEach(field => {
                    initialData[field.id] = '';
                });
                setFormData(initialData);

                // Auto-open if inline
                if (fetchedConfig.layout_settings?.display_type === 'inline') {
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Koru security error:", error.message || error);
                setStatus('error');
                setErrors({ config: error.message || "Error al cargar la configuración" });
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [appId, token, fetchConfig]);

    const validate = () => {
        const newErrors = {};
        config.fields_config.forEach(field => {
            if (field.required && !formData[field.id]) {
                newErrors[field.id] = 'Este campo es obligatorio';
            }
            if (field.type === 'email' && formData[field.id]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[field.id])) {
                    newErrors[field.id] = 'Dirección de correo inválida';
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setStatus('submitting');
        try {
            const payload = {
                app_id: appId,
                website_id: window.location.hostname,  // Use underscore to match backend DTO
                data: formData,
                metadata: {
                    _trap: '', // Honeypot inside metadata
                }
            };

            console.log("Koru Widget: Intentando envío con token...", activeToken);

            // Use activeToken (synced from either prop or config response)
            const headers = activeToken ? { 'X-Koru-Token': activeToken } : {};
            await api.post('/api/forms/submit', payload, { headers });
            setStatus('success');

            // Handle success message or redirect
            if (config.layout_settings.redirect_url) {
                setTimeout(() => {
                    window.location.href = config.layout_settings.redirect_url;
                }, 2000);
            }
        } catch (error) {
            console.error("Koru Widget Error:", error.response?.data || error.message);
            setStatus('error');
            // If the error message is available, we could even show it to the user
            setErrors({ submit: error.response?.data?.message || 'Error al enviar el formulario. Verifica tu configuración.' });
        }
    };

    const handleChange = (e, fieldId) => {
        setFormData({ ...formData, [fieldId]: e.target.value });
        // Clear error on change
        if (errors[fieldId]) {
            setErrors({ ...errors, [fieldId]: null });
        }
    };

    if (isLoading) return <div>Cargando formulario...</div>;
    if (!config) return <div>Formulario no encontrado</div>;

    const { layout_settings, fields_config } = config;
    const { display_type, position, accent_color, submit_text, success_msg } = layout_settings;

    // Helper to get position classes
    const getPositionClass = () => {
        switch (position) {
            case 'bottom-right': return 'bottom-4 right-4';
            case 'bottom-left': return 'bottom-4 left-4';
            case 'top-right': return 'top-4 right-4';
            case 'top-left': return 'top-4 left-4';
            default: return 'bottom-4 right-4';
        }
    };

    // Render logic based on display_type
    if (!isOpen && (display_type === 'popup' || display_type === 'floating')) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed ${getPositionClass()} z-50 p-4 rounded-full shadow-lg text-white transition hover:scale-105`}
                style={{ backgroundColor: accent_color }}
            >
                {/* Icon placeholder (bubble) */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>
        );
    }

    return (
        <div className={`
            ${display_type === 'inline' ? 'w-full' : `fixed ${getPositionClass()} z-50 w-full max-w-sm`}
             bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100 flex flex-col font-sans mb-4 mr-4
        `}>
            {/* Header */}
            <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: accent_color }}>
                <h3 className="text-white font-semibold text-lg">{config.title}</h3>
                {display_type !== 'inline' && (
                    <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-75">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-6">
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">¡Éxito!</h3>
                        <div className="mt-2 px-7 py-3">
                            <p className="text-sm text-gray-500">
                                {success_msg || 'Tu mensaje ha sido enviado.'}
                            </p>
                        </div>
                        {display_type !== 'inline' && (
                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields_config.map(field => (
                            <div key={field.id} className={`${field.width === '50%' ? 'w-1/2 inline-block px-1' : 'w-full px-1'}`}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors[field.id] ? 'border-red-500' : 'border-gray-300'}`}
                                        rows={3}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors[field.id] ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Selecciona...</option>
                                        {field.options && field.options.split(',').map(opt => (
                                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors[field.id] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                )}
                                {errors[field.id] && <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>}
                            </div>
                        ))}

                        {/* Anti-spam trap */}
                        <input type="text" name="_trap" className="hidden" />

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                style={{ backgroundColor: accent_color }}
                            >
                                {status === 'submitting' ? 'Enviando...' : (submit_text || 'Enviar')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FormWidget;
