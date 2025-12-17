const SectionLayout = ({ settings, onChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange({ ...settings, [name]: value });
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900">Layout Settings</h3>
            <p className="text-sm text-gray-500">Customize how the form appears on your website.</p>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Display Type</label>
                    <select
                        name="display_type"
                        value={settings.display_type}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        {/* Deben coincidir con el enum del backend: 'Inline', 'Floating', 'Popup' */}
                        <option value="Inline">Inline (Embed)</option>
                        <option value="Floating">Floating Button</option>
                        <option value="Popup">Popup / Widget</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <select
                        name="position"
                        value={settings.position}
                        onChange={handleChange}
                        disabled={settings.display_type === 'Inline'}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        {/* Deben coincidir con el enum del backend: 'Bottom-Right', 'Bottom-Left' */}
                        <option value="Bottom-Right">Bottom Right</option>
                        <option value="Bottom-Left">Bottom Left</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Bubble Icon</label>
                    <select
                        name="bubble_icon"
                        value={settings.bubble_icon}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        {/* Enum backend: 'Envelope', 'Chat', 'User', 'Question' */}
                        <option value="Envelope">Envelope</option>
                        <option value="Chat">Chat</option>
                        <option value="User">User</option>
                        <option value="Question">Question</option>
                    </select>
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Accent Color</label>
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
                    <label className="block text-sm font-medium text-gray-700">Submit Button Text</label>
                    <input
                        type="text"
                        name="submit_text"
                        value={settings.submit_text}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Success Message</label>
                    <textarea
                        name="success_msg"
                        rows={3}
                        value={settings.success_msg || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Thank you! We will contact you soon."
                    />
                </div>

                <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Redirect URL (Optional)</label>
                    <input
                        type="url"
                        name="redirect_url"
                        value={settings.redirect_url || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="https://example.com/thank-you"
                    />
                </div>
            </div>
        </div>
    );
};

export default SectionLayout;
