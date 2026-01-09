const SectionLayout = ({ settings, onChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...settings, [name]: value });
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900">Configuración de diseño</h3>
            <p className="text-sm text-gray-500">Personaliza cómo aparece el formulario en tu sitio.</p>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Tipo de visualización</label>
                    <select
                        name="display_type"
                        value={settings.display_type}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        {/* Deben coincidir con el enum del backend */}
                        <option value="Inline">En línea (Insertar)</option>
                        <option value="Floating">Botón flotante</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Posición</label>
                    <select
                        name="position"
                        value={settings.position}
                        onChange={handleChange}
                        disabled={settings.display_type === 'Inline'}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        {/* Deben coincidir con el enum del backend */}
                        <option value="Bottom-Right">Inferior derecha</option>
                        <option value="Bottom-Left">Inferior izquierda</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Icono del globo</label>
                    <select
                        name="bubble_icon"
                        value={settings.bubble_icon}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        {/* Enum backend: 'Envelope', 'Chat', 'User', 'Question' */}
                        <option value="Envelope">Sobre</option>
                        <option value="Chat">Chat</option>
                        <option value="User">Usuario</option>
                        <option value="Question">Pregunta</option>
                    </select>
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Color principal</label>
                    <div className="mt-1 flex items-center space-x-3">
                        <input
                            type="color"
                            name="accent_color"
                            value={settings.accent_color}
                            onChange={handleChange}
                            className="h-8 w-8 rounded-full border border-gray-300 p-0 overflow-hidden"
                        />
                        <input
                            type="text"
                            name="accent_color"
                            value={settings.accent_color}
                            onChange={handleChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border px-3 py-2"
                        />
                    </div>
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Texto del botón de envío</label>
                    <input
                        type="text"
                        name="submit_text"
                        value={settings.submit_text}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Mensaje de éxito</label>
                    <textarea
                        name="success_msg"
                        rows={3}
                        value={settings.success_msg || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="¡Gracias! Nos pondremos en contacto pronto."
                    />
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">URL de redirección (opcional)</label>
                    <input
                        type="url"
                        name="redirect_url"
                        value={settings.redirect_url || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="https://ejemplo.com/gracias"
                    />
                </div>
            </div>
        </div>
    );
};

export default SectionLayout;
