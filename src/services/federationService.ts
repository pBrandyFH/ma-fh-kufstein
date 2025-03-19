import type { Federation, FederationType, ApiResponse } from "../types"
import { api } from "./api"

export const getAllFederations = async (): Promise<ApiResponse<Federation[]>> => {
  try {
    const response = await api.get<ApiResponse<Federation[]>>("/federations")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getFederationById = async (id: string): Promise<ApiResponse<Federation>> => {
  try {
    const response = await api.get<ApiResponse<Federation>>(`/federations/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const createFederation = async (data: any): Promise<ApiResponse<Federation>> => {
  try {
    const response = await api.post<ApiResponse<Federation>>("/federations", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const updateFederation = async (id: string, data: any): Promise<ApiResponse<Federation>> => {
  try {
    const response = await api.put<ApiResponse<Federation>>(`/federations/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const deleteFederation = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/federations/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getFederationsByType = async (type: FederationType): Promise<ApiResponse<Federation[]>> => {
  try {
    const response = await api.get<ApiResponse<Federation[]>>(`/federations/type/${type}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getFederationsByParent = async (parentId: string): Promise<ApiResponse<Federation[]>> => {
  try {
    const response = await api.get<ApiResponse<Federation[]>>(`/federations/parent/${parentId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getChildFederations = async (federationId: string): Promise<ApiResponse<Federation[]>> => {
  try {
    const response = await api.get<ApiResponse<Federation[]>>(`/federations/${federationId}/children`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

// Helper function to determine federation type based on parent
export const determineFederationType = (parentType: FederationType | null): FederationType => {
  if (!parentType) return "international"

  switch (parentType) {
    case "international":
      return "continental"
    case "continental":
      return "national"
    case "national":
      return "federalState"
    default:
      return "federalState"
  }
}

// Helper function to get user role based on federation type
export const getFederationAdminRole = (federationType: FederationType): string => {
  switch (federationType) {
    case "international":
      return "internationalAdmin"
    case "continental":
      return "continentalAdmin"
    case "national":
      return "stateAdmin"
    case "federalState":
      return "federalStateAdmin"
    default:
      return "federalStateAdmin"
  }
}

