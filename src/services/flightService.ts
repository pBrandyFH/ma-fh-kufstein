import { api } from "./api";
import { ApiResponse, Flight, CreateFlightFormValues, UpdateFlightStatusFormValues } from "@/types";

export async function getFlightsByCompetition(
  competitionId: string
): Promise<ApiResponse<Flight[]>> {
  try {
    const response = await api.get<ApiResponse<Flight[]>>(
      `/flights/competition/${competitionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching flights:", error);
    return {
      success: false,
      error: "Failed to fetch flights",
    };
  }
}

export async function createFlight(
  flight: CreateFlightFormValues
): Promise<ApiResponse<Flight>> {
  try {
    const response = await api.post<ApiResponse<Flight>>("/flights", flight);
    return response.data;
  } catch (error) {
    console.error("Error creating flight:", error);
    return {
      success: false,
      error: "Failed to create flight",
    };
  }
}

export async function updateFlightStatus(
  flightId: string,
  status: UpdateFlightStatusFormValues
): Promise<ApiResponse<Flight>> {
  try {
    const response = await api.patch<ApiResponse<Flight>>(
      `/flights/${flightId}/status`,
      status
    );
    return response.data;
  } catch (error) {
    console.error("Error updating flight status:", error);
    return {
      success: false,
      error: "Failed to update flight status",
    };
  }
}

export async function recalculateFlightStatus(
  flightId: string
): Promise<ApiResponse<Flight>> {
  try {
    const response = await api.post<ApiResponse<Flight>>(
      `/flights/${flightId}/recalculate-status`
    );
    return response.data;
  } catch (error) {
    console.error("Error recalculating flight status:", error);
    return {
      success: false,
      error: "Failed to recalculate flight status",
    };
  }
}

export async function updateFlight(
  flightId: string,
  flightData: CreateFlightFormValues
): Promise<ApiResponse<Flight>> {
  try {
    const response = await api.put<ApiResponse<Flight>>(
      `/flights/${flightId}`,
      flightData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating flight:", error);
    return {
      success: false,
      error: "Failed to update flight",
    };
  }
} 