import { api } from "./api";
import { ApiResponse, Member } from "@/types";

export async function getMemberById(id: string): Promise<ApiResponse<Member>> {
  try {
    const response = await api.get<ApiResponse<Member>>(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching member:", error);
    return {
      success: false,
      error: "Failed to fetch member",
    };
  }
}

export async function getMembersByFederationId(
  federationId: string
): Promise<ApiResponse<Member[]>> {
  try {
    const response = await api.get<ApiResponse<Member[]>>(
      `/members/federation/${federationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    return {
      success: false,
      error: "Failed to fetch members",
    };
  }
}

export async function createMember(
  member: Omit<Member, "_id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Member>> {
  try {
    const response = await api.post<ApiResponse<Member>>("/members", member);
    return response.data;
  } catch (error) {
    console.error("Error creating member:", error);
    return {
      success: false,
      error: "Failed to create member",
    };
  }
}

export async function updateFederation(
  id: string,
  member: Partial<Member>
): Promise<ApiResponse<Member>> {
  try {
    const response = await api.put<ApiResponse<Member>>(
      `/members/${id}`,
      member
    );
    return response.data;
  } catch (error) {
    console.error("Error updating member:", error);
    return {
      success: false,
      error: "Failed to update member",
    };
  }
}
