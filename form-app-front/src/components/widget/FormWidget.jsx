import { useState, useEffect } from 'react';
import api from '../../services/api';
import useFormStore from '../../stores/useFormStore';
import Swal from 'sweetalert2';

const FormWidget = ({ formId, websiteId, token, isPreview = false, config: directConfig }) => {
    const { fetchConfig } = useFormStore();
    const [config, setConfig] = useState(directConfig || null);
    const [isLoading, setIsLoading] = useState(!directConfig);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const [activeToken, setActiveToken] = useState(token);
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Matches ContactForm logic

    // Icon components (Lucide-like SVGs)
    const Icons = {
        MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
        Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
        Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
        User: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
        CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>,
        Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    };

    const GetIcon = () => {
        switch (config.layout_settings.bubble_icon?.toLowerCase()) {
            case 'envelope': return <Icons.Mail />;
            case 'phone': return <Icons.Phone />;
            case 'user': return <Icons.User />;
            default: return <Icons.MessageSquare />;
        }
    };

    useEffect(() => {
        if (directConfig) {
            setConfig(directConfig);
            setIsLoading(false);
            const initialData = {};
            if (directConfig.fields_config) {
                directConfig.fields_config.forEach(field => initialData[field.id] = '');
            }
            setFormData(prev => ({ ...initialData, ...prev }));

            // Sync isPanelOpen state with display type
            const isInline = directConfig.layout_settings?.display_type === 'Inline';
            setIsPanelOpen(isInline);
        }
    }, [directConfig]);

    useEffect(() => {
        const load = async () => {
            if (directConfig || !formId) return;
            try {
                const result = await fetchConfig(formId, token);
                setConfig(result.config);
                setActiveToken(result.token);
                // Initialize
                const initialData = {};
                result.config.fields_config.forEach(field => initialData[field.id] = '');
                setFormData(initialData);

                const isInline = result.config.layout_settings?.display_type?.toLowerCase() === 'inline';
                setIsPanelOpen(isInline);
            } catch (error) {
                console.error(error);
                setStatus('error');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [formId, token, fetchConfig, directConfig]);

    const validate = () => {
        const newErrors = {};
        if (!config?.fields_config) return false;
        config.fields_config.forEach(field => {
            if (field.required && !formData[field.id]) newErrors[field.id] = 'Este campo es obligatorio';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (isPreview) {
            Swal.fire({ title: 'Modo Vista Previa', text: 'Simulación de envío exitosa.', icon: 'info', confirmButtonColor: config.layout_settings.accent_color });
            return;
        }
        setStatus('submitting');
        try {
            await api.post('/forms/submit', { formId, website_id: websiteId, data: formData }, { headers: { 'X-Koru-Token': activeToken } });
            setStatus('success');
            if (config.layout_settings.redirect_url) setTimeout(() => window.location.href = config.layout_settings.redirect_url, 2000);
        } catch (error) {
            setStatus('error');
            setErrors({ submit: 'Error al enviar.' });
        }
    };

    const handleChange = (e, fieldId) => {
        setFormData({ ...formData, [fieldId]: e.target.value });
        if (errors[fieldId]) setErrors({ ...errors, [fieldId]: null });
    };

    if (isLoading) return <div>Cargando...</div>;
    if (!config) return <div>Formulario no encontrado</div>;

    const { layout_settings, fields_config } = config;
    const accentColor = layout_settings.accent_color || '#4F46E5';
    const displayTypeRaw = layout_settings.display_type || 'Inline';
    const display_type = displayTypeRaw.toLowerCase();
    const isFloating = display_type !== 'inline';
    const position = layout_settings.position || 'Bottom-Right';

    // --- Dynamic Styles Mirroring ContactForm.tsx ---
    const getStyles = () => {
        // Adapt relative/fixed/absolute for preview environment
        const containerPosition = isPreview
            ? (isFloating ? 'absolute' : 'relative')
            : (isFloating ? 'fixed' : 'relative');

        const container = isFloating
            ? {
                position: containerPosition,
                zIndex: 50, // Lower z-index for preview context handled by parent
                bottom: '0',
                right: '0',
                left: '0',
                top: '0',
                pointerEvents: 'none',
                width: '100%',
                height: '100%' // Ensure it fills the preview area
            }
            : {
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                fontFamily: "'Inter', system-ui, sans-serif"
            };

        const bubblePosition = {
            position: 'absolute',
            pointerEvents: 'auto',
            bottom: position.includes('Bottom') ? '20px' : 'auto',
            top: position.includes('Top') ? '20px' : 'auto',
            right: position.includes('Right') ? '20px' : 'auto',
            left: position.includes('Left') ? '20px' : 'auto',
        };

        const bubble = {
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
            transition: 'transform 0.2s',
            ...bubblePosition
        };

        const overlay = {
            position: 'absolute', // Absolute to fill container (preview box or viewport)
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 50,
            opacity: isPanelOpen && isFloating ? 1 : 0,
            pointerEvents: isPanelOpen && isFloating ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
        };

        const panel = isFloating
            ? {
                position: 'absolute',
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
                zIndex: 55,
                maxHeight: '85vh',
                animation: 'koru-scale-in 0.2s ease-out',
                fontFamily: "'Inter', system-ui, sans-serif"
            }
            : {
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

    const innerStyles = {
        header: {
            backgroundColor: '#fff',
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
        body: { padding: '24px', overflowY: 'auto' },
        label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' },
        required: { color: '#EF4444', marginLeft: '4px' },
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
            boxSizing: 'border-box'
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

    if (status === 'success') {
        return (
            <div style={styles.container}>
                {isFloating && <div style={styles.overlay} onClick={() => setIsPanelOpen(false)}></div>}
                <div style={styles.panel}>
                    <div style={{ position: 'absolute', right: '16px', top: '16px', cursor: 'pointer' }} onClick={() => isFloating ? setIsPanelOpen(false) : null}>
                        {isFloating && <Icons.X />}
                    </div>
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: `${accentColor}15`, marginBottom: '16px' }}>
                            <Icons.CheckCircle />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#111827' }}>¡Enviado!</h3>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{success_msg || 'Gracias.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes koru-scale-in { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
                @keyframes koru-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes koru-spin { to { transform: rotate(360deg); } }
                .koru-field:focus { border-color: ${accentColor} !important; background-color: #fff !important; box-shadow: 0 0 0 3px ${accentColor}20 !important; }
                .koru-btn:hover { filter: brightness(1.1); }
                .koru-btn:active { transform: translateY(1px); }
            `}</style>

            {/* Overlay */}
            {isFloating && <div style={styles.overlay} onClick={() => setIsPanelOpen(false)} />}

            {/* Bubble */}
            {isFloating && <div style={styles.bubble} onClick={() => setIsPanelOpen(true)}><GetIcon /></div>}

            {/* Panel */}
            <div style={styles.panel}>
                <div style={innerStyles.header}>
                    <h4 style={innerStyles.headerTitle}>{config.title}</h4>
                    {isFloating && <div style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setIsPanelOpen(false)}><Icons.X /></div>}
                </div>
                <div style={innerStyles.body}>
                    <form onSubmit={handleSubmit}>
                        {fields_config.map(field => (
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
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        className="koru-field"
                                        style={{ ...innerStyles.input, minHeight: '100px', resize: 'vertical' }}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleChange(e, field.id)}
                                        className="koru-field"
                                        style={innerStyles.input}
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
                                        className="koru-field"
                                        style={innerStyles.input}
                                    />
                                )}
                            </div>
                        ))}
                        <button type="submit" className="koru-btn" disabled={status === 'submitting'} style={{ ...innerStyles.button, opacity: status === 'submitting' ? 0.7 : 1 }}>
                            {status === 'submitting' ? 'Enviando...' : (submit_text || 'Enviar')}
                            <Icons.Send />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormWidget;
