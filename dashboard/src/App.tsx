import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewAudit } from './pages/NewAudit';
import { AuditResult } from './pages/AuditResult';
import { ValidationView } from './pages/ValidationView';
import { History } from './pages/History';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('university_token');
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/audit/new" element={<PrivateRoute><NewAudit /></PrivateRoute>} />
        <Route path="/audit/:id" element={<PrivateRoute><AuditResult /></PrivateRoute>} />
        <Route path="/validations/:id" element={<PrivateRoute><ValidationView /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
