export type MatchType = 'friendly' | 'tournament';

export type MatchResult = 'won' | 'lost' | 'pending';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  level?: string; // Nivel de juego: principiante, intermedio, avanzado, profesional
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  city?: string;
  address?: string;
  courtCount?: number;
  imageUrl?: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  level?: string;
}

export interface MatchScore {
  set1: { team1: number; team2: number };
  set2: { team1: number; team2: number };
  set3?: { team1: number; team2: number }; // Desempate si hay
}

export interface Match {
  id: string;
  type: MatchType;
  date: string; // ISO
  clubId: string;
  club?: Club;
  // Equipo 1: usuario + compañero
  team1Player1Id: string;
  team1Player2Id: string;
  team2Player1Id: string;
  team2Player2Id: string;
  team1Players?: Player[];
  team2Players?: Player[];
  score?: MatchScore;
  result?: MatchResult; // Para el usuario actual: won | lost
  notes?: string;
  createdAt: string;
}

