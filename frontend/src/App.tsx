import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { sendChatStream } from './api';

const STORAGE_KEY_MESSAGES = 'normativaup_messages';
const STORAGE_KEY_HISTORY = 'normativaup_history';
const STORAGE_KEY_LANGUAGE = 'normativaup_language';
const STORAGE_KEY_MODEL = 'normativaup_model';
const MAX_MESSAGES = 50;
const MAX_HISTORY = 20;

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => loadJSON(STORAGE_KEY_MESSAGES, []));
  const [language, setLanguage] = useState<string>(() => loadJSON(STORAGE_KEY_LANGUAGE, 'Español'));
  const [model, setModel] = useState<string>(() => loadJSON(STORAGE_KEY_MODEL, 'gpt-4o'));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<{ question: string; date: string }[]>(() => loadJSON(STORAGE_KEY_HISTORY, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const streamingContentRef = useRef<string>('');

  useEffect(() => { saveJSON(STORAGE_KEY_MESSAGES, messages); }, [messages]);
  useEffect(() => { saveJSON(STORAGE_KEY_HISTORY, history); }, [history]);
  useEffect(() => { saveJSON(STORAGE_KEY_LANGUAGE, language); }, [language]);
  useEffect(() => { saveJSON(STORAGE_KEY_MODEL, model); }, [model]);

  const submitQuery = useCallback(async (query: string) => {
    if (loading) return;
    setError(null);
    setLastQuery(query);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
    });
    setHistory((h) => {
      const updated = [...h, { question: query, date: new Date().toISOString() }];
      return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
    });

    setLoading(true);
    streamingContentRef.current = '';
    
    const tempAssistantId = crypto.randomUUID();
    const tempMsg: Message = {
      id: tempAssistantId,
      role: 'assistant',
      content: '',
      sources: [],
      confidence: { level: 'bajo', percentage: 0, source_count: 0 },
    };
    setMessages((prev) => {
      const updated = [...prev, tempMsg];
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
    });

    try {
      const result = await sendChatStream(
        { query, language: language === 'English' ? 'en' : 'es', model },
        (chunk, done) => {
          if (done) return;
          streamingContentRef.current += chunk;
          setMessages((prev) => 
            prev.map((m) => 
              m.id === tempAssistantId 
                ? { ...m, content: streamingContentRef.current }
                : m
            )
          );
        }
      );
      setMessages((prev) => 
        prev.map((m) => 
          m.id === tempAssistantId 
            ? { ...m, sources: result.sources, confidence: result.confidence }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempAssistantId));
      setError(err instanceof Error ? err.message : 'Error en la consulta');
    } finally {
      setLoading(false);
    }
  }, [loading, language, model]);

  const handleRetry = useCallback(() => {
    if (lastQuery) {
      setError(null);
      submitQuery(lastQuery);
    }
  }, [lastQuery, submitQuery]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastQuery(null);
    streamingContentRef.current = '';
  }, []);

  const handleHistoryItemClick = useCallback((query: string) => {
    setError(null);
    setMessages([]);
    setLastQuery(query);
    if (!loading) {
      setTimeout(() => submitQuery(query), 100);
    }
  }, [loading, submitQuery]);

  const handleRemoveHistory = useCallback((index: number) => {
    setHistory((h) => h.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        language={language}
        onLanguageChange={setLanguage}
        selectedModel={model}
        onModelChange={setModel}
        onCategoryClick={submitQuery}
        onHistoryItemClick={handleHistoryItemClick}
        onNewChat={handleNewChat}
        onRemoveHistory={handleRemoveHistory}
        onSidebarChange={setSidebarOpen}
        sidebarOpen={sidebarOpen}
        history={history}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ChatArea
            messages={messages}
            onSubmitQuery={submitQuery}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            suggestedQuery={lastQuery}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>
        <footer className="text-center py-2 text-[0.65rem] text-text-tertiary bg-cream border-t border-section/50">
          NormativaUP &middot; Universidad de Panama &middot; Herramienta orientativa, no sustituye asesoria legal
        </footer>
      </div>
    </div>
  );
}