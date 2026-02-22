import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import type { Check } from '../api/client';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-yellow-400', LOW: 'text-green-400',
};

const SEVERITY_BG: Record<string, string> = {
  CRITICAL: 'bg-red-400/10 border-red-400/20',
  HIGH: 'bg-orange-400/10 border-orange-400/20',
  MEDIUM: 'bg-yellow-400/10 border-yellow-400/20',
  LOW: 'bg-green-400/10 border-green-400/20',
};

export function CheckItem({ check }: { check: Check }) {
  return (
    <div className={`rounded-lg border p-4 ${check.status === 'FAIL' ? SEVERITY_BG[check.severity] : 'bg-slate-800/50 border-slate-700'}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {check.status === 'PASS' && <CheckCircle size={18} className="text-green-400" />}
          {check.status === 'FAIL' && <XCircle size={18} className={SEVERITY_COLORS[check.severity]} />}
          {check.status === 'N/A' && <MinusCircle size={18} className="text-slate-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-400">{check.id}</span>
            <span className={`text-xs font-bold uppercase ${SEVERITY_COLORS[check.severity]}`}>{check.severity}</span>
          </div>
          <p className="text-sm text-slate-200 mt-1">{check.message}</p>
          {check.fix && (
            <p className="text-xs text-slate-400 mt-2 italic">💡 {check.fix}</p>
          )}
        </div>
      </div>
    </div>
  );
}
