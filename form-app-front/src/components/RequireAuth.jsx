import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const RequireAuth = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        // Or a spinner component
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
