import type { Match, Player } from '@/types';

export interface DisplayMatch {
  id: string;
  date: string;
  location: string;
  partner: Player;
  opponents: [Player, Player];
  result: { myTeam: number[]; opponentTeam: number[] };
  won: boolean;
  category: 'friendly' | 'competitive';
  tournamentName?: string;
}

/**
 * Convierte nuestro Match al formato que usa MatchCard (v0).
 * userId: id del usuario actual para saber qué equipo es "mi equipo".
 */
export function matchToDisplayMatch(match: Match, userId: string): DisplayMatch {
  const isUserInTeam1 =
    match.team1Player1Id === userId || match.team1Player2Id === userId;
  const team1 = match.team1Players ?? [];
  const team2 = match.team2Players ?? [];
  const myTeamPlayers = isUserInTeam1 ? team1 : team2;
  const oppPlayers = isUserInTeam1 ? team2 : team1;
  const partner = myTeamPlayers.find((p) => p.id !== userId) ?? { id: '', firstName: '?', lastName: '' };
  const opponents: [Player, Player] = [
    oppPlayers[0] ?? { id: '', firstName: '?', lastName: '' },
    oppPlayers[1] ?? { id: '', firstName: '?', lastName: '' },
  ];

  const score = match.score;
  const myTeamSets: number[] = [];
  const opponentTeamSets: number[] = [];
  if (score) {
    myTeamSets.push(isUserInTeam1 ? score.set1.team1 : score.set1.team2);
    opponentTeamSets.push(isUserInTeam1 ? score.set1.team2 : score.set1.team1);
    myTeamSets.push(isUserInTeam1 ? score.set2.team1 : score.set2.team2);
    opponentTeamSets.push(isUserInTeam1 ? score.set2.team2 : score.set2.team1);
    if (score.set3) {
      myTeamSets.push(isUserInTeam1 ? score.set3.team1 : score.set3.team2);
      opponentTeamSets.push(isUserInTeam1 ? score.set3.team2 : score.set3.team1);
    }
  }

  return {
    id: match.id,
    date: match.date,
    location: match.club?.name ?? 'Club',
    partner,
    opponents,
    result: { myTeam: myTeamSets, opponentTeam: opponentTeamSets },
    won: match.result === 'won',
    category: match.type === 'tournament' ? 'competitive' : 'friendly',
    tournamentName: match.type === 'tournament' ? match.notes : undefined,
  };
}
