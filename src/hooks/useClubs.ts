import useSWR from 'swr';
import { clubs as clubsApi } from '@/lib/api';
import type { ApiClub } from '@/types/api';
import type { Club, ClubType } from '@/types';

function apiCourtTypeToApp(courtType: ApiClub['courtType']): ClubType {
  return courtType === 'INDOOR' ? 'indoor' : 'outdoor';
}

function apiClubToApp(api: ApiClub): Club {
  return {
    id: api.id,
    name: api.name,
    type: apiCourtTypeToApp(api.courtType),
  };
}

async function fetchClubs(): Promise<Club[]> {
  const list = await clubsApi.list();
  return list.map(apiClubToApp);
}

export const CLUBS_KEY = '/api/clubs';

/** Lista de clubes desde la API (ordenados por nombre). */
export function useClubs() {
  const { data: clubsList = [], error, isLoading, mutate } = useSWR<Club[]>(CLUBS_KEY, fetchClubs);
  return { clubsList, error, isLoading, revalidateClubs: mutate };
}

/** Revalidar caché de clubes (tras crear/editar/eliminar). */
export async function revalidateClubs() {
  const { mutate } = await import('swr');
  return mutate(CLUBS_KEY);
}
