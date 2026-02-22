import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type AuditSummary } from '../api/client';
import { GradeDisplay } from '../components/GradeDisplay';

const PAGE_SIZE = 10;

export function History() {
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAudits(PAGE_SIZE, page * PAGE_SIZE)
      .then(r => { setAudits(r.audits); setTotal(r.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Historial de auditorías</h1>
        <p className="text-slate-400 mt-1">{total} auditoría{total !== 1 ? 's' : ''} en total</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-20">Cargando...</div>
      ) : audits.length === 0 ? (
        <div className="text-center text-slate-400 py-20">No hay auditorías todavía</div>
      ) : (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Grade</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Score</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Problemas</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit, i) => {
                  const fails = audit.result?.checks?.filter(c => c.status === 'FAIL').length ?? 0;
                  return (
                    <tr key={audit.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === audits.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 text-slate-300">{new Date(audit.createdAt).toLocaleString('es-ES')}</td>
                      <td className="px-4 py-3"><GradeDisplay grade={audit.grade} score={audit.score} size="sm" /></td>
                      <td className="px-4 py-3 text-white font-medium">{audit.score}/100</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${fails > 0 ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'}`}>
                          {fails > 0 ? `${fails} fallo${fails > 1 ? 's' : ''}` : 'Sin fallos'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/audit/${audit.id}`} state={audit.result}
                          className="flex items-center justify-end gap-1 text-indigo-400 hover:text-indigo-300">
                          Ver <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Página {page + 1} de {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
