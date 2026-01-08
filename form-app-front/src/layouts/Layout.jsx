import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { useState } from 'react';

const Layout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="flex items-center justify-center h-20 border-b border-gray-50">
                    <Link to="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00C896] to-[#00A080]">
                        Koru Forms
                    </Link>
                </div>

                {/* Navigation */}
                {/* Navigation */}
                <nav className="p-4 space-y-2 mt-4">
                    <Link
                        to="/dashboard"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/dashboard')
                            ? 'bg-[#E6F8F3] text-[#00C896]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Dashboard
                    </Link>

                    {/* Form Builder - Linking to New for now, or maybe list? Usually builder implies 'edit'. 
                        But without specific ID contexts in sidebar, 'New' is the safest 'Builder' entry point or 'My Forms' */}
                    <Link
                        to="/forms/new"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/forms/new')
                            ? 'bg-[#E6F8F3] text-[#00C896]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Form Builder
                    </Link>

                    <Link
                        to="/submissions"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive('/submissions')
                            ? 'bg-[#E6F8F3] text-[#00C896]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        Submissions
                    </Link>
                </nav>

                {/* User Profile / Logout (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900 truncate w-32">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate w-32">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 z-40 transition-all duration-200">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100/50 hover:text-[#00C896] transition-colors active:scale-95"
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[#00C896] to-emerald-600 tracking-tight">Koru Forms</span>
                </div>

                {/* Mobile Profile Icon (Optional, keeping it simple as requested) */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C896] to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                <div className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-10 scroll-smooth mt-16 lg:mt-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
export default Layout;
