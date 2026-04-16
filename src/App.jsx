import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import IconsPage from './pages/IconsPage';
import Login from './pages/Login';
import Menus from './pages/Menus';
import Roles from './pages/Roles';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const GenericModule = () => {
  const location = useLocation();
  const moduleName = location.pathname.split('/').filter(Boolean).pop() || 'Module';

  return (
    <div className="fade-in">
      <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
        <h1 style={{ textTransform: 'capitalize', marginBottom: '16px' }}>{moduleName.replace(/-/g, ' ')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          This module is part of the dynamic menu system.
          The route <code>{location.pathname}</code> is correctly mapped in the database.
        </p>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div className="stat-card glass-card" style={{ padding: '20px', minWidth: '200px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Status</span>
            <div style={{ fontSize: '1.2rem', marginTop: '10px' }}>Configured</div>
          </div>
          <div className="stat-card glass-card" style={{ padding: '20px', minWidth: '200px' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Access</span>
            <div style={{ fontSize: '1.2rem', marginTop: '10px' }}>Granted</div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Defined Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
        <Route path="/menus" element={<ProtectedRoute><Menus /></ProtectedRoute>} />

        {/* Dynamic / Catch-all Routes for other menu items */}
        <Route path="/users" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/finance/tax" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/content/edit" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/hr" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
        <Route path="/icons" element={<ProtectedRoute><IconsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<ProtectedRoute><GenericModule /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
