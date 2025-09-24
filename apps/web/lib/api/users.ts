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

export type UserListItem = {
  id: string;
  email: string;
  name: string;
  role: "user" | "moderator" | "advisor" | "admin" | "superAdmin";
  status: string;
  createdAt: number | string | Date;
  updatedAt: number | string | Date;
};

export async function adminListUsers(params?: {
  q?: string;
  role?: "user" | "moderator" | "admin" | "superAdmin";
  page?: number;
  limit?: number;
  includeUsers?: boolean;
}): Promise<{
  items: UserListItem[];
  page: number;
  limit: number;
  total: number;
}> {
  const endpoint = API_ENDPOINTS.users
    .adminList(params)
    .replace(process.env.NEXT_PUBLIC_API_URL || "", "");
  return apiClient.get(endpoint);
}

export async function adminChangeUserRole(payload: {
  userId: string;
  role: "user" | "moderator" | "advisor" | "admin";
}): Promise<{ success: boolean; user: UserListItem }> {
  const endpoint = API_ENDPOINTS.users.changeRole.replace(
    process.env.NEXT_PUBLIC_API_URL || "",
    ""
  );
  return apiClient.post(endpoint, payload);
}
