import type { Athlete, AthleteFormValues, ApiResponse } from "../types"
import { api } from "./api"

export const getAthletes = async (): Promise<ApiResponse<Athlete[]>> => {
  try {
    const response = await api.get<ApiResponse<Athlete[]>>("/athletes")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAthleteById = async (id: string): Promise<ApiResponse<Athlete>> => {
  try {
    const response = await api.get<ApiResponse<Athlete>>(`/athletes/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const createAthlete = async (data: AthleteFormValues): Promise<ApiResponse<Athlete>> => {
  try {
    const response = await api.post<ApiResponse<Athlete>>("/athletes", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const updateAthlete = async (id: string, data: Partial<AthleteFormValues>): Promise<ApiResponse<Athlete>> => {
  try {
    const response = await api.put<ApiResponse<Athlete>>(`/athletes/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const deleteAthlete = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/athletes/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAthletesByClub = async (clubId: string): Promise<ApiResponse<Athlete[]>> => {
  try {
    const response = await api.get<ApiResponse<Athlete[]>>(`/athletes/club/${clubId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAthletesByFederation = async (federationId: string): Promise<ApiResponse<Athlete[]>> => {
  try {
    const response = await api.get<ApiResponse<Athlete[]>>(`/athletes/federation/${federationId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAthletesByCompetition = async (competitionId: string): Promise<ApiResponse<Athlete[]>> => {
  try {
    const response = await api.get<ApiResponse<Athlete[]>>(`/athletes/competition/${competitionId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAthletesByCoach = async (coachId: string): Promise<ApiResponse<Athlete[]>> => {
  try {
    const response = await api.get<ApiResponse<Athlete[]>>(`/athletes/coach/${coachId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

