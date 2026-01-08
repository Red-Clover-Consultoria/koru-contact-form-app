import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import Submissions from './pages/Submissions';
import WidgetPreview from './pages/WidgetPreview';
import Layout from './layouts/Layout';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forms/new" element={<FormBuilder />} />
            <Route path="/forms/:id" element={<FormBuilder />} />
            <Route path="/forms/:id/submissions" element={<Submissions />} /> {/* Added this route */}
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Widget Route */}
        <Route path="/widget/:formId" element={<WidgetPreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
