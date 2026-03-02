import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Match, Player } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPlayerDisplayName(player: Pick<Player, 'firstName' | 'lastName'>): string {
  return [player.firstName, player.lastName].filter(Boolean).join(' ').trim() || 'Jugador';
}

export interface Stats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
}

export function calculateStats(matches: Match[]): Stats {
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totalMatches = sorted.length;
  const wins = sorted.filter((m) => m.result === 'won').length;
  const losses = sorted.filter((m) => m.result === 'lost').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].result === 'won') {
      if (i === sorted.length - 1 || sorted[i + 1].result === 'won') {
        currentStreak++;
      }
    } else {
      break;
    }
  }

  for (const m of sorted) {
    if (m.result === 'won') {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { totalMatches, wins, losses, winRate, currentStreak, bestStreak };
}

export interface PartnerStats {
  played: number;
  won: number;
}

export function getPartnerStats(userId: string, partnerId: string, matches: Match[]): PartnerStats {
  const relevant = matches.filter((m) => {
    const team1 = [m.team1Player1Id, m.team1Player2Id];
    const team2 = [m.team2Player1Id, m.team2Player2Id];
    return (
      (team1.includes(userId) && team1.includes(partnerId)) ||
      (team2.includes(userId) && team2.includes(partnerId))
    );
  });
  return {
    played: relevant.length,
    won: relevant.filter((m) => m.result === 'won').length,
  };
}

export interface ClubStat {
  clubId: string;
  played: number;
  won: number;
}

export function getClubStats(matches: Match[]): ClubStat[] {
  const map = new Map<string, ClubStat>();
  for (const m of matches) {
    if (!m.clubId) continue;
    const existing = map.get(m.clubId) ?? { clubId: m.clubId, played: 0, won: 0 };
    existing.played++;
    if (m.result === 'won') existing.won++;
    map.set(m.clubId, existing);
  }
  return [...map.values()];
}
