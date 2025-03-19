import { api } from "./api"
import type { ApiResponse, InvitationFormValues, PopulatedInvitation, InviteValidationResponse } from "../types"

export const sendInvitation = async (
  data: InvitationFormValues,
): Promise<ApiResponse<{ inviteCode: string; expiresAt: string }>> => {
  try {
    const response = await api.post<ApiResponse<{ inviteCode: string; expiresAt: string }>>("/auth/invite", data)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getMyInvitations = async (): Promise<ApiResponse<PopulatedInvitation[]>> => {
  try {
    const response = await api.get<ApiResponse<PopulatedInvitation[]>>("/auth/my-invitations")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const getAllInvitations = async (): Promise<ApiResponse<PopulatedInvitation[]>> => {
  try {
    const response = await api.get<ApiResponse<PopulatedInvitation[]>>("/auth/invitations")
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const resendInvitation = async (id: string): Promise<ApiResponse<PopulatedInvitation>> => {
  try {
    const response = await api.post<ApiResponse<PopulatedInvitation>>(`/auth/invitations/${id}/resend`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const deleteInvitation = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/auth/invitations/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export const validateInviteCode = async (
  inviteCode: string,
  email: string,
): Promise<ApiResponse<InviteValidationResponse>> => {
  try {
    const response = await api.post<ApiResponse<InviteValidationResponse>>("/auth/validate-invite", {
      inviteCode,
      email,
    })
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

