


const SectionFields = ({ fields, onChange }) => {

    const addField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            type: 'text',
            label: 'Nuevo Campo',
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
        const newFields = fields.filter((_, i) => i !== index);
        onChange(newFields);
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
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Campos del Formulario</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{fields.length} campos</span>
            </div>

            <div className="space-y-3">
                {fields.length === 0 && (
                    <div className="text-center py-12 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={addField}>
                        <div className="mb-3 text-gray-400">
                            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Tu formulario está vacío</p>
                        <p className="text-xs text-gray-400 mt-1">Haz clic para añadir tu primer campo</p>
                    </div>
                )}

                {fields.map((field, index) => (
                    <div key={field.id} className="group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="cursor-move text-gray-300 hover:text-gray-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{field.label || 'Sin etiqueta'}</p>
                                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{field.type}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => moveField(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1.5 text-gray-400 hover:text-[#00C896] hover:bg-[#E6F8F3] rounded-lg disabled:opacity-20 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                                </button>
                                <button
                                    onClick={() => moveField(index, 'down')}
                                    disabled={index === fields.length - 1}
                                    className="p-1.5 text-gray-400 hover:text-[#00C896] hover:bg-[#E6F8F3] rounded-lg disabled:opacity-20 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={() => removeField(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Editor Inputs */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-1 focus:ring-[#00C896] focus:border-[#00C896] outline-none transition-all placeholder-gray-400"
                                    placeholder="Etiqueta del campo"
                                />
                            </div>

                            <div>
                                <select
                                    value={field.type}
                                    onChange={(e) => updateField(index, { type: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 focus:bg-white focus:ring-1 focus:ring-[#00C896] focus:border-[#00C896] outline-none transition-all"
                                >
                                    <option value="text">Texto</option>
                                    <option value="email">Email</option>
                                    <option value="textarea">Área Texto</option>
                                    <option value="number">Número</option>
                                    <option value="select">Selección</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={field.width}
                                    onChange={(e) => updateField(index, { width: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 focus:bg-white focus:ring-1 focus:ring-[#00C896] focus:border-[#00C896] outline-none transition-all"
                                >
                                    <option value="100%">Ancho 100%</option>
                                    <option value="50%">Ancho 50%</option>
                                </select>
                            </div>

                            {field.type === 'select' && (
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        value={field.options}
                                        onChange={(e) => updateField(index, { options: e.target.value })}
                                        className="w-full px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                        placeholder="Opciones: Opción A, Opción B..."
                                    />
                                </div>
                            )}

                            <div className="col-span-2 flex items-center mt-1">
                                <label className="flex items-center cursor-pointer group/check">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={field.required}
                                            onChange={(e) => updateField(index, { required: e.target.checked })}
                                        />
                                        <div className={`w-4 h-4 border rounded transition-colors ${field.required ? 'bg-[#00C896] border-[#00C896]' : 'border-gray-300 bg-white'}`}></div>
                                        {field.required && (
                                            <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </div>
                                    <span className={`ml-2 text-xs font-medium transition-colors ${field.required ? 'text-[#00C896]' : 'text-gray-500 group-hover/check:text-gray-700'}`}>
                                        Marcar como obligatorio
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addField}
                className="w-full py-3 bg-gray-50 hover:bg-[#E6F8F3] hover:text-[#00C896] border border-dashed border-gray-300 hover:border-[#00C896] rounded-xl text-gray-500 font-medium text-sm transition-all flex items-center justify-center space-x-2 group mt-4"
            >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                <span>Añadir Nuevo Campo</span>
            </button>
        </div>
    );
};

export default SectionFields;



