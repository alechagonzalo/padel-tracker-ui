import type { Club } from '@/types';

export const LOCAL_CLUBS_KEY = 'padel_local_clubs';

export function getStoredLocalClubs(): Club[] {
  try {
    const raw = localStorage.getItem(LOCAL_CLUBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Club =>
        c != null && typeof c === 'object' && typeof (c as Club).id === 'string' && typeof (c as Club).name === 'string'
    );
  } catch {
    return [];
  }
}

export function setStoredLocalClubs(clubs: Club[]): void {
  localStorage.setItem(LOCAL_CLUBS_KEY, JSON.stringify(clubs));
}
