import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFormStore from '../stores/useFormStore';
import useAuthStore from '../stores/useAuthStore';
import EmbedCodeModal from '../components/EmbedCodeModal';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const { forms, fetchForms, deleteForm, isLoading, error } = useFormStore();
    const { user, websites } = useAuthStore();
    const [selectedForm, setSelectedForm] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Koru Context simulation (Real credentials for local test)
    const koruContext = {
        app_id: "efc7cd83-aa52-4f3a-b803-4aec7d3be35d",
        website: {
            id: websites?.[0] || "50dc4ac0-4eae-4f45-80d5-c30bf452066",
            url: "https://www.redclover.com.ar"
        }
    };

    const [isValidating, setIsValidating] = useState(false);
    const { checkPermissions } = useFormStore();

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "El formulario se moverá a la papelera. Podrás seguir viendo sus envíos.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#e5e7eb',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'px-4 py-2 rounded-lg font-medium',
                cancelButton: 'px-4 py-2 rounded-lg font-medium text-gray-700'
            }
        });

        if (result.isConfirmed) {
            await deleteForm(id);
            Swal.fire({
                title: '¡Eliminado!',
                text: 'El formulario ha sido eliminado.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const handleOpenEmbed = async (form) => {
        setIsValidating(true);
        // El websiteId del formulario es prioritario, si no, el primer website del usuario
        const targetWebsiteId = form.website_id || user?.websites?.[0] || koruContext.website.id;

        const result = await checkPermissions(form.id || form._id);
        setIsValidating(false);

        if (result && result.authorized) {
            setSelectedForm({ ...form, website_id: targetWebsiteId });
            setIsModalOpen(true);
        } else {
            Swal.fire('Acceso denegado', 'No tienes permisos suficientes en Koru Suite para este formulario o sitio.', 'error');
        }
    };

    return (
        <div>
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-8">
                {/* Metric Cards Row - Inserted here before the list */}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Formularios Activos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{forms.filter(f => f.status === 'active').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E6F8F3] rounded-xl flex items-center justify-center text-[#00C896]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Websites Activos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{user?.websites?.length || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E1F5FD] rounded-xl flex items-center justify-center text-[#06B6D4]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Envíos Totales</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{forms.reduce((acc, f) => acc + (f.submissions_count || 0), 0)}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#E6F8F3] rounded-xl flex items-center justify-center text-[#00C896]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Listado de Formularios</h2>
                <Link
                    to="/forms/new"
                    className="px-5 py-2.5 bg-[#00C896] hover:bg-[#00A080] text-white text-sm font-medium rounded-lg shadow-sm transform transition hover:-translate-y-0.5 flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Crear Formulario
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            {isLoading && forms.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {forms.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-white">
                                <tr>
                                    <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Título del Form
                                    </th>
                                    <th scope="col" className="hidden md:table-cell px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        ID Único
                                    </th>
                                    <th scope="col" className="hidden md:table-cell px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Estado de Salud
                                    </th>
                                    <th scope="col" className="hidden md:table-cell px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Websites
                                    </th>
                                    <th scope="col" className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Envíos
                                    </th>
                                    <th scope="col" className="relative px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {forms.map((form) => {
                                    // isDeleted visual handling
                                    const isDeleted = form.isDeleted === true;
                                    const isGlobalActive = form.isActive !== false;
                                    const currentId = form.id || form._id;

                                    // Mock data for UI if missing
                                    const submissionsCount = form.submissions_count !== undefined ? form.submissions_count : Math.floor(Math.random() * 50);
                                    const websitesCount = form.website_id ? 1 : 0; // Simple logic for now

                                    // Row styling for deleted
                                    const rowClass = isDeleted ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50 transition-colors';

                                    return (
                                        <tr key={currentId} className={rowClass}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{form.title}</div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit text-xs">{form.formId}</div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {isDeleted ? (
                                                        <div className="flex items-center text-xs font-medium text-gray-500">
                                                            <span className="w-2 h-2 rounded-full mr-2 bg-gray-400"></span>
                                                            Eliminado
                                                        </div>
                                                    ) : (
                                                        !isGlobalActive ? (
                                                            <div className="flex items-center text-xs font-medium text-gray-500">
                                                                <span className="w-2 h-2 rounded-full mr-2 bg-gray-400"></span>
                                                                Inactivo
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-xs font-medium text-[#00C896]">
                                                                <span className="w-2 h-2 rounded-full mr-2 bg-[#00C896]"></span>
                                                                Activo
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                {websitesCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                {submissionsCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {/* Edit */}
                                                    {!isDeleted && (
                                                        <Link to={`/forms/${currentId}`} className="text-gray-400 hover:text-[#00C896] transition-colors" title="Editar">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </Link>
                                                    )}

                                                    {/* Embed Code */}
                                                    {!isDeleted && isGlobalActive ? (
                                                        <button
                                                            onClick={() => handleOpenEmbed(form)}
                                                            disabled={isValidating}
                                                            className="text-gray-400 hover:text-[#00C896] disabled:opacity-50 transition-colors"
                                                            title="Obtener código (Embed)"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                        </button>
                                                    ) : null}

                                                    {/* Submissions (Always Visible) */}
                                                    <Link to={`/forms/${currentId}/submissions`} className="text-gray-400 hover:text-[#00C896] transition-colors" title="Ver Envíos">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    </Link>

                                                    {/* Delete */}
                                                    {!isDeleted && (
                                                        <button
                                                            onClick={() => handleDelete(currentId)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <p className="text-gray-900 font-medium text-lg">No se encontraron formularios</p>
                            <p className="text-gray-500 mt-1">Comienza creando tu primer formulario de contacto</p>
                            <Link to="/forms/new" className="mt-6 inline-block px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                                Crear ahora
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && selectedForm && (
                <EmbedCodeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    formId={selectedForm.formId}
                    websiteId={selectedForm.website_id || koruContext.website.id}
                    appId={koruContext.app_id}
                />
            )}
        </div>
    );
};

export default Dashboard;
