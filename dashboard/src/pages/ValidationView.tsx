import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, ExternalLink, Award } from 'lucide-react';
import { api, type Validation } from '../api/client';

export function ValidationView() {
  const { id } = useParams<{ id: string }>();
  const [validation, setValidation] = useState<Validation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedTarget, setCopiedTarget] = useState<'markdown' | 'link' | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No se encontró el identificador de la validación.');
      return;
    }

    setLoading(true);
    setError('');
    api.getValidation(id)
      .then(setValidation)
      .catch((err: any) => setError(err?.message || 'No se pudo cargar la validación.'))
      .finally(() => setLoading(false));
  }, [id]);

  const badgeUrl = id ? api.getBadgeUrl(id) : '';
  const verifyUrl = id ? api.getVerifyUrl(id) : '';
  const markdown = `[![OpenClaw ${validation?.type} Validation](${badgeUrl})](${verifyUrl})`;

  const copyText = async (text: string, target: 'markdown' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget((current) => current === target ? null : current), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles. Revisa los permisos del navegador.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando validación...</div>;
  if (error) return <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</div>;
  if (!validation) return <div className="flex items-center justify-center h-64 text-slate-400">Validación no encontrada</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-full text-sm mb-4">
          <Award size={14} /> Validación {validation.type}
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Grade {validation.grade}</h1>
        <p className="text-slate-300">Score {validation.score}/100</p>
        <p className="text-sm text-slate-500 mt-2">Publica este badge para mostrar que tu agente pasó la validación.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block">Emitido</span>
            <span className="text-white">{new Date(validation.issuedAt).toLocaleDateString('es-ES')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Válido hasta</span>
            <span className="text-white">{new Date(validation.validUntil).toLocaleDateString('es-ES')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Estado</span>
            <span className={validation.revoked ? 'text-red-400' : 'text-green-400'}>
              {validation.revoked ? '❌ Revocado' : '✅ Válido'}
            </span>
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg p-4 flex justify-center bg-slate-800/50">
          <img src={badgeUrl} alt="Badge" className="h-20" />
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-2">Markdown para README</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono overflow-x-auto whitespace-nowrap">
              {markdown}
            </code>
            <button onClick={() => copyText(markdown, 'markdown')}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap">
              <Copy size={12} /> {copiedTarget === 'markdown' ? 'Markdown copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
          <p className="text-xs text-slate-400">Enlace público de verificación</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono overflow-x-auto whitespace-nowrap">
              {verifyUrl}
            </code>
            <button
              onClick={() => copyText(verifyUrl, 'link')}
              className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap">
              <Copy size={12} /> {copiedTarget === 'link' ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap">
              <ExternalLink size={12} /> Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
