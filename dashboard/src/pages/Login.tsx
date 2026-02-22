import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export function Login() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    localStorage.setItem('university_token', token.trim());
    try {
      await api.getSubscription();
      navigate('/');
    } catch {
      localStorage.removeItem('university_token');
      setError('Token inválido o expirado. Genera uno nuevo con POST /v1/auth/token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 mb-4">
            <Shield size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">OpenClaw University</h1>
          <p className="text-slate-400 mt-1">Auditoría y validación de agentes IA</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bearer Token</label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Pega aquí tu token de acceso..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Conectando...</> : 'Conectar'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            ¿No tienes token? Solicítalo a tu administrador de OpenClaw University.
          </p>
        </form>
      </div>
    </div>
  );
}
