import { useState, useEffect, useRef } from 'react';
import type { DocumentInfo } from '../types';
import { fetchDocuments } from '../api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface DocumentPanelProps {
  selectedDocId: number | null;
  onSelectDoc: (docId: number | null) => void;
  open: boolean;
  onToggle: () => void;
}

export default function DocumentPanel({ selectedDocId, onSelectDoc, open, onToggle }: DocumentPanelProps) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetchDocuments().then((data) => setDocuments(data.documents));
  }, []);

  useEffect(() => {
    if (!selectedDocId) {
      setSelectedDoc(null);
      setPdfUrl(null);
      return;
    }
    const doc = documents.find((d) => d.id === selectedDocId);
    setSelectedDoc(doc || null);

    if (currentIdRef.current === selectedDocId) return;
    currentIdRef.current = selectedDocId;

    setLoading(true);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);

    fetch(`${API_BASE}/documents/${selectedDocId}/pdf`)
      .then((res) => {
        if (!res.ok) throw new Error('Error');
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedDocId, documents]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  return (
    <aside className={`${open ? '' : 'hidden'} w-[620px] bg-paper border-l border-section/60 flex flex-col h-full overflow-hidden flex-shrink-0 max-lg:hidden`}>
      <div className="px-4 py-3 border-b border-section/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-md bg-section/60 hover:bg-section text-text-tertiary hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Colapsar panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
          </button>
          <h2 className="text-[0.8rem] font-semibold text-midnight font-serif tracking-tight truncate">
            {selectedDoc ? selectedDoc.titulo : 'Documentos'}
          </h2>
        </div>
        {selectedDoc && (
          <button
            onClick={() => onSelectDoc(null)}
            className="w-6 h-6 rounded-md text-text-tertiary hover:text-text-primary hover:bg-section/50 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l8 8M11 3l-8 8"/></svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {!selectedDocId && (
          <div className="p-3 space-y-1 overflow-y-auto h-full">
            <p className="text-[0.68rem] text-text-tertiary px-2 pb-1">Seleccione un documento</p>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-[0.78rem] text-text-secondary hover:text-text-primary hover:bg-cream-dark transition-colors border border-transparent hover:border-section/50 cursor-pointer"
              >
                <span className="font-medium text-midnight">{doc.tipo} {doc.numero} de {doc.anio}</span>
                <span className="block text-[0.7rem] text-text-tertiary truncate">{doc.titulo}</span>
              </button>
            ))}
          </div>
        )}

        {loading && selectedDocId && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-muted border-t-midnight rounded-full animate-spin" />
          </div>
        )}

        {pdfUrl && !loading && (
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
          />
        )}
      </div>
    </aside>
  );
}
