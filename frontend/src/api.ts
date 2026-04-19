import type { ChatRequest, ChatResponse, CategoryInfo, DocumentInfo } from './types';

const API_BASE = '/api';

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en la consulta');
  }
  return res.json();
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Error cargando categorias');
  return res.json();
}

export async function fetchDocuments(): Promise<{ documents: DocumentInfo[]; stats: Record<string, unknown> | null }> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Error cargando documentos');
  return res.json();
}