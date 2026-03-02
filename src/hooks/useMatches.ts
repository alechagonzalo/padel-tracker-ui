import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import { matches as matchesApi } from '@/lib/api';
import { apiMatchToAppMatch } from '@/lib/apiMappers';
import { matchToDisplayMatch } from '@/lib/matchDisplay';
import type { ApiMatch } from '@/types/api';

export const MATCHES_KEY = '/api/matches';

async function fetchMatches(): Promise<ApiMatch[]> {
  return matchesApi.list();
}

export function useMatches() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const userDisplayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const { data: raw, error, isLoading } = useSWR<ApiMatch[]>(MATCHES_KEY, fetchMatches);

  const matchesList = (raw ?? []).map((m) => apiMatchToAppMatch(m, userId, userDisplayName));
  const displayMatches = matchesList.map((m) => matchToDisplayMatch(m, userId));

  return { matchesList, displayMatches, error, isLoading };
}

export function useMatch(id: string | undefined) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const userDisplayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const key = id ? `/api/matches/${id}` : null;
  const { data: raw, error, isLoading } = useSWR<ApiMatch>(
    key,
    () => matchesApi.get(id!),
  );

  const match = raw ? apiMatchToAppMatch(raw, userId, userDisplayName) : null;

  return { match, error, isLoading };
}

export async function revalidateMatches() {
  await mutate(MATCHES_KEY);
}
