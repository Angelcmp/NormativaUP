import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ModelInfo, ConversationEntry } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { sendChatStream, fetchModels } from './api';

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
const [models, setModels] = useState<ModelInfo[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [history, setHistory] = useState<ConversationEntry[]>(() => {
    const raw = loadJSON<unknown>(STORAGE_KEY_HISTORY, []);
    if (!Array.isArray(raw)) return [];
    if (raw.length > 0 && !('id' in raw[0])) {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      return [];
    }
    return raw as ConversationEntry[];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const streamingContentRef = useRef<string>('');

  useEffect(() => { saveJSON(STORAGE_KEY_MESSAGES, messages); }, [messages]);
  useEffect(() => { saveJSON(STORAGE_KEY_HISTORY, history); }, [history]);
  useEffect(() => { saveJSON(STORAGE_KEY_LANGUAGE, language); }, [language]);
  useEffect(() => { saveJSON(STORAGE_KEY_MODEL, model); }, [model]);
useEffect(() => { fetchModels().then(setModels).catch(() => {}); }, []);

  const submitQuery = useCallback(async (query: string) => {
    if (loading) return;
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
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
    setHistory((h) => {
      const currentMessages = messages.filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content));
      if (currentMessages.length === 0) return h;
      const title = currentMessages[0].content.slice(0, 40);
      const entry: ConversationEntry = {
        id: crypto.randomUUID(),
        messages: currentMessages,
        title,
        date: new Date().toISOString(),
      };
      const updated = [entry, ...h];
      return updated.length > MAX_HISTORY ? updated.slice(0, MAX_HISTORY) : updated;
    });
    setMessages([]);
    setError(null);
    setLastQuery(null);
    streamingContentRef.current = '';
  }, [messages]);

  const handleRemoveHistory = useCallback((index: number) => {
    setHistory((h) => h.filter((_, i) => i !== index));
  }, []);

  const handleHistoryItemClick = useCallback((entryId: string) => {
    const entry = history.find((h) => h.id === entryId);
    if (!entry) return;
    setMessages(entry.messages);
    setError(null);
    setLastQuery(null);
  }, [history]);

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
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
            onMenuClick={() => setSidebarOpen(true)}
            language={language}
            onLanguageChange={setLanguage}
            selectedModel={model}
            models={models}
            onModelChange={setModel}
          />
        </div>
        <footer className="text-center py-2 text-[0.65rem] text-text-tertiary bg-cream border-t border-section/50">
          NormativaUP &middot; Universidad de Panama &middot; Herramienta orientativa, no sustituye asesoria legal
        </footer>
      </div>
    </div>
  );
}