import { API_URL } from "@/lib/config";
import { apiClient } from "../api-client";

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  type: string;
  createdAt: number;
  readAt?: number | null;
  meta?: unknown;
};

export async function listNotifications(
  limit = 20,
  opts?: { after?: number; before?: number }
) {
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  if (opts?.after) qs.set("after", String(opts.after));
  if (opts?.before) qs.set("before", String(opts.before));
  // strip API_URL for apiClient (expects relative)
  const endpoint = `${API_URL}/notifications?${qs.toString()}`.replace(
    API_URL,
    ""
  );
  return apiClient.get<{ items: NotificationItem[] }>(endpoint);
}

export async function markRead(id: string) {
  const endpoint = `${API_URL}/notifications/${id}/read`.replace(API_URL, "");
  return apiClient.post<void>(endpoint);
}

export async function markAllRead() {
  const endpoint = `${API_URL}/notifications/read-all`.replace(API_URL, "");
  return apiClient.post<void>(endpoint);
}

export async function seen() {
  const endpoint = `${API_URL}/notifications/seen`.replace(API_URL, "");
  return apiClient.post<void>(endpoint);
}

export async function getUnreadCount() {
  const endpoint = `${API_URL}/notifications/unread-count`.replace(API_URL, "");
  return apiClient.get<{ count: number }>(endpoint);
}

export async function getPreferences() {
  const endpoint = `${API_URL}/notifications/preferences`.replace(API_URL, "");
  return apiClient.get<{ inappEnabled: boolean; emailEnabled: boolean }>(
    endpoint
  );
}

export async function updatePreferences(prefs: {
  inappEnabled?: boolean;
  emailEnabled?: boolean;
}) {
  const endpoint = `${API_URL}/notifications/preferences`.replace(API_URL, "");
  return apiClient.post<{ success: boolean }>(endpoint, prefs);
}
