import { api } from "./api";
import {
  ApiResponse,
  CreateNominationFormValues,
  Member,
  Nomination,
} from "@/types";

export async function getNominationsByCompetitionId(
  compId: string
): Promise<ApiResponse<Nomination[]>> {
  try {
    const response = await api.get<ApiResponse<Nomination[]>>(
      `/nominations/competition/${compId}`
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
