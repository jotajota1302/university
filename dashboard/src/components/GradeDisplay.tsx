const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e', B: '#84cc16', C: '#eab308', D: '#f97316', F: '#ef4444',
};

export function GradeDisplay({ grade, score, size = 'md' }: { grade: string; score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = GRADE_COLORS[grade] || '#6b7280';
  const sizes = { sm: 'text-2xl', md: 'text-5xl', lg: 'text-8xl' };
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`font-black ${sizes[size]}`} style={{ color }}>{grade}</span>
      <span className="text-slate-400 text-sm font-medium">{score}/100</span>
    </div>
  );
}
