import type { SourceInfo, ConfidenceInfo } from '../types';
import type { Strings } from '../i18n';

export function ConfidenceBadge({ confidence, strings }: { confidence: ConfidenceInfo; strings: Strings }) {
  const level = confidence.level;
  const config: Record<string, { bg: string; text: string; bar: string; icon: string }> = {
    alto: { bg: 'bg-emerald-50', text: 'text-success', bar: 'bg-success', icon: '\u2713' },
    medio: { bg: 'bg-amber-50', text: 'text-warning', bar: 'bg-warning', icon: '!' },
    bajo: { bg: 'bg-red-50', text: 'text-error', bar: 'bg-error', icon: '\u2717' },
  };
  const c = config[level] || config.bajo;
  const label = strings.confidence[level] || strings.confidence.bajo;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.8rem] ${c.bg} ${c.text}`}>
      <span className="font-bold">{c.icon}</span>
      <span className="font-medium">{label} &middot; {confidence.percentage}%</span>
      <div className="w-20 h-1 bg-section rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar} transition-all duration-500`} style={{ width: `${confidence.percentage}%` }} />
      </div>
    </div>
  );
}

export function SourcesPanel({ sources, onOpenSource, strings }: { sources: SourceInfo[]; onOpenSource?: (docId: number) => void; strings: Strings }) {
  return (
    <details className="group">
      <summary className="text-[0.8rem] text-text-secondary cursor-pointer hover:text-text-primary transition-colors flex items-center gap-1">
        <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>
        {strings.sources} ({sources.length})
      </summary>
      <div className="mt-2 space-y-2">
        {sources.map((s, i) => (
          <div key={i} className="bg-paper rounded-xl px-4 py-3 border border-section/60 text-[0.82rem]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-serif font-semibold text-midnight text-[0.88rem]">{s.tipo} {s.numero} de {s.anio}</div>
                <div className="text-text-tertiary text-[0.72rem] mt-0.5">
                  {s.titulo}
                  {s.pagina ? ` \u00b7 ${strings.page} ${s.pagina}` : ''}
                </div>
              </div>
              {onOpenSource && s.doc_id > 0 && (
                <button
                  onClick={() => onOpenSource(s.doc_id)}
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[0.65rem] font-medium text-navy-light bg-cream-dark hover:bg-section border border-section/50 hover:border-navy-light/20 transition-colors cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 4v6a1 1 0 001 1h6a1 1 0 001-1V4M6 1v6M4 4l2 2 2-2"/></svg>
                  {strings.view}
                </button>
              )}
            </div>
            <div className="text-text-secondary text-[0.78rem] leading-relaxed mt-1">{s.fragmento}</div>
          </div>
        ))}
      </div>
    </details>
  );
}
