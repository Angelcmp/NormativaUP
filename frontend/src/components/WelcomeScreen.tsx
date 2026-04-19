interface WelcomeScreenProps {
  onSuggestionClick: (query: string) => void;
}

const SUGGESTIONS = [
  { text: 'Requisitos para beca del IFARHU', icon: '\u{1F4DA}' },
  { text: 'Ley sobre teletrabajo en Panama', icon: '\u2696\uFE0F' },
  { text: 'Ley 187 de 2020 - proteccion de datos', icon: '\u{1F512}' },
  { text: 'Obligaciones laborales del empleador', icon: '\u{1F3E5}' },
];

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-16">
      <div className="w-14 h-14 rounded-2xl bg-midnight flex items-center justify-center mb-6 shadow-lg shadow-midnight/20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6l3 1.5L12 4l6 3.5L21 6v6l-3 1.5v5l-6 3-6-3v-5L3 12V6z"/>
          <path d="M12 4v8M9 7.5l3-1.5 3 1.5"/>
        </svg>
      </div>
      <h1 className="font-serif text-[2.5rem] font-bold text-midnight tracking-tight mb-2">
        NormativaUP
      </h1>
      <p className="text-text-secondary text-base font-light mb-10 text-center max-w-md leading-relaxed">
        Consulta leyes, decretos y normas de Panama en lenguaje natural
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[600px] w-full">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggestionClick(s.text)}
            className="group bg-paper rounded-xl border border-section hover:border-navy-light/20 px-4 py-4 text-left text-[0.85rem] text-text-primary hover:bg-cream-dark hover:-translate-y-0.5 transition-all cursor-pointer leading-snug shadow-sm hover:shadow-md"
          >
            <span className="text-[0.9rem] mr-2">{s.icon}</span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}