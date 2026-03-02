/**
 * Tipos que coinciden con las respuestas del backend (padel-backend).
 */

export type ApiPlayerLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ApiMatchResult = 'VICTORY' | 'DEFEAT';
export type ApiMatchType = 'COMPETITIVE' | 'FRIENDLY';

export interface ApiUser {
  id: string;
  email: string;
  createdAt?: string;
}

export interface ApiPlayer {
  id: string;
  name: string;
  level: ApiPlayerLevel;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiMatchPlayer {
  id: string;
  matchId: string;
  playerId: string;
  player: ApiPlayer;
}

export interface ApiMatch {
  id: string;
  result: string;
  club: string;
  date: string;
  outcome: ApiMatchResult;
  type: ApiMatchType;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  players: ApiMatchPlayer[];
}

export interface ApiEnums {
  playerLevels: ApiPlayerLevel[];
  matchResults: ApiMatchResult[];
  matchTypes: ApiMatchType[];
}

export interface AuthLoginResponse {
  user: ApiUser;
  token: string;
}

export interface AuthRegisterResponse {
  user: ApiUser;
  token: string;
}
