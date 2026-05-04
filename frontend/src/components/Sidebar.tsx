import { useState } from 'react';

const DOCUMENTS = [
  'Ley 6 de 2002 - Transparencia',
  'Ley 29 de 2002 - Universidad Publica',
  'Ley Organica de la UP',
  'Ley 42 de 2012 - Sistema Penitenciario',
  'DE 356 de 2020 - Teletrabajo',
  'Ley 187 de 2020 - Proteccion de Datos',
];

interface SidebarProps {
  onHistoryItemClick?: (query: string) => void;
  onNewChat: () => void;
  onRemoveHistory: (index: number) => void;
  onSidebarChange: (open: boolean) => void;
  sidebarOpen: boolean;
  history: { question: string; date: string }[];
}

export default function Sidebar({ onHistoryItemClick, onNewChat, onRemoveHistory, onSidebarChange, sidebarOpen, history }: SidebarProps) {
  const [historyOpen, setHistoryOpen] = useState(true);
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <aside
      className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-50 transition-transform duration-300 ease-in-out bg-navy flex flex-col h-full overflow-hidden w-64`}
    >
      <div className="flex flex-col h-full min-w-64">
        <div className="p-4 pb-2 flex items-center justify-between">
          <div>
            <div className="font-serif font-bold text-white text-[0.95rem] tracking-tight">NormativaUP</div>
            <div className="text-[0.65rem] text-white/40 tracking-wide">Universidad de Panama</div>
          </div>
          <button
            onClick={() => onSidebarChange(false)}
            className="w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer lg:hidden"
            aria-label="Cerrar sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l8 8M11 3l-8 8"/></svg>
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="mx-4 mb-3 bg-white/[0.08] hover:bg-white/[0.16] text-white/88 hover:text-white border border-white/[0.06] rounded-lg py-2 px-3 text-[0.78rem] font-medium transition-all cursor-pointer active:scale-[0.98]"
        >
          + Nueva consulta
        </button>

        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between text-[0.6rem] font-semibold text-white/30 uppercase tracking-[0.12em] py-2 cursor-pointer hover:text-white/50 transition-colors"
          >
            <span>Historial ({history.length})</span>
            <svg className={`w-3 h-3 transition-transform ${historyOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5l3 3 3-3"/></svg>
          </button>
          {historyOpen && (
            <div className="space-y-1 pb-2">
              {history.length > 0 ? history.slice().reverse().slice(0, 10).map((item, i) => {
                const realIndex = history.length - 1 - i;
                return (
                  <div key={i} className="group flex items-center gap-1">
                    <button
                      onClick={() => onHistoryItemClick?.(item.question)}
                      className="flex-1 text-left text-white/60 hover:text-white/90 text-[0.72rem] py-[3px] transition-colors truncate"
                    >
                      {item.question.length > 20 ? item.question.slice(0, 20) + '...' : item.question}
                    </button>
                    <button
                      onClick={() => onRemoveHistory(realIndex)}
                      className="w-4 h-4 rounded flex items-center justify-center text-white/0 group-hover:text-white/40 hover:text-white/70 cursor-pointer flex-shrink-0"
                      aria-label="Eliminar"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l6 6M7 1l-6 6"/></svg>
                    </button>
                  </div>
                );
              }) : (
                <p className="text-white/25 text-[0.72rem] italic">Sin conversaciones</p>
              )}
            </div>
          )}

          <div className="h-px bg-white/[0.08]" />

          <button
            onClick={() => setDocsOpen(!docsOpen)}
            className="w-full flex items-center justify-between text-[0.6rem] font-semibold text-white/30 uppercase tracking-[0.12em] py-2 cursor-pointer hover:text-white/50 transition-colors"
          >
            <span>Documentos</span>
            <svg className={`w-3 h-3 transition-transform ${docsOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5l3 3 3-3"/></svg>
          </button>
          {docsOpen && (
            <div className="pb-2 space-y-0.5">
              {DOCUMENTS.map((doc) => (
                <div key={doc} className="text-white/40 text-[0.68rem] py-[2px] leading-relaxed">{doc}</div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="text-white/30 text-[0.6rem] leading-relaxed p-2 rounded-lg bg-black/15 border border-white/[0.04] text-center">
            Herramienta orientativa
          </div>
        </div>
      </div>
    </aside>
  );
}