import { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';

interface ChatAreaProps {
  messages: Message[];
  onSubmitQuery: (query: string) => void;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  suggestedQuery?: string | null;
  onMenuClick?: () => void;
}

export default function ChatArea({ messages, onSubmitQuery, loading, error, onRetry, suggestedQuery, onMenuClick }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suggestedQuery !== undefined && suggestedQuery !== null && !input) {
      setInput(suggestedQuery);
      inputRef.current?.focus();
    }
  }, [suggestedQuery]);

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
    <div className="flex flex-col h-full bg-cream">
      <div className="lg:hidden p-3 border-b border-section/50 flex items-center shrink-0">
        <button
          onClick={onMenuClick}
          className="w-9 h-9 rounded-lg bg-midnight text-white flex items-center justify-center"
          aria-label="Abrir menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h12M3 9h12M3 13h12"/></svg>
        </button>
        <span className="ml-3 font-serif font-bold text-midnight text-sm">NormativaUP</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto px-4 lg:px-6">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={onSubmitQuery} />
          ) : (
            <div className="pt-6 pb-32">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
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
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 7a6 6 0 0111.3-2.7M13 1v3.5h-3.5" />
                      </svg>
                      Reintentar
                    </button>
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-cream shrink-0">
        <form onSubmit={handleSubmit} className="max-w-[820px] mx-auto px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center bg-paper border border-section rounded-2xl px-4 py-2 shadow-sm hover:border-muted transition-colors focus-within:border-navy-light/30 focus-within:shadow-md">
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Consulte leyes de Panama..."
              disabled={loading}
              className="flex-1 bg-transparent outline-none text-[0.88rem] text-text-primary placeholder:text-text-tertiary py-1 px-1 font-normal"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-midnight text-white flex items-center justify-center hover:bg-navy transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 shadow-sm active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8h14M8 1l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}