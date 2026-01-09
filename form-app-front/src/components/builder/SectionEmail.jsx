const SectionEmail = ({ settings, onChange }) => {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onChange({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900">Notificaciones por correo</h3>
            <p className="text-sm text-gray-500">Configura a dónde se enviarán las respuestas.</p>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Correo(s) administrador</label>
                    <input
                        type="text"
                        name="admin_email"
                        value={settings.admin_email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="admin@example.com, support@example.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separe múltiples correos con comas.</p>
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Asunto</label>
                    <input
                        type="text"
                        name="subject_line"
                        value={settings.subject_line}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {/* <p className="mt-1 text-xs text-gray-500">Puedes usar variables como {'{{Name}}'} que coincidan con las etiquetas de los campos.</p> */}
                </div>

                <div className="sm:col-span-6">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="autoresponder"
                                name="autoresponder"
                                type="checkbox"
                                checked={settings.autoresponder}
                                onChange={handleChange}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="autoresponder" className="font-medium text-gray-700">Activar autorespuesta</label>
                            <p className="text-gray-500">Enviar un correo de confirmación al usuario que envió el formulario (requiere un campo 'Correo').</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionEmail;
