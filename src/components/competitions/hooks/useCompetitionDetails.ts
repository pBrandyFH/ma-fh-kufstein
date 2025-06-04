import { useMemo } from 'react';
import { Competition, Nomination, ApiResponse } from '@/types';
import { getCompetitionById } from '@/services/competitionService';
import { getNominationsByCompetitionId } from '@/services/nominationService';
import { useQuery } from '@tanstack/react-query';

export function useCompetitionDetails(competitionId: string | undefined) {
  // Query for competition data
  const {
    data: competition,
    isLoading: competitionLoading,
    error: competitionError,
  } = useQuery<ApiResponse<Competition>>({
    queryKey: ['competition', competitionId],
    queryFn: () => getCompetitionById(competitionId ?? ""),
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Query for nominations data
  const {
    data: nominations,
    isLoading: nominationsLoading,
    error: nominationsError,
    refetch: refetchNominations,
  } = useQuery<ApiResponse<Nomination[]>>({
    queryKey: ['nominations', competitionId],
    queryFn: () => getNominationsByCompetitionId(competitionId ?? ""),
    enabled: !!competitionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Memoize derived state
  const isLoading = useMemo(() => {
    if (!competitionId) return false;
    return competitionLoading || nominationsLoading;
  }, [competitionId, competitionLoading, nominationsLoading]);

  const hasError = useMemo(() => {
    if (!competitionId) return false;
    return Boolean(competitionError || nominationsError);
  }, [competitionId, competitionError, nominationsError]);

  const isNotFound = useMemo(() => {
    if (!competitionId) return true;
    return !competition?.data || !nominations?.data;
  }, [competitionId, competition?.data, nominations?.data]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    competition: competition?.data ?? null,
    nominations: nominations?.data ?? null,
    isLoading,
    hasError,
    isNotFound,
    competitionError: competitionError ? String(competitionError) : null,
    nominationsError: nominationsError ? String(nominationsError) : null,
    refetchNominations,
  }), [
    competition?.data,
    nominations?.data,
    isLoading,
    hasError,
    isNotFound,
    competitionError,
    nominationsError,
    refetchNominations,
  ]);
} 