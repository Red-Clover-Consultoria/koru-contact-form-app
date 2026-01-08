import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';

const Submissions = () => {
    const { id } = useParams(); // formId
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
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

        if (id) {
            fetchSubmissions();
        }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-500">
            {error}
            <br />
            <Link to="/dashboard" className="text-indigo-600 underline mt-4 inline-block">Volver al Dashboard</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
                            &larr; Volver al Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Envíos del Formulario</h1>
                        <p className="text-gray-500 mt-1">ID: {id}</p>
                    </div>
                    {/* Minimalist Action (Export placeholder?) */}
                    <button
                        onClick={() => Swal.fire('Pendiente', 'Función de exportar pendiente', 'info')}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Exportar CSV
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {submissions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay envíos</h3>
                            <p className="mt-1 text-sm text-gray-500">Aún no se han recibido respuestas para este formulario.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Datos del Envío
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Estado Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Metadata
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sub.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="space-y-1">
                                                    {Object.entries(sub.data || {}).map(([key, value]) => (
                                                        <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                                                            <span className="font-medium text-gray-600 min-w-[80px]">{key}:</span>
                                                            <span className="text-gray-800">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {sub.mail_log?.success === false ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Fallido
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Enviado
                                                    </span>
                                                )}
                                                {sub.is_spam && (
                                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Spam
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 md:w-1/4">
                                                <div className="text-xs space-y-1 break-words">
                                                    <p><span className="font-medium text-gray-600">IP:</span> {sub.metadata?.ip}</p>
                                                    <p><span className="font-medium text-gray-600">User-Agent:</span> {sub.metadata?.userAgent?.substring(0, 30)}...</p>
                                                    <p><span className="font-medium text-gray-600">Origen:</span> {sub.metadata?.url}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
