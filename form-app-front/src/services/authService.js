import api from './api';

const login = async (email, password) => {
    // El backend acepta `email` o `username`. Enviamos `email` como `username`
    // para ser compatibles con el DTO actual.
    const response = await api.post('/auth/login', { username: email, password });
    return response.data;
};


const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

const resetPassword = async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
};

export default {
    login,
    getMe,
    forgotPassword,
    resetPassword,
};
