import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Award, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { api, type AuditResult as TAuditResult, type Check } from '../api/client';
import { GradeDisplay } from '../components/GradeDisplay';
import { CheckItem } from '../components/CheckItem';

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export function AuditResult() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<TAuditResult | null>(location.state as TAuditResult || null);
  const [loading, setLoading] = useState(!result);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ CRITICAL: true, HIGH: true, MEDIUM: false, LOW: false });

  useEffect(() => {
    if (!result && id) {
      api.getAudits(50, 0)
        .then(a => {
          const found = a.audits.find(x => x.id === id);
          if (found) setResult(found.result);
        })
        .finally(() => setLoading(false));
    }
  }, [id, result]);

  const validate = async () => {
    if (!result || !result.certifiable || validating) return;
    setValidating(true);
    setValidationError('');
    try {
      const validation = await api.createValidation(result.auditId, 'SECURITY');
      navigate(`/validations/${validation.id}`);
    } catch (err: any) {
      setValidationError(err?.message || 'No se pudo crear la validación. Inténtalo de nuevo.');
    } finally {
      setValidating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>;
  if (!result) return <div className="text-center text-slate-400 mt-20">Auditoría no encontrada</div>;

  const byS = SEVERITIES.reduce((acc, s) => {
    acc[s] = result.checks.filter(c => c.severity === s);
    return acc;
  }, {} as Record<string, Check[]>);

  const failCount = result.checks.filter(c => c.status === 'FAIL').length;
  const recommendationSummary = (result.recommendations || []).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-6">
          <GradeDisplay grade={result.grade} score={result.score} size="lg" />
          <div className="flex-1 space-y-2">
            <h1 className="text-xl font-bold text-white mb-1">Resultado de auditoría</h1>
            <p className="text-slate-400 text-sm">{failCount} problema{failCount !== 1 ? 's' : ''} detectado{failCount !== 1 ? 's' : ''} · {result.checks.filter(c => c.status === 'PASS').length} checks superados</p>
            {result.certifiable ? (
              <div className="space-y-2">
                <span className="inline-flex text-xs bg-green-400/10 text-green-400 border border-green-400/20 px-2 py-1 rounded-full font-medium">
                  ✅ Validable
                </span>
                <p className="text-sm text-slate-300">
                  Tu auditoría está lista para emitir validación. Siguiente paso: generar y compartir el badge.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="inline-flex text-xs bg-red-400/10 text-red-400 border border-red-400/20 px-2 py-1 rounded-full font-medium">
                  ❌ No validable
                </span>
                <p className="text-sm text-slate-300">
                  Corrige los bloqueantes para poder generar la validación.
                </p>
                {!!result.validationBlockers.length && (
                  <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-300 uppercase tracking-wide mb-2">Bloqueantes</p>
                    <ul className="space-y-1 text-sm text-red-200">
                      {result.validationBlockers.map((blocker, index) => (
                        <li key={`${blocker}-${index}`}>• {blocker}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!recommendationSummary.length && (
                  <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Recomendaciones prioritarias</p>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {recommendationSummary.map((recommendation, index) => (
                        <li key={`${recommendation}-${index}`}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={validate} disabled={!result.certifiable || validating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
              {validating ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
              {validating ? 'Generando...' : 'Generar validación'}
          </button>
        </div>
        {!result.certifiable && (
          <p className="text-xs text-slate-500">
            La acción se habilita automáticamente cuando no haya bloqueantes.
          </p>
        )}
        {validationError && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {validationError}
          </div>
        )}
      </div>

      {/* Checks por severidad */}
      {SEVERITIES.map(severity => {
        const checks = byS[severity];
        if (!checks?.length) return null;
        const isOpen = expanded[severity];
        const failsInGroup = checks.filter(c => c.status === 'FAIL').length;
        return (
          <div key={severity} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(e => ({ ...e, [severity]: !isOpen }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300">{severity}</span>
                {failsInGroup > 0 && (
                  <span className="text-xs bg-red-400/20 text-red-400 px-1.5 py-0.5 rounded font-mono">{failsInGroup} fallo{failsInGroup > 1 ? 's' : ''}</span>
                )}
              </div>
              {isOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {checks.map(c => <CheckItem key={c.id} check={c} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
