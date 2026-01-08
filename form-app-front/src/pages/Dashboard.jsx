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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis formularios</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus puntos de contacto</p>
                </div>
                <Link
                    to="/forms/new"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transform transition hover:-translate-y-0.5"
                >
                    + Nuevo formulario
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
                                    <th scope="col" className="px-8 py-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Form Title
                                    </th>
                                    <th scope="col" className="px-6 py-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Form ID
                                    </th>
                                    <th scope="col" className="px-6 py-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-8 py-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {forms.map((form) => {
                                    // isDeleted visual handling
                                    const isDeleted = form.isDeleted === true;
                                    const isGlobalActive = form.isActive !== false;
                                    const isFormActive = form.status === 'active';
                                    const currentId = form.id || form._id;

                                    // Row styling for deleted
                                    const rowClass = isDeleted ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50 transition-colors';

                                    return (
                                        <tr key={currentId} className={rowClass}>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{form.title}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit">{form.formId}</div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col items-start">
                                                    {isDeleted ? (
                                                        <span className="px-2.5 py-1 flex items-center w-fit text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                            <span className="w-1.5 h-1.5 rounded-full mr-2 bg-gray-400"></span>
                                                            Eliminado
                                                        </span>
                                                    ) : (
                                                        // This handles the 'isDeleted' true case if needed, but the structure was:
                                                        // isDeleted ? (deleted_span) : ( !isActive ? (inactive_span) : (active_span) )
                                                        // The previous replace removed the ") :" part. 
                                                        // I need to reconstruct the logic properly.
                                                        !isGlobalActive ? (
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-600 border border-red-100">
                                                                Inactive
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-600 border border-green-100">
                                                                Active
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-4">
                                                    {/* Embed Code */}
                                                    {!isDeleted && isGlobalActive ? (
                                                        <button
                                                            onClick={() => handleOpenEmbed(form)}
                                                            disabled={isValidating}
                                                            className="text-indigo-600 hover:text-indigo-900 font-semibold disabled:opacity-50 transition-colors"
                                                            title="Obtener código"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                                        </button>
                                                    ) : null}

                                                    {/* Edit */}
                                                    {!isDeleted && (
                                                        <Link to={`/forms/${currentId}`} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Editar">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </Link>
                                                    )}

                                                    {/* Submissions (Always Visible) */}
                                                    <Link to={`/forms/${currentId}/submissions`} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Ver Envíos">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    </Link>

                                                    {/* Delete */}
                                                    {!isDeleted && (
                                                        <button
                                                            onClick={() => handleDelete(currentId)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
