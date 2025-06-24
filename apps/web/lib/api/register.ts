import { API_ENDPOINTS } from "@/lib/config";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  userType: string;
  office?: string;
  organization?: string;
  institution?: string;
  otherRole?: string;
}

export async function register(data: RegisterFormData) {
  return await fetch(API_ENDPOINTS.auth.register, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
