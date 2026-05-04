import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import type { Message } from '../types';
import { ConfidenceBadge, SourcesPanel } from './ChatComponents';

interface MessageBubbleProps {
  message: Message;
}

function sanitizeContent(content: string): string {
  const cleaned = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                    'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'table', 'thead', 
                    'tbody', 'tr', 'th', 'td', 'hr', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
  });
  return cleaned;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-5 animate-fade-in">
        <div className="max-w-[75%] bg-cream-dark rounded-2xl rounded-br-sm px-4 py-3 text-[0.9rem] leading-relaxed text-text-primary">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-5 animate-fade-in group">
      <div className="w-8 h-8 rounded-xl bg-midnight flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-[0.65rem] font-bold tracking-tight">UP</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-gold bg-gold/[0.08] px-2.5 py-0.5 rounded-full mb-2">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5"/></svg>
          NormativaUP
        </div>
        <div className="prose-normativa text-[0.9rem] leading-[1.7] text-text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {sanitizeContent(message.content)}
          </ReactMarkdown>
        </div>
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-[0.72rem] text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l2 2 6-6"/></svg>
                Copiado
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="5" width="7" height="7" rx="1"/><path d="M3 9V3.5A1.5 1.5 0 014.5 2H9"/></svg>
                Copiar
              </>
            )}
          </button>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <SourcesPanel sources={message.sources} />
          </div>
        )}
        {message.confidence && message.confidence.percentage > 0 && (
          <div className="mt-2">
            <ConfidenceBadge confidence={message.confidence} />
          </div>
        )}
      </div>
    </div>
  );
}