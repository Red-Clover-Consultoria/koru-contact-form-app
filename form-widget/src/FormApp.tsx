import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        redirect_url?: string;
    };
}

interface FormAppProps {
    formId: string;
    websiteId: string | null;
}

const FormApp: React.FC<FormAppProps> = ({ formId, websiteId }) => {
    const [config, setConfig] = useState<FormConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Backend Base URL - Change this to your production URL if needed
    const API_BASE_URL = 'http://localhost:3000';

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/forms/config/${formId}`);
                setConfig(response.data);

                // Initialize form data
                const initialData: Record<string, any> = {};
                response.data.fields_config.forEach((field: FormField) => {
                    initialData[field.id] = '';
                });
                setFormData(initialData);
            } catch (err: any) {
                console.error('Error fetching form config:', err);
                setError(err.response?.data?.message || 'Formulario no encontrado o error de red.');
            } finally {
                setIsLoading(false);
            }
        };

        if (formId) {
            fetchConfig();
        }
    }, [formId]);

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
                website_id: window.location.hostname,
                data: formData,
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

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando formulario...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: '20px', border: '1px solid #ff4d4f', borderRadius: '8px', color: '#ff4d4f', backgroundColor: '#fff2f0' }}>
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!config) return null;

    const accentColor = config.layout_settings.accent_color || '#3b82f6';
    const isSuccess = formStatus === 'success';

    return (
        <div className="koru-form-container" style={{
            fontFamily: 'sans-serif',
            maxWidth: '100%',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: `1px solid ${accentColor}22`
        }}>
            <div className="koru-form-header" style={{
                backgroundColor: accentColor,
                padding: '16px 20px',
                color: '#fff'
            }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{config.title}</h3>
            </div>

            <div className="koru-form-body" style={{ padding: '20px' }}>
                {isSuccess ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ color: '#52c41a', fontSize: '48px', marginBottom: '16px' }}>✓</div>
                        <p style={{ fontSize: '16px', color: '#555' }}>
                            {config.layout_settings.success_msg || '¡Enviado con éxito!'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {config.fields_config.map(field => (
                            <div key={field.id} style={{ marginBottom: '16px', width: field.width === '50%' ? '50%' : '100%', display: field.width === '50%' ? 'inline-block' : 'block', boxSizing: 'border-box', padding: field.width === '50%' ? '0 8px' : '0' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
                                    {field.label} {field.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                                </label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        required={field.required}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' }}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        required={field.required}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', boxSizing: 'border-box' }}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {field.options?.split(',').map(opt => (
                                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        required={field.required}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '4px', boxSizing: 'border-box' }}
                                    />
                                )}
                            </div>
                        ))}

                        {submitError && (
                            <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px' }}>{submitError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={formStatus === 'submitting'}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: accentColor,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 600,
                                transition: 'opacity 0.2s',
                                marginTop: '8px',
                                opacity: formStatus === 'submitting' ? 0.7 : 1
                            }}
                        >
                            {formStatus === 'submitting' ? 'Enviando...' : (config.layout_settings.submit_text || 'Enviar')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FormApp;
