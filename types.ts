
export enum DebateSide {
  PRO = '正方',
  CON = '反方'
}

export enum GameMode {
  AI_CHALLENGE = 'AI挑战',
  TWO_PLAYERS = '双人对战'
}

export interface DebaterProfile {
  id: string;
  name: string;
  title: string;
  style: string;
  description: string;
  avatar: string;
  traits: string[];
}

export interface Message {
  role: 'user' | 'ai' | 'player1' | 'player2' | 'system';
  content: string;
  senderName: string;
  timestamp: number;
}

export interface CoachAnalysis {
  logicSummary: string;
  weakness: string;
  suggestions: string[];
  goldenQuotes: string[];
  geng: string[];
}

export interface DanmakuMessage {
  id: string;
  text: string;
  top: number;
  color: string;
  speed: number;
}
