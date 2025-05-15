import type { Competition, CompetitionFormValues, ApiResponse } from "../types"
import { api } from "./api"

export interface CompetitionWithAthleteCount extends Competition {
  athleteCount: number;
}

export const getAllCompetitions = async (): Promise<ApiResponse<CompetitionWithAthleteCount[]>> => {
  try {
    const response = await api.get<ApiResponse<CompetitionWithAthleteCount[]>>("/competitions")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCompetitionById = async (id: string): Promise<ApiResponse<Competition>> => {
  try {
    const response = await api.get<ApiResponse<Competition>>(`/competitions/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const createCompetition = async (data: CompetitionFormValues): Promise<ApiResponse<Competition>> => {
  try {
    const response = await api.post<ApiResponse<Competition>>("/competitions", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const updateCompetition = async (
  id: string,
  data: Partial<CompetitionFormValues>,
): Promise<ApiResponse<Competition>> => {
  try {
    const response = await api.put<ApiResponse<Competition>>(`/competitions/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const deleteCompetition = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/competitions/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCompetitionsByFederation = async (federationId: string): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>(`/competitions/federation/${federationId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getInternationalCompetitions = async (): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>("/competitions/INTERNATIONAL")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getUpcomingCompetitions = async (): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>("/competitions/upcoming")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAssignedCompetitions = async (userId: string): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>(`/competitions/assigned/${userId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCompetitionsByClub = async (clubId: string): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>(`/competitions/club/${clubId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCompetitionsByDateRange = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>("/competitions/date-range", {
      params: { startDate, endDate },
    })
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCompetitionsByStatus = async (status: string): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>(`/competitions/status/${status}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export async function getFilteredCompetitions(): Promise<ApiResponse<Competition[]>> {
  try {
    const response = await api.get<ApiResponse<Competition[]>>("/competitions/filtered")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getEligibleCompetitions = async (): Promise<ApiResponse<Competition[]>> => {
  try {
    const response = await api.get<ApiResponse<Competition[]>>("/competitions/eligible")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

