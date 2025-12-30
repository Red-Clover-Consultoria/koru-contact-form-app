import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Mail, HelpCircle, X, Send } from 'lucide-react';

interface FormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    width?: string;
    options?: string;
}

interface FormConfig {
    title: string;
    fields_config: FormField[];
    layout_settings: {
        display_type: string;
        position: string;
        accent_color: string;
        submit_text: string;
        success_msg: string;
        bubble_icon?: string;
        redirect_url?: string;
    };
}

interface FormAppProps {
    formId: string;
    websiteId: string | null;
    apiUrl?: string; // Nueva prop opcional
}

const FormApp: React.FC<FormAppProps> = ({ formId, websiteId, apiUrl }) => {
    const [config, setConfig] = useState<FormConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false); // For Floating layout

    // Backend Base URL: Prioriza la prop -> Localhost de fallback
    let API_BASE_URL = apiUrl || 'http://localhost:3001';

    // Normalización: Eliminar barra final y sufijo /api redundante (porque lo agregamos en el fetch)
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
    if (API_BASE_URL.endsWith('/api')) {
        API_BASE_URL = API_BASE_URL.substring(0, API_BASE_URL.length - 4);
    }

    useEffect(() => {
        const fetchConfig = async () => {
            if (!formId || !websiteId) return;
            setIsLoading(true);
            try {
                // Enviamos websiteId como query param para validación de dominio
                const response = await axios.get(`${API_BASE_URL}/api/forms/config/${formId}?websiteId=${websiteId}`);
                console.log('WIDGET CONFIG RECEIVED:', response.data);

                if (!response.data.fields_config || response.data.fields_config.length === 0) {
                    console.warn('WIDGET WARNING: fields_config is empty or missing!');
                }

                setConfig(response.data);

                // Initialize form data
                const initialData: Record<string, any> = {};
                response.data.fields_config.forEach((field: FormField) => {
                    initialData[field.id] = '';
                });
                setFormData(initialData);
            } catch (err: any) {
                console.error('Error fetching form config:', err);
                setError(err.response?.data?.message || 'Formulario no disponible para este sitio.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, [formId, websiteId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, fieldId: string) => {
        setFormData(prev => ({ ...prev, [fieldId]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        setSubmitError(null);

        try {
            const payload = {
                formId,
                website_id: websiteId,
                app_id: '7fd1463d-cd54-420d-afc0-c874879270cf',
                data: formData,
                metadata: {
                    browser: navigator.userAgent,
                    url: window.location.href,
                    _trap: (e.target as any).elements?.['_trap']?.value || '' // Honeypot
                }
            };

            await axios.post(`${API_BASE_URL}/api/forms/submit`, payload);
            setFormStatus('success');

            if (config?.layout_settings?.redirect_url) {
                setTimeout(() => {
                    window.location.href = config.layout_settings.redirect_url!;
                }, 2000);
            }
        } catch (err: any) {
            console.error('Error submitting form:', err);
            setFormStatus('error');
            setSubmitError(err.response?.data?.message || 'Error al enviar el formulario.');
        }
    };

    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'Envelope': return <Mail size={24} />;
            case 'Help': return <HelpCircle size={24} />;
            case 'Chat': return <MessageSquare size={24} />;
            default: return <MessageSquare size={24} />;
        }
    };

    if (isLoading) return null;
    if (error) return null; // No mostrar nada si hay error de config o dominio
    if (!config) return null;

    const accentColor = config.layout_settings.accent_color || '#3b82f6';
    const isFloating = config.layout_settings.display_type === 'Floating';
    const position = config.layout_settings.position || 'Bottom-Right';
    const isSuccess = formStatus === 'success';

    const renderForm = () => {
        console.log('Attempting to render fields:', config.fields_config);
        return (
            <div className="koru-form-container" style={{
                fontFamily: 'sans-serif',
                width: isFloating ? '350px' : '100%',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                border: `1px solid ${accentColor}22`,
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left'
            }}>
                <div className="koru-form-header" style={{
                    backgroundColor: accentColor,
                    padding: '20px',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{config.title}</h3>
                    {isFloating && (
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="koru-form-body" style={{ padding: '20px', flex: 1, maxHeight: isFloating ? '500px' : 'none', overflowY: 'auto' }}>
                    {isSuccess ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ color: '#52c41a', fontSize: '64px', marginBottom: '16px' }}>✓</div>
                            <p style={{ fontSize: '18px', color: '#333', fontWeight: 500 }}>
                                {config.layout_settings.success_msg || '¡Enviado con éxito!'}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="_trap" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                            {config.fields_config.map(field => (
                                <div key={field.id} style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                                    </label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleChange(e, field.id)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '100px', outlineColor: accentColor, boxSizing: 'border-box' }}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleChange(e, field.id)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outlineColor: accentColor, boxSizing: 'border-box' }}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {field.options?.split(',').map(opt => (
                                                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'text' || field.type === 'email' || field.type === 'tel' ? (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleChange(e, field.id)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outlineColor: accentColor, boxSizing: 'border-box' }}
                                        />
                                    ) : (
                                        <div style={{ color: '#ef4444', fontSize: '12px' }}>
                                            Unsupported field type: {field.type}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {submitError && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{submitError}</p>}

                            <button
                                type="submit"
                                disabled={formStatus === 'submitting'}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: accentColor,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    opacity: formStatus === 'submitting' ? 0.7 : 1
                                }}
                            >
                                {formStatus === 'submitting' ? 'Enviando...' : (
                                    <>
                                        {config!.layout_settings.submit_text || 'Enviar'}
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
                <div style={{ padding: '10px', textAlign: 'center', fontSize: '10px', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>
                    Powered by Koru Suite
                </div>
            </div >
        );
    };

    if (isFloating) {
        const fixedStyle: React.CSSProperties = {
            position: 'fixed',
            zIndex: 9999,
            bottom: position.includes('Bottom') ? '24px' : 'auto',
            top: position.includes('Top') ? '24px' : 'auto',
            left: position.includes('Left') ? '24px' : 'auto',
            right: position.includes('Right') ? '24px' : 'auto',
        };

        return (
            <div style={fixedStyle}>
                {isOpen ? renderForm() : (
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: accentColor,
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {getIcon(config!.layout_settings.bubble_icon)}
                    </button>
                )}
            </div>
        );
    }

    return renderForm();
};

export default FormApp;
