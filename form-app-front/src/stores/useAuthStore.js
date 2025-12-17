import { create } from 'zustand';
import Cookies from 'js-cookie';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
    user: null,
    token: Cookies.get('token') || null,
    isAuthenticated: !!Cookies.get('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.login(email, password);
            // Assuming data contains { token, user }
            const { token, user } = data;

            Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
            set({ token, user, isAuthenticated: true, isLoading: false });
            return user; // Return user for redirection logic
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error al iniciar sesión',
                isLoading: false
            });
            throw error;
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.forgotPassword(email);
            set({ isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error al enviar el correo de restablecimiento',
                isLoading: false
            });
            throw error;
        }
    },

    resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.resetPassword(token, newPassword);
            set({ isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error al restablecer la contraseña',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        Cookies.remove('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    hydrate: async () => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const user = await authService.getMe();
                set({ user, isAuthenticated: true });
            } catch (error) {
                // If token is invalid, logout
                get().logout();
            }
        }
    },
}));

export default useAuthStore;
