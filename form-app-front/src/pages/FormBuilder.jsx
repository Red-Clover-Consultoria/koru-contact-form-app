import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFormStore from '../stores/useFormStore';
import useAuthStore from '../stores/useAuthStore';
import Swal from 'sweetalert2';

// Sections (Placeholders for now)
import SectionFields from '../components/builder/SectionFields';
import SectionLayout from '../components/builder/SectionLayout';
import SectionEmail from '../components/builder/SectionEmail';
import FormWidget from '../components/widget/FormWidget';

const FormBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createForm, updateForm, forms } = useFormStore();
    const { user, websites } = useAuthStore();
    const isEditMode = !!id && id !== 'new';

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('fields');

    // Form Configuration State
    // IMPORTANTE: estos valores deben coincidir con los enums del backend (CreateFormDto/LayoutSettingsDto/EmailSettingsDto)
    const [formData, setFormData] = useState({
        title: '',
        formId: '',
        fields_config: [], // Array de campos
        layout_settings: {
            // Opcion: 'Inline', 'Floating', 'Popup'
            display_type: 'Inline',
            //Opcion: 'Bottom-Right', 'Bottom-Left'
            position: 'Bottom-Right',
            //Opcion: 'Envelope', 'Chat', 'User', 'Question'
            bubble_icon: 'Envelope',
            accent_color: '#4F46E5',
            submit_text: 'Enviar',
            success_msg: '¡Gracias! Nos pondremos en contacto pronto.',
            redirect_url: '',
        },
        email_settings: {
            admin_email: '',
            subject_line: 'New Contact: {{Name}}',
            autoresponder: false,
        },
    });

    useEffect(() => {
        if (isEditMode) {
            // Find form in store or fetch
            const form = forms.find(f => (f.id || f._id) === id);
            if (form) {
                setFormData({
                    title: form.title || '',
                    formId: form.formId || '',
                    fields_config: form.fields_config || [],
                    layout_settings: { ...formData.layout_settings, ...form.layout_settings },
                    email_settings: { ...formData.email_settings, ...form.email_settings },
                });
            }
        } else {
            // Autogenerar formId para nuevos formularios
            if (!formData.formId) {
                const randomId = `koru-${Math.random().toString(36).substr(2, 9)}`;
                setFormData(prev => ({ ...prev, formId: randomId }));
            }
        }
    }, [id, forms, isEditMode]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (isEditMode) {
                await updateForm(id, formData);
            } else {
                // Sincronización de WebsiteID: tomarlo de la sesión
                const websiteId = websites?.[0];
                if (!websiteId) {
                    Swal.fire('Error', 'No se pudo determinar el sitio web autorizado. Por favor re-inicia sesión.', 'error');
                    return;
                }
                await createForm({ ...formData, websiteId });
            }
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            // Mostrar mensaje específico del backend si existe (ej. error de validación DTO o Koru API)
            const backendMessage = error.response?.data?.message;
            const message = Array.isArray(backendMessage)
                ? backendMessage.join(', ') // Errores de ValidationPipe suelen venir en array
                : backendMessage || error.message || 'Error al guardar el formulario';

            Swal.fire('Error', `No se pudo guardar: ${message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Header */}
            <div className="px-8 py-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{isEditMode ? `Editar: ${formData.title}` : 'Nuevo Formulario'}</h1>
                        <p className="text-xs text-gray-500">ID: {formData.formId}</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-[#00C896] hover:bg-[#00A080] text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* Main Workspace - Responsive Layout */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:h-[calc(100vh-73px)] relative">

                {/* Mobile Preview Toggle (Floating) */}
                <button
                    className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#00C896] text-white p-3 rounded-full shadow-lg shadow-emerald-500/30 active:scale-90 transition-transform"
                    onClick={() => {
                        const previewEl = document.getElementById('mobile-preview-area');
                        if (previewEl) previewEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>

                {/* Configuration Sidebar / Editor Area */}
                <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col z-10 h-[60vh] lg:h-full lg:flex-none order-2 lg:order-1">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-100 shrink-0">
                        <button
                            onClick={() => setActiveTab('fields')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'fields' ? 'text-[#00C896]' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Campos
                            {activeTab === 'fields' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00C896]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('layout')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'layout' ? 'text-[#00C896]' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Diseño
                            {activeTab === 'layout' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00C896]" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === 'email' ? 'text-[#00C896]' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Email
                            {activeTab === 'email' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00C896]" />
                            )}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                        {/* Title Input */}
                        {activeTab === 'fields' && (
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre del Formulario</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] transition-all"
                                    placeholder="Ej. Contacto Web"
                                />
                            </div>
                        )}

                        {activeTab === 'fields' && (
                            <SectionFields
                                fields={formData.fields_config}
                                onChange={newFields => setFormData({ ...formData, fields_config: newFields })}
                            />
                        )}
                        {activeTab === 'layout' && (
                            <SectionLayout
                                settings={formData.layout_settings}
                                onChange={newSettings => setFormData({ ...formData, layout_settings: newSettings })}
                            />
                        )}
                        {activeTab === 'email' && (
                            <SectionEmail
                                settings={formData.email_settings}
                                onChange={newSettings => setFormData({ ...formData, email_settings: newSettings })}
                            />
                        )}
                    </div>
                </div>

                {/* Live Preview Area */}
                <div id="mobile-preview-area" className="flex-1 bg-gray-100/50 relative flex items-center justify-center overflow-hidden lg:overflow-visible min-h-[500px] lg:min-h-0 order-1 lg:order-2">
                    <div className="absolute top-6 left-0 right-0 text-center z-0 pointer-events-none">
                        <span className="bg-white/80 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold text-gray-500 shadow-sm border border-gray-200 uppercase tracking-widest">
                            Vista Previa en Tiempo Real
                        </span>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                    </div>

                    {/* Simulation Container (Card/Device Look) */}
                    <div className="relative z-10 w-full max-w-md mx-6 animate-in fade-in zoom-in duration-300">
                        {/* Browser Window / Card Header */}
                        <div className="bg-white rounded-t-xl shadow-lg border-b border-gray-100 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                            </div>
                            <div className="text-xs font-medium text-gray-400">Preview</div>
                            <div className="w-12"></div> {/* Spacer for center alignment */}
                        </div>

                        {/* Form Content */}
                        <div className="bg-white rounded-b-xl shadow-xl p-6 min-h-[400px] border border-gray-100">
                            <h4 className="text-xl font-bold text-gray-800 mb-6">{formData.title || 'Formulario de Contacto'}</h4>

                            <div className="koru-form-preview-wrapper opacity-95"> {/* Slight opacity to blend if needed, or stick to 100 */}
                                <FormWidget
                                    formId={formData.formId}
                                    websiteId={user?.websites?.[0]}
                                    token={null}
                                    config={formData}
                                    isPreview={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
