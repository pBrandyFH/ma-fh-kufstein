import type { LoginFormValues, RegisterFormValues, ApiResponse, User } from "../types"
import { api } from "./api"

interface AuthResponse {
  token: string
  user: User
}

export const login = async (data: LoginFormValues): Promise<ApiResponse<AuthResponse>> => {
  try {
    console.log("Attempting login...") // Debug log
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data)
    console.log("Login response:", response.data) // Debug log
    
    if (response.data.success && response.data.data) {
      console.log("Storing token:", response.data.data.token) // Debug log
      localStorage.setItem("token", response.data.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.data.user))
      console.log("Token stored successfully") // Debug log
    }
    
    return response.data
  } catch (error) {
    console.error("Login error:", error) // Debug log
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
    console.log("Logging out...") // Debug log
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    console.log("Token removed from localStorage") // Debug log
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error) // Debug log
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user")
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error("Error parsing user data:", error) // Debug log
      return null
    }
  }
  return null
}

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token")
  console.log("Checking authentication, token:", token) // Debug log
  return !!token
}

