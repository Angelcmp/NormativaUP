import { useState } from 'react';
import type { CategoryInfo } from '../types';

const CATEGORIES: CategoryInfo[] = [
  { label: 'Educacion', query: 'educacion beca universidad IFARHU', icon: '\u{1F4DA}' },
  { label: 'Trabajo', query: 'trabajo laboral empleo salario', icon: '\u2696\uFE0F' },
  { label: 'Salud', query: 'salud seguridad social hospital', icon: '\u{1F3E5}' },
  { label: 'Gobierno', query: 'gobierno digital servicio publico', icon: '\u{1F3DB}\uFE0F' },
  { label: 'Transito', query: 'transito vehiculos licencia', icon: '\u{1F697}' },
  { label: 'Ambiente', query: 'ambiente ecologia recursos naturales', icon: '\u{1F33F}' },
  { label: 'Tributos', query: 'tributos impuestos ISR renta', icon: '\u{1F4B0}' },
  { label: 'Datos personales', query: 'datos personales proteccion habeas data', icon: '\u{1F512}' },
];

const DOCUMENTS = [
  'Ley 6 de 2002 - Transparencia',
  'Ley 29 de 2002 - Universidad Publica',
  'Ley Organica de la UP',
  'Ley 42 de 2012 - Sistema Penitenciario',
  'DE 356 de 2020 - Teletrabajo',
  'Ley 187 de 2020 - Proteccion de Datos',
];

interface SidebarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onCategoryClick: (query: string) => void;
  onNewChat: () => void;
  onRemoveHistory: (index: number) => void;
  history: { question: string; date: string }[];
}

export default function Sidebar({ language, onLanguageChange, onCategoryClick, onNewChat, onRemoveHistory, history }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      <aside
        className={`${
          collapsed ? 'w-0 lg:w-14' : 'w-72'
        } transition-all duration-300 ease-in-out bg-navy flex flex-col h-full overflow-hidden flex-shrink-0 relative z-50`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center pt-4 gap-3">
            <button
              onClick={() => setCollapsed(false)}
              className="w-9 h-9 rounded-lg bg-white/[0.08] hover:bg-white/[0.16] text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Abrir sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h12M3 9h12M3 13h12"/></svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full min-w-72">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between mb-0.5">
                <div className="font-serif font-bold text-white text-[0.95rem] tracking-tight">NormativaUP</div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Cerrar sidebar"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l8 8M11 3l-8 8"/></svg>
                </button>
              </div>
              <div className="text-[0.65rem] text-white/40 tracking-wide">Universidad de Panama</div>

              <button
                onClick={onNewChat}
                className="w-full mt-4 bg-white/[0.08] hover:bg-white/[0.16] text-white/88 hover:text-white border border-white/[0.06] rounded-lg py-2 px-3 text-[0.78rem] font-medium transition-all cursor-pointer active:scale-[0.98]"
              >
                + Nueva consulta
              </button>

              <div className="mt-3">
                <div className="flex gap-1 bg-black/20 rounded-lg p-[3px]">
                  {(['Español', 'English'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => onLanguageChange(lang)}
                      className={`flex-1 rounded-md py-1.5 px-3 text-[0.75rem] font-medium transition-all cursor-pointer ${
                        language === lang
                          ? 'bg-gold/40 text-white shadow-sm'
                          : 'text-white/45 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.08] mx-4" />

            <div className="p-4 pt-3 flex-shrink-0">
              <div className="text-[0.6rem] font-semibold text-white/30 uppercase tracking-[0.12em] mb-2">Historial</div>
              {history.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {history.slice().reverse().slice(0, 8).map((item, i) => {
                    const realIndex = history.length - 1 - i;
                    return (
                      <div key={i} className="group flex items-center gap-1">
                        <button
                          onClick={() => onCategoryClick(item.question)}
                          className="flex-1 text-left bg-white/[0.04] hover:bg-white/[0.10] text-white/60 hover:text-white/90 rounded-lg px-3 py-[5px] text-[0.72rem] transition-all cursor-pointer truncate"
                        >
                          {item.question.length > 30 ? item.question.slice(0, 30) + '...' : item.question}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveHistory(realIndex); }}
                          className="w-5 h-5 rounded flex items-center justify-center text-white/0 group-hover:text-white/40 hover:text-white/70 hover:bg-white/[0.10] transition-all cursor-pointer flex-shrink-0"
                          aria-label="Eliminar"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 2l6 6M8 2l-6 6"/></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/25 text-[0.72rem] italic">Sin conversaciones</p>
              )}
            </div>

            <div className="h-px bg-white/[0.08] mx-4" />

            <div className="p-4 pt-3 flex-1 overflow-y-auto">
              <div className="text-[0.6rem] font-semibold text-white/30 uppercase tracking-[0.12em] mb-2">Categorias</div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => onCategoryClick(cat.query)}
                    className="w-full text-left bg-white/[0.06] hover:bg-white/[0.14] text-white/80 hover:text-white border border-transparent hover:border-white/[0.06] rounded-lg py-[7px] px-3 text-[0.78rem] font-medium transition-all cursor-pointer active:scale-[0.98] flex items-center gap-2"
                  >
                    <span className="text-[0.85rem]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="h-px bg-white/[0.08] mx-4" />

              <div className="p-4 pt-3 pb-2">
                <div className="text-[0.6rem] font-semibold text-white/30 uppercase tracking-[0.12em] mb-1.5">Documentos</div>
                {DOCUMENTS.map((doc) => (
                  <div key={doc} className="text-white/40 text-[0.68rem] py-[3px] leading-relaxed">{doc}</div>
                ))}
              </div>

              <div className="px-4 pb-4">
                <div className="text-white/30 text-[0.62rem] leading-relaxed p-2.5 rounded-lg bg-black/15 border border-white/[0.04]">
                  Herramienta orientativa. Para decisiones legales, consulte un abogado.
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}