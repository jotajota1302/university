import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield, CheckSquare, Terminal, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

type Tab = 'security' | 'gdpr';

const FIELDS_SECURITY = [
  { key: 'SOUL.md', label: 'SOUL.md', placeholder: 'Pega el contenido de tu SOUL.md...' },
  { key: 'AGENTS.md', label: 'AGENTS.md', placeholder: 'Pega el contenido de tu AGENTS.md...' },
  { key: 'TOOLS.md', label: 'TOOLS.md', placeholder: 'Pega el contenido de tu TOOLS.md...' },
  { key: 'config', label: 'Config (JSON)', placeholder: '{"dmPolicy":"allowlist","allowFrom":["+34600000000"]}' },
];
const FIELDS_GDPR = [...FIELDS_SECURITY, { key: 'memory', label: 'Memory (archivos de memoria del agente)', placeholder: 'Pega el contenido de tus archivos memory/...' }];

export function NewAudit() {
  const [tab, setTab] = useState<Tab>('security');
  const [files, setFiles] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [showSkillInfo, setShowSkillInfo] = useState(false);
  const fields = tab === 'security' ? FIELDS_SECURITY : FIELDS_GDPR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) { setError('Debes aceptar los términos antes de continuar'); return; }
    setLoading(true);
    setError('');
    try {
      const nonEmpty = Object.fromEntries(Object.entries(files).filter(([, v]) => v.trim()));
      const result = tab === 'security' ? await api.auditSecurity(nonEmpty) : await api.auditGdpr(nonEmpty);
      navigate(`/audit/${result.auditId}`, { state: result });
    } catch (err: any) {
      if (err.status === 429) setError(`Límite de auditorías alcanzado. Actualiza tu plan para continuar.`);
      else if (err.status === 403) setError('Tu plan actual no incluye este tipo de auditoría.');
      else setError(err.message || 'Error al lanzar la auditoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nueva Auditoría</h1>
        <p className="text-slate-400 mt-1">Pega los archivos de configuración de tu agente para analizarlos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {(['security', 'gdpr'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
              ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t === 'security' ? '🔒 Seguridad' : '🇪🇺 GDPR'}
          </button>
        ))}
      </div>

      {/* Skill connector info */}
      <div className="bg-slate-900 border border-indigo-600/30 rounded-xl overflow-hidden">
        <button onClick={() => setShowSkillInfo(!showSkillInfo)} type="button"
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">¿Tienes OpenClaw instalado? Audita sin pegar nada</span>
          </div>
          {showSkillInfo ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
        </button>
        {showSkillInfo && (
          <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
            <p className="text-xs text-slate-400 mt-3">
              Instala el <strong className="text-slate-300">university-connector</strong> skill en tu OpenClaw y dile a tu agente que se audite solo. Los resultados aparecerán automáticamente en tu historial.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-300">1. Configura las variables de entorno en tu OpenClaw:</p>
              <code className="block text-xs bg-slate-800 rounded-lg px-3 py-2 text-green-400 font-mono">
                export UNIVERSITY_TOKEN="{localStorage.getItem('university_token') || 'tu-token'}"<br/>
                export UNIVERSITY_API_URL="https://openclaw-university-api.onrender.com"
              </code>
              <p className="text-xs font-medium text-slate-300 mt-2">2. Ejecuta la auditoría desde el directorio de tu agente:</p>
              <code className="block text-xs bg-slate-800 rounded-lg px-3 py-2 text-green-400 font-mono">
                bash skills/university-connector/audit.sh
              </code>
              <p className="text-xs text-slate-500">El resultado aparecerá en tu <strong>Historial</strong> en segundos.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-500">o pega los archivos manualmente</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label} <span className="text-slate-500">(opcional)</span></label>
            <textarea
              value={files[key] || ''}
              onChange={e => setFiles(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-y font-mono"
            />
          </div>
        ))}

        {/* Consent */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Shield size={18} className="text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-medium mb-1">Protección de tus datos</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Para auditar tu agente accedemos temporalmente a los archivos de configuración que pegues aquí.
                <strong className="text-slate-300"> No almacenamos ni procesamos el contenido de tus ficheros</strong> más allá del análisis.
                Solo guardamos los resultados (scores, grades, checks). El contenido de tus archivos nunca se persiste en nuestros servidores.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setConsent(!consent)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer
                ${consent ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'}`}>
              {consent && <CheckSquare size={14} className="text-white" />}
            </div>
            <span className="text-sm text-slate-300">He leído y acepto la política de privacidad</span>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</div>
        )}

        <button type="submit" disabled={loading || !consent}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analizando...</> : '🔍 Lanzar auditoría'}
        </button>
      </form>
    </div>
  );
}
