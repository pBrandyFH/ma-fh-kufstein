import type { LoginFormValues, RegisterFormValues, ApiResponse, User } from "../types"
import { api } from "./api"

interface AuthResponse {
  token: string
  user: User
}

export const login = async (data: LoginFormValues): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const register = async (data: RegisterFormValues): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem("user")
  if (userJson) {
    try {
      return JSON.parse(userJson) as User
    } catch {
      return null
    }
  }
  return null
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token")
}

