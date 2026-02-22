import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, History, LogOut, PlusCircle, Home } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('university_token');
    navigate('/login');
  };

  const nav = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/audit/new', label: 'Nueva Auditoría', icon: PlusCircle },
    { to: '/history', label: 'Historial', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-indigo-400" />
            <span className="font-bold text-white">OpenClaw University</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
                  ${location.pathname === to ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Icon size={14} />{label}
              </Link>
            ))}
          </nav>
          <button onClick={logout} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
