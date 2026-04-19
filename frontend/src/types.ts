export interface ChatRequest {
  query: string;
  language?: string;
}

export interface SourceInfo {
  titulo: string;
  numero: string;
  anio: string;
  tipo: string;
  fragmento: string;
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
  titulo: string;
  numero: string;
  anio: string;
  tipo: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[];
  confidence?: ConfidenceInfo;
  language?: string;
}