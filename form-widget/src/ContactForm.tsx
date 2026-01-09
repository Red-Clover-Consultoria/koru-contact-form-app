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
    console.log('🚀 [KoruWidget] V2.1 Initialized with formId:', formId);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(config.layout_settings.display_type === 'Inline');

    const accentColor = config.layout_settings.accent_color || '#4F46E5';
    // Normalize display_type check (backend can return any case)
    const displayType = config.layout_settings.display_type || 'Inline';
    const isFloating = displayType !== 'Inline';
    const position = config.layout_settings.position || 'Bottom-Right';

    const handleChange = (id: string, value: any) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot check
        if (formData._trap && formData._trap.length > 0) {
            console.warn('[Honeypot] Submission blocked locally');
            setIsSuccess(true);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { _trap, ...cleanData } = formData;
            const payload = {
                formId: formId,
                app_id: appId,
                website_id: websiteId,
                data: cleanData,
                metadata: {
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                    _trap: _trap || "",
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
            setFormData({});

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

    // --- Dynamic Styles ---
    const getStyles = (): Record<string, React.CSSProperties> => {
        // Base container: In 'Inline' it flows. In 'Floating' it fixes buttons/modals.
        const container: React.CSSProperties = isFloating
            ? {
                position: 'fixed' as const,
                zIndex: 999999,
                bottom: '0',
                right: '0',
                left: '0',
                top: '0',
                pointerEvents: 'none' // Allow clicks through when modal/bubble not interacted (managed via children pointer-events)
            }
            : {
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                fontFamily: "'Inter', system-ui, sans-serif"
            };

        // Bubble Button
        const bubblePosition: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'auto',
            bottom: position.includes('Bottom') ? '20px' : 'auto',
            top: position.includes('Top') ? '20px' : 'auto',
            right: position.includes('Right') ? '20px' : 'auto',
            left: position.includes('Left') ? '20px' : 'auto',
        };

        const bubble: React.CSSProperties = {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: accentColor,
            color: '#fff',
            display: isFloating && !isPanelOpen ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            ...bubblePosition
        };

        // Modal Overlay (Backdrop)
        const overlay: React.CSSProperties = {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 999999, // Below the panel
            opacity: isPanelOpen && isFloating ? 1 : 0,
            pointerEvents: isPanelOpen && isFloating ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
        };

        // Main Form Panel
        const panel: React.CSSProperties = isFloating
            ? {
                position: 'absolute', // Relative to fixed container or fixed directly
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '480px',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: isPanelOpen ? 'flex' : 'none',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'auto',
                zIndex: 1000000,
                maxHeight: '85vh',
                animation: 'koru-scale-in 0.2s ease-out',
                fontFamily: "'Inter', system-ui, sans-serif"
            }
            : {
                // Inline styles
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'koru-fade-in 0.3s ease-out',
            };

        return { container, bubble, overlay, panel };
    };

    const styles = getStyles();

    // Constant Inner Styles
    const innerStyles: Record<string, React.CSSProperties> = {
        header: {
            backgroundColor: '#fff', // White background (requested: remove color)
            padding: '20px 24px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.02em',
        },
        body: {
            padding: '24px',
            overflowY: 'auto',
        },
        fieldContainer: {
            marginBottom: '20px',
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
        },
        required: {
            color: '#EF4444',
            marginLeft: '4px',
        },
        input: {
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            fontSize: '15px',
            color: '#1F2937',
            backgroundColor: '#F9FAFB',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxSizing: 'border-box' as const
        },
        button: {
            width: '100%',
            padding: '14px',
            backgroundColor: accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'filter 0.2s',
        }
    };

    const GetIcon = () => {
        switch (config.layout_settings.bubble_icon?.toLowerCase()) {
            case 'envelope': return <Mail size={24} />;
            case 'phone': return <Phone size={24} />;
            case 'user': return <User size={24} />;
            default: return <MessageSquare size={24} />;
        }
    };

    if (isSuccess) {
        return (
            <div style={styles.container}>
                {isFloating && <div style={styles.overlay} onClick={() => setIsPanelOpen(false)}></div>}
                <div style={styles.panel}>
                    <div style={{ position: 'absolute', right: '16px', top: '16px', cursor: 'pointer' }} onClick={() => isFloating ? setIsPanelOpen(false) : null}>
                        {isFloating && <X size={20} color="#9CA3AF" />}
                    </div>
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: `${accentColor}15`, marginBottom: '16px' }}>
                            <CheckCircle size={48} color={accentColor} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#111827' }}>¡Enviado!</h3>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{config.layout_settings.success_msg}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes koru-scale-in { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
                @keyframes koru-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes koru-spin { to { transform: rotate(360deg); } }
                .koru-field:focus { border-color: ${accentColor} !important; background-color: #fff !important; box-shadow: 0 0 0 3px ${accentColor}20 !important; }
                .koru-btn:hover { filter: brightness(1.1); }
                .koru-btn:active { transform: translateY(1px); }
            `}</style>

            <div style={styles.container}>
                {/* Overlay for Floating Mode */}
                {isFloating && (
                    <div style={styles.overlay} onClick={() => setIsPanelOpen(false)} />
                )}

                {/* Floating Bubble */}
                {isFloating && (
                    <div style={styles.bubble} onClick={() => setIsPanelOpen(true)}>
                        <GetIcon />
                    </div>
                )}

                {/* Main Panel */}
                <div style={styles.panel}>
                    <div style={innerStyles.header}>
                        <h4 style={innerStyles.headerTitle}>{config.title}</h4>
                        {isFloating && <X size={20} color="#9CA3AF" style={{ cursor: 'pointer', padding: '4px' }} onClick={() => setIsPanelOpen(false)} />}
                    </div>

                    <div style={innerStyles.body}>
                        <form onSubmit={handleSubmit}>
                            {config.fields_config.map(field => (
                                <div key={field.id} style={{
                                    width: field.width === '50%' ? '50%' : '100%',
                                    display: 'inline-block',
                                    paddingRight: field.width === '50%' ? '12px' : '0',
                                    boxSizing: 'border-box',
                                    verticalAlign: 'top',
                                    marginBottom: '20px'
                                }}>
                                    <label style={innerStyles.label}>
                                        {field.label} {field.required && <span style={innerStyles.required}>*</span>}
                                    </label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="koru-field"
                                            required={field.required}
                                            style={{ ...innerStyles.input, minHeight: '100px', resize: 'vertical' }}
                                            onChange={e => handleChange(field.id, e.target.value)}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            className="koru-field"
                                            required={field.required}
                                            style={innerStyles.input}
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
                                            style={innerStyles.input}
                                            onChange={e => handleChange(field.id, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Honeypot */}
                            <input type="text" name="_trap" style={{ display: 'none' }} onChange={e => handleChange('_trap', e.target.value)} />

                            {error && (
                                <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '20px', padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #Fee2E2' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="koru-btn"
                                disabled={isSubmitting}
                                style={{
                                    ...innerStyles.button,
                                    opacity: isSubmitting ? 0.7 : 1,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'koru-spin 0.8s linear infinite' }}></div>
                                    </>
                                ) : (
                                    <>
                                        {config.layout_settings.submit_text}
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactForm;
