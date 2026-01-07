import React, { useState } from 'react';
import { MessageSquare, Send, X, Mail, Phone, User, CheckCircle } from 'lucide-react';

interface FieldConfig {
    id: string;
    type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'number' | 'tel';
    label: string;
    required: boolean;
    options?: string;
    width?: string;
}

interface FormConfig {
    title: string;
    fields_config: FieldConfig[];
    layout_settings: {
        display_type: 'Inline' | 'Floating' | 'Popup';
        position: 'Bottom-Right' | 'Bottom-Left' | 'Top-Right' | 'Top-Left';
        bubble_icon: string;
        accent_color: string;
        submit_text: string;
        success_msg: string;
        redirect_url?: string;
    };
}

interface ContactFormProps {
    config: FormConfig;
    websiteId: string;
    appId: string;
    formId: string;
    onClose?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ config, websiteId, appId, formId, onClose }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(config.layout_settings.display_type === 'Inline');

    const accentColor = config.layout_settings.accent_color || '#4F46E5';
    const isFloating = config.layout_settings.display_type === 'Floating';
    const position = config.layout_settings.position || 'Bottom-Right';

    const handleChange = (id: string, value: any) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot check (Double validation: frontend block and backend metadata)
        if (formData._trap && formData._trap.length > 0) {
            console.warn('[Honeypot] Submission blocked locally');
            setIsSuccess(true); // Silent discard for the bot
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Reconstruct payload according to backend specification
            const { _trap, ...cleanData } = formData;

            const payload = {
                formId: formId, // CRITICAL: Missing in original code
                app_id: appId,
                website_id: websiteId,
                data: cleanData,
                metadata: {
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                    _trap: _trap || "", // Backend expects it in metadata
                },
            };

            const response = await fetch('https://koru-contact-form-app-production.up.railway.app/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al enviar el formulario (400)');
            }

            setIsSuccess(true);
            setFormData({}); // Reset form

            if (config.layout_settings.redirect_url) {
                setTimeout(() => {
                    window.location.href = config.layout_settings.redirect_url!;
                }, 2000);
            }
        } catch (err: any) {
            console.error('[Submit Error]', err);
            setError(err.message || "Error al enviar. Intente de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Styles
    const styles: Record<string, React.CSSProperties> = {
        container: {
            fontFamily: "'Inter', system-ui, sans-serif",
            position: isFloating ? 'fixed' : 'relative',
            bottom: isFloating && position.includes('Bottom') ? '20px' : 'auto',
            top: isFloating && position.includes('Top') ? '20px' : 'auto',
            right: isFloating && position.includes('Right') ? '20px' : 'auto',
            left: isFloating && position.includes('Left') ? '20px' : 'auto',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: position.includes('Right') ? 'flex-end' : 'flex-start',
        },
        bubble: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: accentColor,
            color: '#fff',
            display: isFloating && !isPanelOpen ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
        panel: {
            width: isFloating ? '350px' : '100%',
            backgroundColor: '#fff',
            borderRadius: isFloating ? '16px' : '0',
            boxShadow: isFloating ? '0 10px 50px rgba(0,0,0,0.2)' : 'none',
            display: isPanelOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'koru-fade-in 0.3s ease-out',
        },
        header: {
            backgroundColor: accentColor,
            padding: '20px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        body: {
            padding: '24px',
            maxHeight: isFloating ? '70vh' : 'auto',
            overflowY: 'auto',
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '16px',
            fontSize: '14px',
            boxSizing: 'border-box' as const,
            outline: 'none',
        },
        button: {
            width: '100%',
            padding: '14px',
            backgroundColor: accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        },
        success: {
            textAlign: 'center',
            padding: '40px 20px',
        }
    };

    const GetIcon = () => {
        switch (config.layout_settings.bubble_icon?.toLowerCase()) {
            case 'envelope': return <Mail size={28} />;
            case 'phone': return <Phone size={28} />;
            case 'user': return <User size={28} />;
            default: return <MessageSquare size={28} />;
        }
    };

    if (isSuccess) {
        return (
            <div style={styles.container}>
                <div style={styles.panel}>
                    <div style={styles.success}>
                        <CheckCircle size={48} color={accentColor} style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0' }}>¡Enviado!</h3>
                        <p style={{ color: '#6b7280', margin: 0 }}>{config.layout_settings.success_msg}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>{`
        @keyframes koru-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes koru-spin { to { transform: rotate(360deg); } }
        .koru-field:focus { border-color: ${accentColor} !important; }
      `}</style>

            {isFloating && (
                <div style={styles.bubble} onClick={() => setIsPanelOpen(true)}>
                    <GetIcon />
                </div>
            )}

            <div style={styles.panel}>
                <div style={styles.header}>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>{config.title}</h4>
                    {isFloating && <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsPanelOpen(false)} />}
                </div>
                <div style={styles.body}>
                    <form onSubmit={handleSubmit}>
                        {config.fields_config.map(field => (
                            <div key={field.id} style={{ width: field.width === '50%' ? '50%' : '100%', display: 'inline-block', paddingRight: field.width === '50%' ? '8px' : '0', boxSizing: 'border-box' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#4b5563' }}>
                                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                                </label>

                                {field.type === 'textarea' ? (
                                    <textarea
                                        className="koru-field"
                                        required={field.required}
                                        style={{ ...styles.input, minHeight: '80px' }}
                                        onChange={e => handleChange(field.id, e.target.value)}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        className="koru-field"
                                        required={field.required}
                                        style={styles.input}
                                        onChange={e => handleChange(field.id, e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {field.options?.split(',').map(opt => (
                                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        className="koru-field"
                                        type={field.type}
                                        required={field.required}
                                        style={styles.input}
                                        onChange={e => handleChange(field.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}

                        <input type="text" name="_trap" style={{ display: 'none' }} onChange={e => handleChange('_trap', e.target.value)} />

                        {error && (
                            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                ...styles.button,
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'koru-spin 0.8s linear infinite' }}></div>
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    {config.layout_settings.submit_text}
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', fontSize: '10px', color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}>
                    Powered by Koru Suite
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
