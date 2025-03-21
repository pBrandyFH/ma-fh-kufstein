import type { User, ApiResponse } from "../types"
import { api } from "./api"

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const updateUser = async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const deleteUser = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get<ApiResponse<User[]>>("/users")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getUsersByRole = async (role: string): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(`/users/role/${role}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getUsersByFederation = async (federationId: string): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(`/users/federation/${federationId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getUsersByClub = async (clubId: string): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(`/users/club/${clubId}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

