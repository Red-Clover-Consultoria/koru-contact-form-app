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
        <div className="bg-white rounded-lg shadow min-h-screen flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{isEditMode ? `Editar: ${formData.title}` : 'Crear nuevo formulario'}</h1>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 shadow transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar formulario'}
                    </button>
                </div>
            </div>

            {/* Tabs & Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar / Tabs */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 hidden md:block overflow-y-auto">
                    {/* General Info Inputs in Sidebar */}
                    <div className="mb-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase italic text-indigo-600">Título del formulario</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Ej: Contacto Ventas"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">ID del formulario (Autogenerado)</label>
                            <div className="mt-1 relative">
                                <input
                                    type="text"
                                    value={formData.formId}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-sm text-gray-500 cursor-not-allowed"
                                />
                                <span className="absolute right-2 top-2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('fields')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'fields' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Configuración de campos (A)
                        </button>
                        <button
                            onClick={() => setActiveTab('layout')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'layout' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Configuración de diseño (B)
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'email' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Configuración de correo (C)
                        </button>
                    </nav>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 p-8 overflow-y-auto border-r border-gray-200 bg-white">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">
                        {activeTab === 'fields' && 'Editor de Campos'}
                        {activeTab === 'layout' && 'Diseño del Widget'}
                        {activeTab === 'email' && 'Configuración de Email'}
                    </h2>

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

                {/* Live Preview Area */}
                <div className="w-[400px] bg-gray-100 flex flex-col hidden lg:flex relative">
                    <div className="p-4 bg-gray-200 border-b border-gray-300 text-center text-gray-600 font-medium text-sm">
                        Vista Previa en Vivo
                    </div>
                    {/* Simulator Container */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                        {/* Wrapper to simulate the page corner for floating widgets */}
                        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        {/* IMPORTANT: This container acts as the 'body' for fixed positioning simulation if we were using absolute. 
                           However, FormWidget uses 'fixed'. 
                           To simulate 'fixed' inside this div, we can use a transform scale or just let it float.
                           Since 'fixed' is relative to viewport, a true simulation needs an iframe or `transform: translateZ(0)` to limit scope?
                           Actually, 'fixed' inside a transformed element behaves like absolute. Let's try to contain it. 
                        */}
                        <div className="relative w-full h-full transform translate-0"> {/* This enforces fixed context */}
                            <FormWidget
                                formId={formData.formId}
                                websiteId={user?.websites?.[0]}
                                token={null}
                                config={formData} // Direct injection
                                isPreview={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
