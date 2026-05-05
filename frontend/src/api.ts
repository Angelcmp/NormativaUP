import type { ChatRequest, ChatResponse, CategoryInfo, DocumentInfo, ModelInfo, SourceInfo, ConfidenceInfo, DocumentContent } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const FRIENDLY_ERRORS: Record<number, string> = {
  400: 'Solicitud invalida. Verifique su consulta.',
  429: 'Demasiadas consultas. Espere un momento e intente de nuevo.',
  500: 'Error interno del servidor. Intente de nuevo en unos segundos.',
  502: 'El servidor no esta disponible. Intente de nuevo mas tarde.',
  503: 'El servicio esta iniciando. Espere unos segundos e intente de nuevo.',
};

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1500, 3000];

async function fetchWithRetry(url: string, options: RequestInit, retries = 0): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok && res.status >= 500 && retries < MAX_RETRIES) {
    await new Promise((r) => setTimeout(r, RETRY_DELAYS[retries]));
    return fetchWithRetry(url, options, retries + 1);
  }
  return res;
}

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: '' }));
      throw new Error(FRIENDLY_ERRORS[res.status] || err.detail || `Error ${res.status}`);
    }
    const data: ChatResponse = await res.json();
    if (data.confidence && typeof data.confidence.percentage === 'number') {
      data.confidence.percentage = Math.max(0, Math.min(100, Math.round(data.confidence.percentage)));
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('No se pudo conectar con el servidor. Verifique su conexion a internet e intente de nuevo.');
    }
    throw err;
  }
}

type StreamCallback = (chunk: string, done: boolean) => void;

export async function sendChatStream(request: ChatRequest, onChunk: StreamCallback): Promise<{ sources: SourceInfo[], confidence: ConfidenceInfo }> {
  const res = await fetchWithRetry(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '' }));
    throw new Error(FRIENDLY_ERRORS[res.status] || err.detail || `Error ${res.status}`);
  }
  
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let sources: SourceInfo[] = [];
  let confidence: ConfidenceInfo = { level: 'bajo', percentage: 0, source_count: 0 };
  
  if (!reader) {
    throw new Error('No se pudo leer la respuesta');
  }
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) {
            onChunk(data.chunk, false);
          } else if (data.done) {
            sources = data.sources;
            confidence = data.confidence;
            onChunk('', true);
          }
        } catch {}
      }
    }
  }
  
  return { sources, confidence };
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(FRIENDLY_ERRORS[res.status] || 'Error cargando categorias');
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchDocuments(): Promise<{ documents: DocumentInfo[]; stats: Record<string, unknown> | null }> {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error(FRIENDLY_ERRORS[res.status] || 'Error cargando documentos');
    return res.json();
  } catch {
    return { documents: [], stats: null };
  }
}

export async function fetchModels(): Promise<ModelInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Error cargando modelos');
    return res.json();
  } catch {
    return [
      { id: "gpt-4o", name: "GPT-4o", desc: "Balance calidad/precio", input: 2.5, output: 10.0 },
      { id: "gpt-4o-mini", name: "GPT-4o mini", desc: "Rapido y economico", input: 0.15, output: 0.6 },
    ];
  }
}

export async function fetchDocumentContent(docId: number): Promise<DocumentContent | null> {
  try {
    const res = await fetch(`${API_BASE}/documents/${docId}/content`);
    if (!res.ok) throw new Error('Error cargando contenido');
    return res.json();
  } catch {
    return null;
  }
}