import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login, isLoading, error: storeError } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
            <div className="w-full max-w-md p-6 md:p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        <span className="text-[#00C896]">Koru</span> Forms
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">Welcome back</p>
                </div>

                {(error || storeError) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error || storeError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1 uppercase tracking-wide">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-4 bg-[#00C896] hover:bg-[#00A080] text-white font-medium rounded-lg shadow-sm transform transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </div>
                        ) : 'Sign In'}
                    </button>
                </form>

                {/* Footer copy removed or minimized to keep it clean */}
            </div>
        </div>
    );
};

export default Login;
