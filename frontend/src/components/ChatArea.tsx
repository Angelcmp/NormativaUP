import { useState, useEffect, useRef } from 'react';
import type { Message, CategoryInfo, ModelInfo } from '../types';
import type { Strings } from '../i18n';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import DocumentPanel from './DocumentPanel';
import { fetchCategories } from '../api';

interface ChatAreaProps {
  messages: Message[];
  onSubmitQuery: (query: string) => void;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onStop?: () => void;
  onMenuClick?: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  selectedModel: string;
  models: ModelInfo[];
  onModelChange: (model: string) => void;
  strings: Strings;
}

export default function ChatArea({ messages = [], onSubmitQuery, loading, error, onRetry, onStop, onMenuClick, language, onLanguageChange, selectedModel, models = [], onModelChange, strings }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [docPanelOpen, setDocPanelOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;
    setInput('');
    onSubmitQuery(query);
  }

  return (
    <div className="flex h-full bg-cream">
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="p-3 border-b border-section/50 flex items-center shrink-0">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 rounded-lg bg-midnight text-white flex items-center justify-center hover:bg-navy transition-colors cursor-pointer"
            aria-label={strings.menu}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h12M3 9h12M3 13h12"/></svg>
          </button>
          <span className="ml-3 font-serif font-bold text-midnight text-sm">NormativaUP</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[820px] mx-auto px-4 lg:px-6">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={onSubmitQuery} strings={strings} />
            ) : (
              <div className="pt-6 pb-4">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} onOpenSource={setSelectedDocId} strings={strings} />
                ))}
                {loading && (!messages.length || !messages[messages.length - 1].content) && (
                  <div className="flex gap-3 mb-5 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-midnight flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[0.65rem] font-bold tracking-tight">UP</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-3">
                      <div className="w-2 h-2 bg-navy-light/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-navy-light/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-navy-light/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[0.85rem] mb-4 animate-fade-in">
                    <p className="text-red-700">{error}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        disabled={loading}
                        className="mt-2 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-red-700 hover:text-red-900 underline underline-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7a6 6 0 0111.3-2.7M13 1v3.5h-3.5" /></svg>
                        {strings.retry}
                      </button>
                    )}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-cream shrink-0 border-t border-section/50">
          <div className="max-w-[820px] mx-auto px-4 lg:px-6 pt-2">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => onSubmitQuery(cat.query)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 bg-paper border border-section rounded-full px-2.5 py-1 text-[0.7rem] text-text-secondary hover:text-text-primary hover:border-navy-light/30 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{cat.icon}</span>
                  <span>{strings.categoryLabels[cat.label] || cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-[820px] mx-auto px-4 lg:px-6 pb-3 lg:pb-4">
            <div className="flex items-center gap-2 pb-1.5 lg:hidden">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-paper border border-section rounded-lg px-2 py-1 text-[0.7rem] text-text-secondary outline-none cursor-pointer"
              >
                <option value="Español">ES</option>
                <option value="English">EN</option>
              </select>
              {models.length > 0 && (
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="bg-paper border border-section rounded-lg px-2 py-1 text-[0.7rem] text-text-secondary outline-none cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center bg-paper border border-section rounded-2xl px-3 py-1 shadow-sm hover:border-muted transition-colors focus-within:border-navy-light/30 focus-within:shadow-md">
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={strings.placeholder}
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-[0.88rem] text-text-primary placeholder:text-text-tertiary py-2 px-1 font-normal"
              />
              <div className="flex items-center gap-1.5 ml-1 max-lg:hidden">
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="bg-transparent text-[0.7rem] text-text-tertiary hover:text-text-primary outline-none cursor-pointer"
                >
                  <option value="Español">ES</option>
                  <option value="English">EN</option>
                </select>
                {models.length > 0 && (
                  <select
                    value={selectedModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="bg-transparent text-[0.65rem] text-text-tertiary hover:text-text-primary outline-none cursor-pointer max-w-[80px] truncate"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                )}
              </div>
              {loading && onStop ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="h-8 px-3 rounded-full border border-error/40 text-error flex items-center gap-1.5 hover:bg-red-50 transition-all cursor-pointer flex-shrink-0 text-[0.72rem] font-medium"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="2"/></svg>
                  {strings.stop}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-full bg-midnight text-white flex items-center justify-center hover:bg-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 shadow-sm active:scale-95"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 8h14M8 1l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {!docPanelOpen && (
        <button
          onClick={() => setDocPanelOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-8 h-16 rounded-l-lg bg-paper border border-r-0 border-section/60 shadow-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-cream-dark transition-all cursor-pointer"
          title={strings.openPanel}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3l-5 5 5 5"/></svg>
        </button>
      )}

      <DocumentPanel selectedDocId={selectedDocId} onSelectDoc={setSelectedDocId} open={docPanelOpen} onToggle={() => setDocPanelOpen(!docPanelOpen)} strings={strings} />
    </div>
  );
}
