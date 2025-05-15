import { api } from "./api"
import type { Federation, FederationType, ApiResponse } from "../types"

export async function getAllFederations(): Promise<ApiResponse<Federation[]>> {
  try {
    const response = await api.get<ApiResponse<Federation[]>>("/federations")
    return response.data
  } catch (error) {
    console.error("Error fetching federations:", error)
    return {
      success: false,
      error: "Failed to fetch federations",
    }
  }
}

export async function getFederationById(id: string): Promise<ApiResponse<Federation>> {
  try {
    const response = await api.get<ApiResponse<Federation>>(`/federations/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching federation:", error)
    return {
      success: false,
      error: "Failed to fetch federation",
    }
  }
}

export async function createFederation(federation: Omit<Federation, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Federation>> {
  try {
    const response = await api.post<ApiResponse<Federation>>("/federations", federation)
    return response.data
  } catch (error) {
    console.error("Error creating federation:", error)
    return {
      success: false,
      error: "Failed to create federation",
    }
  }
}

export async function updateFederation(id: string, federation: Partial<Federation>): Promise<ApiResponse<Federation>> {
  try {
    const response = await api.put<ApiResponse<Federation>>(`/federations/${id}`, federation)
    return response.data
  } catch (error) {
    console.error("Error updating federation:", error)
    return {
      success: false,
      error: "Failed to update federation",
    }
  }
}

export async function deleteFederation(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(`/federations/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting federation:", error)
    return {
      success: false,
      error: "Failed to delete federation",
    }
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
  if (!parentType) return "INTERNATIONAL"

  switch (parentType) {
    case "INTERNATIONAL":
      return "REGIONAL"
    case "REGIONAL":
      return "NATIONAL"
    case "NATIONAL":
      return "STATE"
    default:
      return "STATE"
  }
}

// Helper function to get user role based on federation type
export const getFederationAdminRole = (federationType: FederationType): string => {
  switch (federationType) {
    case "INTERNATIONAL":
      return "internationalAdmin"
    case "REGIONAL":
      return "continentalAdmin"
    case "NATIONAL":
      return "stateAdmin"
    case "STATE":
      return "federalStateAdmin"
    default:
      return "federalStateAdmin"
  }
}

// Helper function to build federation hierarchy
export function buildFederationHierarchy(federations: Federation[]): Federation[] {
  const federationMap = new Map<string, Federation>();
  const rootFederations: Federation[] = [];

  // First pass: create a map of all federations
  federations.forEach(federation => {
    federationMap.set(federation._id, { ...federation, children: [] });
  });

  // Second pass: build the hierarchy
  federations.forEach(federation => {
    const federationWithChildren = federationMap.get(federation._id)!;
    
    if (federation.parent) {
      const parent = federationMap.get(federation.parent._id);
      if (parent) {
        parent.children.push(federation);
      }
    } else {
      rootFederations.push(federationWithChildren);
    }
  });

  return rootFederations;
}

// Helper function to get all child federation IDs (including nested)
export function getAllChildFederationIds(federationId: string, federationMap: Map<string, Federation>): string[] {
  const federation = federationMap.get(federationId);
  if (!federation) return [];
  
  const childIds = [...federation.children.map(child => child._id)];
  
  federation.children.map(child => child._id).forEach(childId => {
    childIds.push(...getAllChildFederationIds(childId, federationMap));
  });

  return childIds;
}

export async function getFederationsByTypeFilter(types: FederationType[]): Promise<ApiResponse<Federation[]>> {
  try {
    const response = await api.post<ApiResponse<Federation[]>>("/federations/type-filter", { types });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching federations by type filter:", error);
    return {
      success: false,
      error: "Failed to fetch federations",
    };
  }
}
