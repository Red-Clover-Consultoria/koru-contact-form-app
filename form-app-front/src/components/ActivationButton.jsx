import React, { useState } from 'react';
import useFormStore from '../stores/useFormStore';

const ActivationButton = ({ formId, websiteId }) => {
    const { activateForm } = useFormStore();
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleActivate = async () => {
        if (!websiteId) {
            setStatus('error');
            setErrorMessage('Website ID no seleccionado');
            return;
        }

        setStatus('loading');
        setErrorMessage('');
        try {
            await activateForm(formId, websiteId);
            setStatus('success');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Error al activar el formulario');
        }
    };

    if (status === 'success') {
        return (
            <span className="text-green-600 font-semibold flex items-center">
                <span className="mr-1">✓</span> Activado
            </span>
        );
    }

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={handleActivate}
                disabled={status === 'loading'}
                className={`text-sm font-semibold px-3 py-1 rounded transition-all ${status === 'loading'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:bg-green-50 border border-green-200'
                    }`}
            >
                {status === 'loading' ? (
                    <span className="flex items-center">
                        <svg className="animate-spin h-3 w-3 mr-2 text-gray-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Activando...
                    </span>
                ) : 'Activar en Koru'}
            </button>
            {status === 'error' && (
                <span className="text-[10px] text-red-500 mt-1 max-w-[150px] text-right font-medium">
                    {errorMessage}
                </span>
            )}
        </div>
    );
};

export default ActivationButton;
