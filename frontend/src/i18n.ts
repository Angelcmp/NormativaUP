export type Lang = 'es' | 'en';

export interface Strings {
  appSubtitle: string;
  newChat: string;
  history: string;
  documents: string;
  noConversations: string;
  menu: string;
  closeSidebar: string;
  delete: string;
  disclaimer: string;
  footer: string;
  placeholder: string;
  stop: string;
  retry: string;
  copy: string;
  copied: string;
  sources: string;
  view: string;
  page: string;
  confidence: Record<string, string>;
  welcomeSubtitle: string;
  suggestions: { text: string; icon: string }[];
  selectDocument: string;
  collapsePanel: string;
  openPanel: string;
  categoryLabels: Record<string, string>;
}

export const STRINGS: Record<Lang, Strings> = {
  es: {
    appSubtitle: 'Universidad de Panama',
    newChat: 'Nueva consulta',
    history: 'Historial',
    documents: 'Documentos',
    noConversations: 'Sin conversaciones',
    menu: 'Abrir menu',
    closeSidebar: 'Cerrar sidebar',
    delete: 'Eliminar',
    disclaimer: 'Herramienta orientativa',
    footer: 'NormativaUP \u00b7 Universidad de Panama \u00b7 Herramienta orientativa, no sustituye asesoria legal',
    placeholder: 'Consulte leyes de Panama...',
    stop: 'Detener',
    retry: 'Reintentar',
    copy: 'Copiar',
    copied: 'Copiado',
    sources: 'Fuentes',
    view: 'Ver',
    page: 'p.',
    confidence: { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' },
    welcomeSubtitle: 'Consulta leyes, decretos y normas de Panama en lenguaje natural',
    suggestions: [
      { text: 'Requisitos para beca del IFARHU', icon: '\u{1F4DA}' },
      { text: 'Ley sobre teletrabajo en Panama', icon: '\u2696\uFE0F' },
      { text: 'Ley 187 de 2020 - proteccion de datos', icon: '\u{1F512}' },
      { text: 'Obligaciones laborales del empleador', icon: '\u{1F3E5}' },
    ],
    selectDocument: 'Seleccione un documento',
    collapsePanel: 'Colapsar panel',
    openPanel: 'Abrir panel de documentos',
    categoryLabels: {
      Educacion: 'Educacion',
      Trabajo: 'Trabajo',
      Salud: 'Salud',
      Gobierno: 'Gobierno',
      Transito: 'Transito',
      Ambiente: 'Ambiente',
      Tributos: 'Tributos',
      'Datos personales': 'Datos personales',
    },
  },
  en: {
    appSubtitle: 'University of Panama',
    newChat: 'New chat',
    history: 'History',
    documents: 'Documents',
    noConversations: 'No conversations',
    menu: 'Open menu',
    closeSidebar: 'Close sidebar',
    delete: 'Delete',
    disclaimer: 'Guidance tool',
    footer: 'NormativaUP \u00b7 University of Panama \u00b7 Guidance tool, does not replace legal advice',
    placeholder: 'Ask about Panamanian laws...',
    stop: 'Stop',
    retry: 'Retry',
    copy: 'Copy',
    copied: 'Copied',
    sources: 'Sources',
    view: 'View',
    page: 'p.',
    confidence: { alto: 'High', medio: 'Medium', bajo: 'Low' },
    welcomeSubtitle: 'Ask about laws, decrees and regulations of Panama in natural language',
    suggestions: [
      { text: 'Requirements for an IFARHU scholarship', icon: '\u{1F4DA}' },
      { text: 'Telework law in Panama', icon: '\u2696\uFE0F' },
      { text: 'Law 187 of 2020 - data protection', icon: '\u{1F512}' },
      { text: 'Employer labor obligations', icon: '\u{1F3E5}' },
    ],
    selectDocument: 'Select a document',
    collapsePanel: 'Collapse panel',
    openPanel: 'Open documents panel',
    categoryLabels: {
      Educacion: 'Education',
      Trabajo: 'Labor',
      Salud: 'Health',
      Gobierno: 'Government',
      Transito: 'Traffic',
      Ambiente: 'Environment',
      Tributos: 'Taxes',
      'Datos personales': 'Personal data',
    },
  },
};

export function getStrings(lang: string | undefined): Strings {
  return STRINGS[lang === 'English' ? 'en' : 'es'];
}

export function toLang(language: string | undefined): Lang {
  return language === 'English' ? 'en' : 'es';
}
