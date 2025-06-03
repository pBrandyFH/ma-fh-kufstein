import { api } from "./api";
import {
  ApiResponse,
  CreateNominationFormValues,
  Member,
  Nomination,
  WeightCategory,
} from "@/types";

export async function getNominationsByCompetitionId(
  competitionId: string
): Promise<ApiResponse<Nomination[]>> {
  try {
    const response = await api.get<ApiResponse<Nomination[]>>(
      `/nominations/competition/${competitionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nominations:", error);
    return {
      success: false,
      error: "Failed to fetch nominations",
    };
  }
}

export async function createNomination(
  nomination: CreateNominationFormValues
): Promise<ApiResponse<Nomination>> {
  try {
    const response = await api.post<ApiResponse<Nomination>>(
      "/nominations",
      nomination
    );
    return response.data;
  } catch (error) {
    console.error("Error creating nomination:", error);
    return {
      success: false,
      error: "Failed to create nomination",
    };
  }
}

export async function batchCreateNominations(
  nominations: Array<CreateNominationFormValues>
): Promise<ApiResponse<Nomination[]>> {
  try {
    const response = await api.post<ApiResponse<Nomination[]>>(
      "/nominations/batch",
      { nominations }
    );
    return response.data;
  } catch (error) {
    console.error("Error batch creating nominations:", error);
    return {
      success: false,
      error: "Failed to create nominations",
    };
  }
}

export async function deleteNomination(
  nominationId: string
): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(
      `/nominations/${nominationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting nomination:", error);
    return {
      success: false,
      error: "Failed to delete nomination",
    };
  }
}

export interface UpdateNominationFormValues {
  flightNumber?: number;
  groupNumber?: number;
  groupName?: string;
  groupStartTime?: Date;
  groupStatus?: "pending" | "active" | "completed";
}

export async function updateGroupForNomination(
  nominationId: string,
  values: UpdateNominationFormValues
): Promise<ApiResponse<Nomination>> {
  try {
    const response = await api.patch<ApiResponse<Nomination>>(
      `/nominations/${nominationId}`,
      values
    );
    return response.data;
  } catch (error) {
    console.error("Error updating nomination:", error);
    return {
      success: false,
      error: "Failed to update nomination",
    };
  }
}

export interface BatchUpdateNominationsRequest {
  nominations: Array<{
    nominationId: string;
    updates: UpdateNominationFormValues;
  }>;
}

export async function batchUpdateNominations(
  updates: BatchUpdateNominationsRequest
): Promise<ApiResponse<Nomination[]>> {
  try {
    const response = await api.patch<ApiResponse<Nomination[]>>(
      "/nominations/batch",
      updates
    );
    return response.data;
  } catch (error) {
    console.error("Error batch updating nominations:", error);
    return {
      success: false,
      error: "Failed to update nominations",
    };
  }
}

export async function getNominationsByCompetitionIdAndWeightCategories(
  competitionId: string,
  weightCategories?: WeightCategory[]
): Promise<ApiResponse<Nomination[]>> {
  try {
    const queryParams = weightCategories?.length 
      ? `?weightCategories=${weightCategories.join(',')}`
      : '';
    
    const response = await api.get<ApiResponse<Nomination[]>>(
      `/nominations/competition/${competitionId}/weight-categories${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nominations by weight categories:", error);
    return {
      success: false,
      error: "Failed to fetch nominations",
    };
  }
}
