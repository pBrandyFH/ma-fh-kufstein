import type { Club, ClubFormValues, ApiResponse } from "../types"
import { api } from "./api"

export const getAllClubs = async (): Promise<ApiResponse<Club[]>> => {
  try {
    const response = await api.get<ApiResponse<Club[]>>("/clubs")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getClubById = async (id: string): Promise<ApiResponse<Club>> => {
  try {
    const response = await api.get<ApiResponse<Club>>(`/clubs/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const createClub = async (data: ClubFormValues): Promise<ApiResponse<Club>> => {
  try {
    const response = await api.post<ApiResponse<Club>>("/clubs", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const updateClub = async (id: string, data: Partial<ClubFormValues>): Promise<ApiResponse<Club>> => {
  try {
    const response = await api.put<ApiResponse<Club>>(`/clubs/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const deleteClub = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/clubs/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getClubsByFederation = async (federationId: string): Promise<ApiResponse<Club[]>> => {
  try {
    const response = await api.get<ApiResponse<Club[]>>(`/clubs/federation/${federationId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

