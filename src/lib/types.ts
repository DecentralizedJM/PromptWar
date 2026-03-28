export type DomainType = 'HEALTH' | 'FINANCE' | 'LOGISTICS' | 'GOVERNMENT_LEGAL' | 'GENERAL';

export interface Action {
  type: 'ADD_CALENDAR' | 'DRAFT_EMAIL' | 'SET_REMINDER' | 'GENERATE_PDF' | 'TRANSLATE';
  label: string;
  payload: Record<string, string>;
}

export interface CardItem {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'success';
}

export interface StructuredCard {
  id: string;
  domain: DomainType;
  title: string;
  summary: string;
  logicReasoning: string;
  items: CardItem[];
  confidenceScore: number;
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

// Bridge Share types
export interface SharedBridge {
  shareId: string;
  cards: StructuredCard[];
  createdAt: number;
  expiresAt: number;
  title: string;
}

// Family Mode types
export interface FamilyRoom {
  roomCode: string;
  createdAt: number;
  members: RoomMember[];
}

export interface RoomMember {
  id: string;
  name: string;
  emoji: string;
  joinedAt: number;
}

export interface RoomCard extends StructuredCard {
  contributedBy: string;
  contributorEmoji: string;
  addedAt: number;
}
