import { api } from "./api";
import { Result } from "@/types";

interface SaveWeighInData {
  athleteId: string;
  nominationId: string;
  competitionId: string;
  bodyweight: number;
  lotNumber: number;
  startWeights: {
    squat: number;
    bench: number;
    deadlift: number;
  };
  flightId: string;
  groupId: string;
  ageCategory: string;
  weightCategory: string;
}

interface SaveAttemptData {
  athleteId: string;
  competitionId: string;
  liftType: "squat" | "bench" | "deadlift";
  attemptNumber: number;
  weight: number;
  status: "good" | "noGood" | "pending";
  flightId: string;
  groupId: string;
}

type GroupedResults = {
  [gender: string]: {
    [weightCategory: string]: {
      [ageCategory: string]: Result[];
    };
  };
};

export const resultService = {
  // Save weigh-in data for an athlete
  saveWeighIn: async (data: SaveWeighInData) => {
    const response = await api.post<{ success: boolean; data: Result }>("/results/weigh-in", data);
    return response.data;
  },

  // Save attempt data for an athlete
  saveAttempt: async (data: SaveAttemptData) => {
    const response = await api.post<{ success: boolean; data: Result }>("/results/attempt", data);
    return response.data;
  },

  // Get results for a specific competition, flight, and group
  getResultsByCompetitionAndFlight: async (competitionId: string, flightNumber: number, groupNumber: number) => {
    const response = await api.get<{ success: boolean; data: Result[] }>(
      `/results/competition/${competitionId}/flight/${flightNumber}/group/${groupNumber}`
    );
    return response.data;
  },

  // Get results for a specific athlete in a competition
  getResultByAthleteAndCompetition: async (athleteId: string, competitionId: string) => {
    const response = await api.get<{ success: boolean; data: Result }>(
      `/results/athlete/${athleteId}/competition/${competitionId}`
    );
    return response.data;
  },

  // Get all results for a competition
  getResultsByCompetition: async (competitionId: string) => {
    const response = await api.get<{ success: boolean; data: GroupedResults }>(
      `/results/competition/${competitionId}`
    );
    return response.data;
  },

  // Get results for a specific athlete
  getResultsByAthlete: async (athleteId: string) => {
    const response = await api.get<{ success: boolean; data: Result[] }>(
      `/results/athlete/${athleteId}`
    );
    return response.data;
  },

  // Get results for a specific federation
  getResultsByFederation: async (federationId: string) => {
    const response = await api.get<{ success: boolean; data: Result[] }>(
      `/results/federation/${federationId}`
    );
    return response.data;
  },

  // Get results for a specific club
  getResultsByClub: async (clubId: string) => {
    const response = await api.get<{ success: boolean; data: Result[] }>(
      `/results/club/${clubId}`
    );
    return response.data;
  },

  // Get rankings for a competition
  getCompetitionRankings: async (competitionId: string) => {
    const response = await api.get<{ success: boolean; data: Result[] }>(
      `/results/rankings/competition/${competitionId}`
    );
    return response.data;
  },

  // Get results for multiple athletes in a competition
  getResultsByCompetitionAndAthletes: async (competitionId: string, athleteIds: string[]) => {
    const response = await api.post<{ success: boolean; data: Result[] }>(
      `/results/competition/${competitionId}/athletes`,
      { athleteIds }
    );
    return response.data;
  },
};
