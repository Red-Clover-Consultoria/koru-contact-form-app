import { create } from 'zustand';
import api from '../services/api';

const useFormStore = create((set, get) => ({
    forms: [],
    isLoading: false,
    error: null,
    // Public form config state
    formConfig: null,
    token: null,

    fetchForms: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/forms');
            set({ forms: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch forms',
                isLoading: false
            });
        }
    },

    deleteForm: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/forms/${id}`);
            set(state => ({
                forms: state.forms.filter(f => (f.id || f._id) !== id),
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete form',
                isLoading: false
            });
            get().fetchForms();
        }
    },

    createForm: async (formData) => {
        const response = await api.post('/forms', formData);
        set(state => ({ forms: [...state.forms, response.data] }));
        return response.data;
    },

    updateForm: async (id, formData) => {
        const response = await api.patch(`/forms/${id}`, formData);
        set(state => ({
            forms: state.forms.map(f => (f.id || f._id) === id ? response.data : f)
        }));
        return response.data;
    },

    activateForm: async (id, websiteId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.patch(`/forms/${id}/activate`, { websiteId });
            set(state => ({
                forms: state.forms.map(f => (f.id || f._id) === id ? response.data : f),
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to activate form',
                isLoading: false
            });
            throw error;
        }
    },

    // Centralized fetchConfig according to guide
    fetchConfig: async (formId, propToken) => {
        set({ isLoading: true, error: null });
        try {
            const headers = propToken ? { 'X-Koru-Token': propToken } : {};
            // Volvemos a la versión funcional: Sin prefijo /api para la configuración pública
            const response = await api.get(`/forms/config/${formId}`, { headers });

            const { token, ...config } = response.data;

            if (!token && !propToken) {
                console.error("Formulario no autorizado: Token no recibido");
                set({ isLoading: false });
                return null;
            }

            const activeToken = token || propToken;
            set({ formConfig: config, token: activeToken, isLoading: false });

            return { config, token: activeToken };
        } catch (error) {
            console.error("fetchConfig Error:", error.response?.data || error.message);
            set({
                error: error.response?.data?.message || error.message || 'Error al cargar configuración',
                isLoading: false
            });
            throw error;
        }
    },

    checkPermissions: async (id) => {
        try {
            const response = await api.get(`/forms/${id}/validate-permissions`);
            return response.data; // { authorized: true }
        } catch (error) {
            console.error('Permission check failed:', error);
            return { authorized: false };
        }
    }
}));

export default useFormStore;