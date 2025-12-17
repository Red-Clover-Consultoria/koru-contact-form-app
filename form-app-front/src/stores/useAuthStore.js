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
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.register(name, email, password);
            set({ isLoading: false });
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
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
                error: error.response?.data?.message || 'Failed to send reset email',
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
                error: error.response?.data?.message || 'Failed to reset password',
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
