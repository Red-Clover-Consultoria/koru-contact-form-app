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
            setError('Please enter your email address');
            return;
        }

        try {
            await forgotPassword(email);
            setMessage('Password reset email sent. Please check your inbox.');
            setEmail('');
        } catch (err) {
            // Error is handled in store but we catch here to prevent crash
            // and maybe show generic error if store doesn't set it (though store does set it)
            // We rely on the local error state too if we want, or just store error.
            // But the component uses local error for validation.
            // We'll use the local error state for API errors too for simplicity 
            // or fetch from store. Let's rely on catch block.
            setError(err.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-center text-white mb-4">Reset Password</h2>
                <p className="text-center text-white/70 mb-8">Enter your email and we'll send you a link to reset your password.</p>

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
                        <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-white placeholder-white/50 transition duration-200"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center text-white/70 text-sm">
                    <Link to="/login" className="text-white font-semibold hover:underline flex items-center justify-center gap-2">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
