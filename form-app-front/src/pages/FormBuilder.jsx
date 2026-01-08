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

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden h-[calc(100vh-73px)]">
                {/* Configuration Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-10">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-100">
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

                        {/* Title Input (Always visible or part of Fields?) -> Let's keep it in Fields or Top */}
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
                <div className="flex-1 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute top-4 left-0 right-0 text-center z-0">
                        <span className="bg-white/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-gray-400 border border-gray-100">
                            Vista Previa
                        </span>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 opacity-[0.03]"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    {/* Simulation Container */}
                    <div className="w-full h-full relative transform translate-0 overflow-auto flex items-center justify-center p-8">
                        {/* We use a transformative container to prevent fixed elements from escaping 'preview' logic if implemented correctly in child,
                            but since FormWidget uses 'fixed', we rely on it being context-aware or just letting it float in this 'iframe-like' box.
                            For now, we place it here.
                        */}
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
    );
};

export default FormBuilder;
