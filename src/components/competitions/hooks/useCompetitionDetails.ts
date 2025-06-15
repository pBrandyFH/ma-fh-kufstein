import { useMemo } from 'react';
import { Competition, Nomination } from '@/types';
import { getCompetitionById } from '@/services/competitionService';
import { getNominationsByCompetitionId } from '@/services/nominationService';
import { useDataFetching } from '@/hooks/useDataFetching';

export function useCompetitionDetails(competitionId: string | undefined) {
  // Fetch competition data
  const {
    data: competition,
    loading: competitionLoading,
    error: competitionError,
    refetch: refetchCompetition,
  } = useDataFetching<Competition>({
    fetchFunction: () => getCompetitionById(competitionId ?? ""),
    dependencies: [competitionId],
    skip: !competitionId,
  });

  // Fetch nominations data
  const {
    data: nominations,
    loading: nominationsLoading,
    error: nominationsError,
    refetch: refetchNominations,
  } = useDataFetching<Nomination[]>({
    fetchFunction: () => getNominationsByCompetitionId(competitionId ?? ""),
    dependencies: [competitionId],
    skip: !competitionId,
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
    return !competition || !nominations;
  }, [competitionId, competition, nominations]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    competition: competition ?? null,
    nominations: nominations ?? null,
    isLoading,
    hasError,
    isNotFound,
    competitionError: competitionError ? String(competitionError) : null,
    nominationsError: nominationsError ? String(nominationsError) : null,
    refetchNominations,
    refetchCompetition,
  }), [
    competition,
    nominations,
    isLoading,
    hasError,
    isNotFound,
    competitionError,
    nominationsError,
    refetchNominations,
    refetchCompetition,
  ]);
} 