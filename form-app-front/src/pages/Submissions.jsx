import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const Submissions = () => {
    const { id } = useParams(); // formId, optional now
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock Data for Global View (Visual Structure Phase)
    const mockGlobalSubmissions = [
        {
            _id: 'sub-001',
            formId: 'koru-a1b2c3',
            formTitle: 'Contacto Principal',
            data: { email: 'juan@ejemplo.com', nombre: 'Juan Perez' },
            metadata: { url: 'https://miwebsite.com/contacto' },
            createdAt: new Date().toISOString()
        },
        {
            _id: 'sub-002',
            formId: 'koru-d4e5f6',
            formTitle: 'Newsletter Signup',
            data: { email: 'maria@ejemplo.com', newsletter: 'yes' },
            metadata: { url: 'https://miwebsite.com' },
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            _id: 'sub-003',
            formId: 'koru-a1b2c3',
            formTitle: 'Contacto Principal',
            data: { email: 'carlos@ejemplo.com', message: 'Hola' },
            metadata: { url: 'https://miwebsite.com/contacto' },
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            _id: 'sub-004',
            formId: 'koru-g7h8i9',
            formTitle: 'Soporte Técnico',
            data: { email: 'ana@ejemplo.com', issue: 'Login' },
            metadata: { url: 'https://miwebsite.com/soporte' },
            createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            _id: 'sub-005',
            formId: 'koru-d4e5f6',
            formTitle: 'Newsletter Signup',
            data: { email: 'pedro@ejemplo.com' },
            metadata: { url: 'https://miwebsite.com/blog' },
            createdAt: new Date(Date.now() - 200000000).toISOString()
        }
    ];

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!id) {
                // Global View: Use Mock Data for now as per instructions
                // "Nota: Por ahora, solo construye la estructura visual prolija"
                setTimeout(() => {
                    setSubmissions(mockGlobalSubmissions);
                    setLoading(false);
                }, 500);
                return;
            }

            try {
                // Endpoint defined in backend: GET /forms/:formId/submissions
                const response = await api.get(`/forms/${id}/submissions`);
                setSubmissions(response.data);
            } catch (err) {
                console.error("Error loading submissions:", err);
                setError("Error al cargar los envíos.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [id]);

    const getEmail = (data) => {
        if (!data) return '-';
        // Case insensitive search for email keys
        const emailKey = Object.keys(data).find(k => k.toLowerCase().includes('mail'));
        return emailKey ? data[emailKey] : (Object.values(data)[0] || '-');
    };

    const handleViewData = (sub) => {
        Swal.fire({
            title: 'Detalles del Envío',
            html: `
                <div class="text-left bg-gray-50 p-4 rounded-lg text-sm">
                    ${Object.entries(sub.data || {}).map(([k, v]) => `
                        <div class="mb-2">
                            <span class="font-bold text-gray-700 block capitalize">${k}:</span>
                            <span class="text-gray-600">${v}</span>
                        </div>
                    `).join('')}
                    <hr class="my-3 border-gray-200"/>
                    <div class="text-xs text-gray-400">
                        <p>IP: ${sub.metadata?.ip || 'N/A'}</p>
                        <p>UA: ${sub.metadata?.userAgent || 'N/A'}</p>
                    </div>
                </div>
            `,
            confirmButtonColor: '#00C896',
            confirmButtonText: 'Cerrar'
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00C896]"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {id && (
                            <Link to="/dashboard" className="text-gray-400 hover:text-[#00C896] mb-2 inline-flex items-center transition-colors">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Volver al Dashboard
                            </Link>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Registro de Envíos</h1>
                        <p className="text-gray-500 mt-1">{submissions.length} envíos totales</p>
                    </div>
                    {/* Minimalist Action */}
                    <button
                        onClick={() => Swal.fire('Pendiente', 'Función de exportar pendiente', 'info')}
                        className="px-4 py-2 bg-[#00C896] hover:bg-[#00A080] text-white rounded-lg shadow-sm text-sm font-medium transition flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Exportar CSV
                    </button>
                </div>

                {/* Filters Row (Simplified) */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex justify-between items-center">
                    <div className="relative w-96">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896] transition-all"
                            placeholder="Buscar por email, formulario o URL..."
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            Todos los formularios
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {submissions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay envíos</h3>
                            <p className="mt-1 text-sm text-gray-500">Aún no se han recibido respuestas.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-white">
                                    <tr>
                                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            ID / Formulario
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            URL de Origen
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Datos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {submissions.map((sub) => {
                                        const email = getEmail(sub.data);
                                        const formTitle = sub.formTitle || (id ? 'Formulario Actual' : 'Formulario');
                                        const formIdSimple = sub.formId || id || sub.form_id || 'unknown';
                                        const shortId = sub._id.substring(sub._id.length - 6);

                                        return (
                                            <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded w-fit mb-1">{shortId}</span>
                                                        <span className="text-sm font-medium text-gray-900">{formTitle}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-[#00C896]/10 text-[#00C896] flex items-center justify-center text-xs font-bold mr-3">
                                                            {email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-gray-700">{email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <a href={sub.metadata?.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#06B6D4] hover:underline truncate max-w-[200px] block">
                                                        {sub.metadata?.url || '-'}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        {new Date(sub.createdAt).toLocaleDateString('es-ES', {
                                                            day: 'numeric', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleViewData(sub)}
                                                        className="font-medium text-[#00C896] hover:text-[#00A080] flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        Ver datos
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Submissions;
