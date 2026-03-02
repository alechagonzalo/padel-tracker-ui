import useSWR, { mutate } from 'swr';
import { players as playersApi } from '@/lib/api';
import { apiPlayerToAppPlayer } from '@/lib/apiMappers';
import { getPlayerDisplayName } from '@/lib/utils';
import type { ApiPlayer } from '@/types/api';

export const PLAYERS_KEY = '/api/players';

async function fetchPlayers(): Promise<ApiPlayer[]> {
  return playersApi.list();
}

export function usePlayers() {
  const { data: raw, error, isLoading } = useSWR<ApiPlayer[]>(PLAYERS_KEY, fetchPlayers);

  const playersList = (raw ?? [])
    .map(apiPlayerToAppPlayer)
    .sort((a, b) => getPlayerDisplayName(a).localeCompare(getPlayerDisplayName(b)));

  return { playersList, error, isLoading };
}

export async function revalidatePlayers() {
  await mutate(PLAYERS_KEY);
}
