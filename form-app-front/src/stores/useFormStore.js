import { create } from 'zustand';
import api from '../services/api';

const useFormStore = create((set, get) => ({
    forms: [],
    isLoading: false,
    error: null,

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
            // Optimistic update
            set(state => ({
                forms: state.forms.filter(f => f.id !== id),
                isLoading: false
            }));
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete form',
                isLoading: false
            });
            // Re-fetch to sync if failed
            get().fetchForms();
        }
    },

    // Create/Update actions can also be here or in the component/service
    createForm: async (formData) => {
        const response = await api.post('/forms', formData);
        set(state => ({ forms: [...state.forms, response.data] }));
        return response.data;
    },

    updateForm: async (id, formData) => {
        const response = await api.patch(`/forms/${id}`, formData);
        set(state => ({
            forms: state.forms.map(f => f.id === id ? response.data : f)
        }));
        return response.data;
    }
}));

export default useFormStore;
