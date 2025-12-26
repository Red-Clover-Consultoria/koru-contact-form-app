import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFormStore from '../stores/useFormStore';
import useAuthStore from '../stores/useAuthStore';
import EmbedCodeModal from '../components/EmbedCodeModal';

const Dashboard = () => {
    const { forms, fetchForms, deleteForm, activateForm, isLoading, error } = useFormStore();
    const { user } = useAuthStore();
    const [selectedForm, setSelectedForm] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Koru Context simulation (assuming user login provided this)
    const koruContext = {
        app_id: "7fd1463d-cd54-420d-afc0-c874879270cf",
        website: {
            id: "6d4b69b6-9a9e-436a-8216-7398a210b7ef",
            url: "https://test.com"
        }
    };

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este formulario?')) {
            await deleteForm(id);
        }
    };

    const handleOpenEmbed = (form) => {
        setSelectedForm(form);
        setIsModalOpen(true);
    };

    const handleActivate = async (id) => {
        try {
            await activateForm(id, koruContext.website.id);
            alert('¡Formulario activado con éxito!');
        } catch (err) {
            alert('Error al activar: ' + err.message);
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
                                    const isActive = form.status === 'active';
                                    return (
                                        <tr key={form.id || form._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{form.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{form.formId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className={`px-2 py-1 flex items-center w-fit text-xs leading-5 font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        <span className={`w-2 h-2 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {!isActive && (
                                                        <span className="text-[10px] text-gray-400 mt-1 italic">Pendiente de activación</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                {isActive ? (
                                                    <button
                                                        onClick={() => handleOpenEmbed(form)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                                    >
                                                        Embed Code
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(form.id || form._id)}
                                                        className="text-green-600 hover:text-green-900 font-semibold"
                                                    >
                                                        Activar en Koru
                                                    </button>
                                                )}
                                                <Link to={`/forms/${form.id || form._id}`} className="text-primary hover:underline">
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(form.id || form._id)}
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
                    websiteId={koruContext.website.id}
                    appId={koruContext.app_id}
                />
            )}
        </div>
    );
};

export default Dashboard;
