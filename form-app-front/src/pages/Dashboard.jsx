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
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await deleteForm(id);
            Swal.fire(
                '¡Eliminado!',
                'El formulario ha sido eliminado.',
                'success'
            );
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis formularios</h1>
                <Link
                    to="/forms/new"
                    className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:opacity-90 transition-colors"
                >
                    Crear formulario
                </Link>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading && forms.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                    {forms.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID del formulario
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {forms.map((form) => {
                                    // isActive es el flag maestro del Cron (Website válido)
                                    // status: 'active' es la activación manual
                                    const isGlobalActive = form.isActive !== false;
                                    const isFormActive = form.status === 'active';
                                    const currentId = form.id || form._id;
                                    const targetWebsiteId = form.website_id || user?.websites?.[0] || koruContext.website.id;

                                    return (
                                        <tr key={currentId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{form.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{form.formId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    {!isGlobalActive ? (
                                                        <span className="px-2 py-1 flex items-center w-fit text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            <span className="w-2 h-2 rounded-full mr-1.5 bg-red-500"></span>
                                                            Sitio Inactivo
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 flex items-center w-fit text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            <span className="w-2 h-2 rounded-full mr-1.5 bg-green-500"></span>
                                                            Activo
                                                        </span>
                                                    )}

                                                    {!isGlobalActive && (
                                                        <span className="text-[10px] text-red-400 mt-1 italic">Sitio Inactivo en Koru Suite</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                {isGlobalActive ? (
                                                    <button
                                                        onClick={() => handleOpenEmbed(form)}
                                                        disabled={isValidating}
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold disabled:opacity-50"
                                                    >
                                                        {isValidating ? 'Validando...' : 'Código Embebido'}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 cursor-not-allowed italic text-xs">Aviso: Sitio Inactivo en Koru Suite</span>
                                                )}
                                                <Link to={`/forms/${currentId}`} className="text-primary hover:underline">
                                                    Editar
                                                </Link>
                                                <Link to={`/forms/${currentId}/submissions`} className="text-gray-600 hover:text-gray-900 font-medium">
                                                    Ver Envíos
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(currentId)}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No se encontraron formularios.</p>
                            <p className="text-gray-400">Comienza creando uno nuevo.</p>
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
