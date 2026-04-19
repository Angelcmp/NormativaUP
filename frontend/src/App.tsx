import { useState, useCallback, useEffect } from 'react';
import type { Message } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { sendChat } from './api';

const STORAGE_KEY_MESSAGES = 'normativaup_messages';
const STORAGE_KEY_HISTORY = 'normativaup_history';
const STORAGE_KEY_LANGUAGE = 'normativaup_language';

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
  const [history, setHistory] = useState<{ question: string; date: string }[]>(() => loadJSON(STORAGE_KEY_HISTORY, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  useEffect(() => { saveJSON(STORAGE_KEY_MESSAGES, messages); }, [messages]);
  useEffect(() => { saveJSON(STORAGE_KEY_HISTORY, history); }, [history]);
  useEffect(() => { saveJSON(STORAGE_KEY_LANGUAGE, language); }, [language]);

  const submitQuery = useCallback(async (query: string) => {
    if (loading) return;
    setError(null);
    setLastQuery(query);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setHistory((h) => [...h, { question: query, date: new Date().toISOString() }]);

    setLoading(true);
    try {
      const res = await sendChat({ query, language: language === 'English' ? 'en' : 'es' });
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        confidence: res.confidence,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la consulta');
    } finally {
      setLoading(false);
    }
  }, [loading, language]);

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
  }, []);

  const handleRemoveHistory = useCallback((index: number) => {
    setHistory((h) => h.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar
        language={language}
        onLanguageChange={setLanguage}
        onCategoryClick={submitQuery}
        onNewChat={handleNewChat}
        onRemoveHistory={handleRemoveHistory}
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
          />
        </div>
        <footer className="text-center py-2 text-[0.65rem] text-text-tertiary bg-cream border-t border-section/50">
          NormativaUP &middot; Universidad de Panama &middot; Herramienta orientativa, no sustituye asesoria legal
        </footer>
      </div>
    </div>
  );
}