import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout').then(module => ({ default: module.AdminLayout })));
const Overview = lazy(() => import('./pages/admin/Overview').then(module => ({ default: module.Overview })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const CreateProperty = lazy(() => import('./pages/admin/CreateProperty').then(module => ({ default: module.CreateProperty })));
const EditProperty = lazy(() => import('./pages/admin/EditProperty').then(module => ({ default: module.EditProperty })));

// Placeholders for new pages
const UsersPage = () => <div className="text-white pt-20 text-center"><h1 className="text-4xl font-serif text-[#D4AF37]">Gestión de Usuarios</h1><p className="text-gray-500 mt-4 underline decoration-[#D4AF37]">Próximamente...</p></div>;
const SettingsPage = () => <div className="text-white pt-20 text-center"><h1 className="text-4xl font-serif text-[#D4AF37]">Configuración del Sistema</h1><p className="text-gray-500 mt-4 underline decoration-[#D4AF37]">Próximamente...</p></div>;
const ReportsPage = () => <div className="text-white pt-20 text-center"><h1 className="text-4xl font-serif text-[#D4AF37]">Reportes y Estadísticas</h1><p className="text-gray-500 mt-4 underline decoration-[#D4AF37]">Próximamente...</p></div>;

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    }>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes with Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="dashboard" element={<Overview />} />
          <Route path="properties" element={<AdminDashboard />} />
          <Route path="create" element={<CreateProperty />} />
          <Route path="edit/:id" element={<EditProperty />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
