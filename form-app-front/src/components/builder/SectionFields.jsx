

const SectionFields = ({ fields, onChange }) => {

    const addField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            type: 'text',
            label: 'New Field',
            required: false,
            width: '100%',
            options: '', // for select inputs
        };
        onChange([...fields, newField]);
    };

    const updateField = (index, updates) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        onChange(newFields);
    };

    const removeField = (index) => {
        if (window.confirm('Delete this field?')) {
            const newFields = fields.filter((_, i) => i !== index);
            onChange(newFields);
        }
    };

    const moveField = (index, direction) => {
        if (direction === 'up' && index > 0) {
            const newFields = [...fields];
            [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
            onChange(newFields);
        } else if (direction === 'down' && index < fields.length - 1) {
            const newFields = [...fields];
            [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
            onChange(newFields);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
                <div>
                        <h3 className="text-lg font-medium text-gray-900">Campos del formulario</h3>
                        <p className="text-sm text-gray-500">Añade y configura los campos para tu formulario.</p>
                </div>
                <button
                    onClick={addField}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 shadow flex items-center"
                >
                    <span className="mr-2">+</span> Add Field
                </button>
            </div>

            <div className="space-y-4">
                {fields.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">No hay campos añadidos aún.</p>
                    </div>
                )}

                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative transition hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                    {field.type}
                                </span>
                                <span className="font-semibold text-gray-700">{field.label}</span>
                                {field.required && <span className="text-red-500 text-xs">*Obl.</span>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => moveField(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    title="Subir"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => moveField(index, 'down')}
                                    disabled={index === fields.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    title="Bajar"
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={() => removeField(index)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                        title="Eliminar"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Editor Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-3 rounded-md">
                            <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Etiqueta</label>
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs border px-2 py-1"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                <select
                                    value={field.type}
                                    onChange={(e) => updateField(index, { type: e.target.value })}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs border px-2 py-1"
                                >
                                    <option value="text">Texto</option>
                                    <option value="email">Correo</option>
                                    <option value="textarea">Área de texto</option>
                                    <option value="number">Número</option>
                                    <option value="select">Seleccionar</option>
                                    <option value="checkbox">Casilla</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">ID (Clave)</label>
                                <input
                                    type="text"
                                    value={field.id} // Not ideal to edit ID if used as key, but helpful for custom keys
                                    onChange={(e) => updateField(index, { id: e.target.value })}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs border px-2 py-1"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Ancho</label>
                                <select
                                    value={field.width}
                                    onChange={(e) => updateField(index, { width: e.target.value })}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs border px-2 py-1"
                                >
                                    <option value="100%">100%</option>
                                    <option value="50%">50%</option>
                                </select>
                            </div>

                            <div className="md:col-span-1 flex items-center justify-center pt-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(index, { required: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="text-xs text-gray-700">Obl.</span>
                                </label>
                            </div>
                        </div>

                        {field.type === 'select' && (
                            <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Opciones (separadas por comas)</label>
                                <input
                                    type="text"
                                    value={field.options}
                                    onChange={(e) => updateField(index, { options: e.target.value })}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs border px-2 py-1"
                                    placeholder="Opción 1, Opción 2, Opción 3"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionFields;
