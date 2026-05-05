export interface ChatRequest {
  query: string;
  language?: string;
  model?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  desc: string;
  input: number;
  output: number;
}

export interface SourceInfo {
  titulo: string;
  numero: string;
  anio: string;
  tipo: string;
  fragmento: string;
  doc_id: number;
}

export interface ConfidenceInfo {
  level: string;
  percentage: number;
  source_count: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceInfo[];
  confidence: ConfidenceInfo;
  language: string;
}

export interface CategoryInfo {
  label: string;
  query: string;
  icon: string;
}

export interface DocumentInfo {
  id: number;
  titulo: string;
  numero: string;
  anio: string;
  tipo: string;
}

export interface DocumentContent {
  id: number;
  titulo: string;
  numero: string;
  anio: string;
  tipo: string;
  total_pages: number;
  content: string;
  pages: { page: number; content: string }[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[];
  confidence?: ConfidenceInfo;
  language?: string;
}

export interface ConversationEntry {
  id: string;
  messages: Message[];
  title: string;
  date: string;
}