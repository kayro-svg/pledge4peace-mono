import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/config";

export interface UpdateProfilePayload {
  name?: string;
  image?: string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    role: string;
    status: string;
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
  };
}

export async function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse["user"]> {
  const endpoint = API_ENDPOINTS.users.updateProfile.replace(
    process.env.NEXT_PUBLIC_API_URL || "",
    ""
  );
  const response = await apiClient.put<UpdateProfileResponse>(
    endpoint,
    payload
  );
  return response.user;
}
