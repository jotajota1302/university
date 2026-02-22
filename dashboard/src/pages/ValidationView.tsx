import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, ExternalLink, Award } from 'lucide-react';
import { api, type Validation } from '../api/client';

export function ValidationView() {
  const { id } = useParams<{ id: string }>();
  const [validation, setValidation] = useState<Validation | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) api.getValidation(id).then(setValidation);
  }, [id]);

  const badgeUrl = id ? api.getBadgeUrl(id) : '';
  const verifyUrl = id ? api.getVerifyUrl(id) : '';
  const markdown = `[![OpenClaw ${validation?.type} Validation](${badgeUrl})](${verifyUrl})`;

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!validation) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-full text-sm mb-4">
          <Award size={14} /> Validación {validation.type}
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Grade {validation.grade}</h1>
        <p className="text-slate-400">Score: {validation.score}/100</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
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

        {/* Badge preview */}
        <div className="border border-slate-700 rounded-lg p-4 flex justify-center bg-slate-800/50">
          <img src={badgeUrl} alt="Badge" className="h-20" />
        </div>

        {/* Markdown code */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Añade este badge a tu README:</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-mono overflow-x-auto whitespace-nowrap">
              {markdown}
            </code>
            <button onClick={copyMarkdown}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap">
              <Copy size={12} /> {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <a href={verifyUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors">
          <ExternalLink size={14} /> Verificar validación públicamente
        </a>
      </div>
    </div>
  );
}
