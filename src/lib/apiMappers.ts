import type { ApiMatch, ApiPlayer, ApiMatchResult, ApiMatchType, ApiPlayerLevel } from '@/types/api';
import type { Match, MatchResult, MatchScore, MatchType, Player } from '@/types';

const LEVEL_API_TO_APP: Record<ApiPlayerLevel, string> = {
  BEGINNER: 'principiante',
  INTERMEDIATE: 'intermedio',
  ADVANCED: 'avanzado',
};

const LEVEL_APP_TO_API: Record<string, ApiPlayerLevel> = {
  principiante: 'BEGINNER',
  intermedio: 'INTERMEDIATE',
  avanzado: 'ADVANCED',
};

/** Parsea un resultado tipo "6-4, 6-3" o "6-2, 3-6, 10-8" a MatchScore */
function parseResultString(result: string): MatchScore | undefined {
  const parts = result.split(',').map((s) => s.trim());
  if (parts.length < 2) return undefined;
  const set1 = parts[0].split('-').map((n) => parseInt(n, 10));
  const set2 = parts[1].split('-').map((n) => parseInt(n, 10));
  if (set1.length !== 2 || set2.length !== 2 || set1.some(isNaN) || set2.some(isNaN)) {
    return undefined;
  }
  const score: MatchScore = {
    set1: { team1: set1[0], team2: set1[1] },
    set2: { team1: set2[0], team2: set2[1] },
  };
  if (parts[2]) {
    const set3 = parts[2].split('-').map((n) => parseInt(n, 10));
    if (set3.length === 2 && !set3.some(isNaN)) {
      score.set3 = { team1: set3[0], team2: set3[1] };
    }
  }
  return score;
}

/** Convierte ApiPlayer a Player de la app (nombre -> firstName/lastName) */
export function apiPlayerToAppPlayer(api: ApiPlayer): Player {
  const [firstName, ...rest] = (api.name || '').trim().split(/\s+/);
  const lastName = rest.join(' ') || '';
  return {
    id: api.id,
    firstName: firstName || '?',
    lastName,
    level: LEVEL_API_TO_APP[api.level] ?? api.level.toLowerCase(),
  };
}

/** Convierte Player de la app a { name, level } para crear/actualizar en API */
export function appPlayerToApiBody(p: { firstName?: string; lastName?: string; level?: string }) {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || 'Jugador';
  const level = (p.level && LEVEL_APP_TO_API[p.level]) || 'INTERMEDIATE';
  return { name, level: level as ApiPlayerLevel };
}

/** outcome API -> result app */
export function apiOutcomeToAppResult(outcome: ApiMatchResult): MatchResult {
  return outcome === 'VICTORY' ? 'won' : 'lost';
}

/** type API -> type app */
export function apiTypeToAppType(type: ApiMatchType): MatchType {
  return type === 'COMPETITIVE' ? 'tournament' : 'friendly';
}

export function appTypeToApiType(type: MatchType): ApiMatchType {
  return type === 'tournament' ? 'COMPETITIVE' : 'FRIENDLY';
}

export function appResultToApiOutcome(result: MatchResult): ApiMatchResult {
  return result === 'won' ? 'VICTORY' : 'DEFEAT';
}

/**
 * Convierte un partido del API al formato Match de la app.
 * Convención: players[0] = compañero, players[1] y [2] = rivales.
 * Usuario actual = userId (no está en players; el backend solo guarda los 3 otros jugadores).
 * userDisplayName: opcional, para mostrar "Tu nombre" en equipo 1.
 */
export function apiMatchToAppMatch(api: ApiMatch, userId: string, userDisplayName?: string): Match {
  const partner = api.players[0]?.player;
  const opp1 = api.players[1]?.player;
  const opp2 = api.players[2]?.player;
  const partnerApp = partner ? apiPlayerToAppPlayer(partner) : { id: '', firstName: '?', lastName: '' };
  const opp1App = opp1 ? apiPlayerToAppPlayer(opp1) : { id: '', firstName: '?', lastName: '' };
  const opp2App = opp2 ? apiPlayerToAppPlayer(opp2) : { id: '', firstName: '?', lastName: '' };
  const meAsPlayer: Player = {
    id: userId,
    firstName: userDisplayName?.trim() || 'Yo',
    lastName: '',
  };

  const clubName = api.club || 'Club';
  const clubId = clubName; // Backend no tiene IDs de club; usamos el nombre como id para compatibilidad.

  return {
    id: api.id,
    type: apiTypeToAppType(api.type),
    date: api.date,
    clubId,
    club: { id: clubId, name: clubName },
    team1Player1Id: userId,
    team1Player2Id: partnerApp.id,
    team2Player1Id: opp1App.id,
    team2Player2Id: opp2App.id,
    team1Players: [meAsPlayer, partnerApp],
    team2Players: [opp1App, opp2App],
    score: parseResultString(api.result),
    result: apiOutcomeToAppResult(api.outcome),
    createdAt: api.createdAt ?? api.date,
  };
}

/** Formato result string para el backend a partir de sets (ej: "6-4, 6-3") */
export function scoreToResultString(score: {
  set1: { team1: number; team2: number };
  set2: { team1: number; team2: number };
  set3?: { team1: number; team2: number };
}): string {
  const s1 = `${score.set1.team1}-${score.set1.team2}`;
  const s2 = `${score.set2.team1}-${score.set2.team2}`;
  if (score.set3) {
    return `${s1}, ${s2}, ${score.set3.team1}-${score.set3.team2}`;
  }
  return `${s1}, ${s2}`;
}
