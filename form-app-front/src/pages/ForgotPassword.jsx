import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { forgotPassword, isLoading } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        try {
            await forgotPassword(email);
            setMessage('Correo de restablecimiento enviado. Revisa tu bandeja de entrada.');
            setEmail('');
        } catch (err) {
           
            setError(err.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Restablecer contraseña</h2>
                <p className="text-center text-gray-700 mb-8">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

                {message && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-100 text-sm text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 placeholder-gray-400 transition duration-200"
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                </form>

                <div className="mt-8 text-center text-white/70 text-sm">
                    <Link to="/login" className="text-primary font-semibold hover:underline flex items-center justify-center gap-2">
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
