export type DomainType = 'HEALTH' | 'FINANCE' | 'LOGISTICS' | 'GOVERNMENT_LEGAL' | 'GENERAL';

export interface Action {
  type: 'ADD_CALENDAR' | 'DRAFT_EMAIL' | 'SET_REMINDER' | 'GENERATE_PDF' | 'TRANSLATE';
  label: string;
  payload: Record<string, string>; // e.g. { to: "doc@doc.com", subject: "...", body: "..." }
}

export interface CardItem {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'success'; // 'warning' uses amber, 'success' uses seafoam
}

export interface StructuredCard {
  id: string;
  domain: DomainType;
  title: string;
  summary: string;
  logicReasoning: string; // Explains the internal AI logic behind this specific categorization/status
  items: CardItem[];
  confidenceScore: number; // 0 to 100
  actions: Action[];
}

export interface ProcessingResult {
  cards: StructuredCard[];
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputSummary: string;
  results: StructuredCard[];
}
