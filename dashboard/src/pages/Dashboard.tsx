import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileSearch, Award, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react';
import { api, type AuditSummary } from '../api/client';
import { GradeDisplay } from '../components/GradeDisplay';

interface Subscription { tier: string; scopes: string[]; auditCount: number; auditLimit: number }

const TIER_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' };
const TIER_COLORS: Record<string, string> = { free: 'text-slate-400', pro: 'text-indigo-400', enterprise: 'text-violet-400' };

export function Dashboard() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSubscription(), api.getAudits(5, 0)])
      .then(([s, a]) => { setSub(s); setAudits(a.audits); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Panel de testing de features y validación de tu agente OpenClaw</p>
        </div>
        <Link to="/audit/new" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <PlusCircle size={16} /> Probar feature ahora
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg"><Shield size={18} className="text-indigo-400" /></div>
            <span className="text-sm text-slate-400">Plan actual</span>
          </div>
          <p className={`text-2xl font-bold ${TIER_COLORS[sub?.tier || 'free']}`}>
            {TIER_LABELS[sub?.tier || 'free']}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg"><FileSearch size={18} className="text-indigo-400" /></div>
            <span className="text-sm text-slate-400">Auditorías este mes</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {sub?.auditCount} <span className="text-slate-500 text-lg">/ {sub?.auditLimit}</span>
          </p>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((sub?.auditCount || 0) / (sub?.auditLimit || 1)) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg"><TrendingUp size={18} className="text-indigo-400" /></div>
            <span className="text-sm text-slate-400">Scopes activos</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {sub?.scopes.map(s => (
              <span key={s} className="text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 px-2 py-0.5 rounded-full font-mono">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade banner for free */}
      {sub?.tier === 'free' && (
        <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-600/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award size={20} className="text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-white">Plan Free — 1 auditoría/mes</p>
              <p className="text-xs text-slate-400">Actualiza a Pro para 10 auditorías + módulo GDPR + validaciones</p>
            </div>
          </div>
          <Link to="/billing" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1">
            Upgrade <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Recent audits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Últimas auditorías</h2>
          <Link to="/history" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {audits.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center">
            <FileSearch size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Todavía no hay auditorías de features</p>
            <Link to="/audit/new" className="text-indigo-400 text-sm hover:text-indigo-300 mt-2 inline-block">
              Crear auditoría de prueba →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map(audit => (
              <Link key={audit.id} to={`/audit/${audit.id}`}
                className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <GradeDisplay grade={audit.grade} score={audit.score} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">Puntuación: {audit.score}/100</p>
                      <p className="text-xs text-slate-400">{new Date(audit.createdAt).toLocaleString('es-ES')}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
