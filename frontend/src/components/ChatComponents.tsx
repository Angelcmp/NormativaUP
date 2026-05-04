import type { SourceInfo, ConfidenceInfo } from '../types';

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceInfo }) {
  const level = confidence.level;
  const config: Record<string, { bg: string; text: string; bar: string; icon: string; label: string }> = {
    alto: { bg: 'bg-emerald-50', text: 'text-success', bar: 'bg-success', icon: '\u2713', label: 'Alto' },
    medio: { bg: 'bg-amber-50', text: 'text-warning', bar: 'bg-warning', icon: '!', label: 'Medio' },
    bajo: { bg: 'bg-red-50', text: 'text-error', bar: 'bg-error', icon: '\u2717', label: 'Bajo' },
  };
  const c = config[level] || config.bajo;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.8rem] ${c.bg} ${c.text}`}>
      <span className="font-bold">{c.icon}</span>
      <span className="font-medium">{c.label} &middot; {confidence.percentage}%</span>
      <div className="w-20 h-1 bg-section rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar} transition-all duration-500`} style={{ width: `${confidence.percentage}%` }} />
      </div>
    </div>
  );
}

export function SourcesPanel({ sources }: { sources: SourceInfo[] }) {
  return (
    <details className="group">
      <summary className="text-[0.8rem] text-text-secondary cursor-pointer hover:text-text-primary transition-colors flex items-center gap-1">
        <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
        Fuentes ({sources.length})
      </summary>
      <div className="mt-2 space-y-2">
        {sources.map((s, i) => (
          <div key={i} className="bg-paper rounded-xl px-4 py-3 border border-section/60 text-[0.82rem]">
            <div className="font-serif font-semibold text-midnight text-[0.88rem]">{s.tipo} {s.numero} de {s.anio}</div>
            <div className="text-text-tertiary text-[0.72rem] mt-0.5">{s.titulo}</div>
            <div className="text-text-secondary text-[0.78rem] leading-relaxed mt-1">{s.fragmento}</div>
          </div>
        ))}
      </div>
    </details>
  );
}