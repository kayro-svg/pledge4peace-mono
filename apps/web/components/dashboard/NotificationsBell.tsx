"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useNotificationsStream } from "@/hooks/use-notifications-stream";
import Link from "next/link";
import {
  markRead,
  markAllRead,
  type NotificationItem,
} from "@/lib/api/notifications";
// import { getCampaigns } from "@/lib/sanity/queries";
import { useLocale } from "next-intl";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/config";
import { useOptimizedSession } from "@/hooks/use-optimized-session";
import { Link as I18nLink } from "@/i18n/navigation";

export function NotificationsBell() {
  const { session } = useAuthSession();
  const { items, unread, setUnread } = useNotificationsStream(
    session?.accessToken as string | undefined
  );
  const { update } = useOptimizedSession();
  const [open, setOpen] = useState(false);
  const locale = useLocale() as "en" | "es";
  const slugMapRef = useRef<Record<string, string>>({});
  const bcRef = useRef<BroadcastChannel | null>(null);

  const onToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
  };
  const groupableTypes = useMemo(
    () => new Set(["like", "dislike", "comment", "comment_reply"]),
    []
  );

  type DisplayItem =
    | (NotificationItem & {
        isGroup?: false;
      })
    | {
        id: string;
        title: string;
        body?: string;
        href?: string;
        readAt?: number | null;
        createdAt: number;
        isGroup: true;
        groupIds: string[];
        unreadIds: string[];
        base: NotificationItem & { meta?: unknown }; // first item in group
      };

  const displayItems: DisplayItem[] = useMemo(() => {
    try {
      const groups: Map<
        string,
        {
          items: (NotificationItem & { meta?: unknown })[];
          unreadIds: string[];
        }
      > = new Map();
      const list = items as Array<NotificationItem & { meta?: unknown }>;
      for (const n of list) {
        if (!groupableTypes.has(n.type)) continue;
        let meta: Record<string, unknown> | undefined = n.meta as unknown as
          | Record<string, unknown>
          | undefined;
        if (typeof meta === "string") {
          try {
            meta = JSON.parse(meta as unknown as string) as Record<
              string,
              unknown
            >;
          } catch {
            meta = {};
          }
        }
        const solutionId = (meta as any)?.solutionId;
        if (!solutionId) continue;
        const key = `${n.type}:${solutionId}`;
        const g = groups.get(key) || { items: [], unreadIds: [] };
        g.items.push(n);
        if (!n.readAt) g.unreadIds.push(n.id);
        groups.set(key, g);
      }

      const groupedIds = new Set<string>();
      const aggregates: DisplayItem[] = [];
      for (const [key, g] of Array.from(groups.entries())) {
        if (g.items.length > 5) {
          for (const it of g.items) groupedIds.add(it.id);
          const first = g.items[0];
          const type = first.type;
          const label =
            type === "like"
              ? "likes"
              : type === "dislike"
                ? "dislikes"
                : "comments";
          const count =
            g.unreadIds.length > 0 ? g.unreadIds.length : g.items.length;
          aggregates.push({
            id: `group-${key}-${first.id}`,
            title: `You have ${count} new ${label}`,
            createdAt: first.createdAt,
            isGroup: true,
            groupIds: g.items.map((x: NotificationItem) => x.id),
            unreadIds: g.unreadIds,
            base: first,
          });
        }
      }

      const singles: DisplayItem[] = items
        .filter((n) => !groupedIds.has(n.id))
        .map((n) => ({ ...n, isGroup: false }));

      const combined = [...aggregates, ...singles]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10);
      return combined;
    } catch {
      return items.slice(0, 10) as DisplayItem[];
    }
  }, [items, groupableTypes]);

  // Role-change refresh removed; logout flow now handles re-login

  type NotificationMeta = {
    campaignId?: string;
    slug?: string;
    campaignSlug?: string;
    solutionId?: string | number;
    commentId?: string | number;
    [key: string]: unknown;
  };
  const resolveHref = async (
    n: NotificationItem & { meta?: NotificationMeta | string }
  ): Promise<string | undefined> => {
    if (n?.href && typeof n.href === "string" && n.href.startsWith("/")) {
      return n.href;
    }
    let meta: NotificationMeta | undefined = n?.meta as
      | NotificationMeta
      | undefined;
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta) as NotificationMeta;
      } catch {
        meta = {};
      }
    }
    const directSlug: string | undefined = meta?.slug || meta?.campaignSlug;
    const campaignId: string | undefined = meta?.campaignId;
    let slug = directSlug;
    if (!slug && campaignId) {
      slug = slugMapRef.current[campaignId];
      if (!slug) {
        try {
          const resp = await fetch(`/api/campaign-slugs`, {
            next: { revalidate: 3600 },
          });
          if (resp.ok) {
            const map = (await resp.json()) as Record<string, string>;
            slugMapRef.current = { ...slugMapRef.current, ...map };
            slug = slugMapRef.current[campaignId];
          }
        } catch {
          /* ignore */
        }
      }
    }
    if (!slug) return undefined;
    const params = new URLSearchParams();
    if (meta?.solutionId) params.set("solutionId", String(meta.solutionId));
    if (meta?.commentId) params.set("commentId", String(meta.commentId));
    return `/campaigns/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  useEffect(() => {
    bcRef.current = new BroadcastChannel("notif");
    return () => {
      bcRef.current?.close();
    };
  }, []);

  if (!session) return null;

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className="relative p-2 rounded-md hover:bg-gray-100"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#2F4858]"
        >
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 bg-white border rounded shadow max-h-96 overflow-auto z-50"
        >
          {displayItems.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No notifications</div>
          ) : (
            displayItems.map((n) => (
              <button
                key={n.id}
                role="menuitem"
                onClick={async () => {
                  if ((n as any).isGroup) {
                    const grp = n as Extract<DisplayItem, { isGroup: true }>;
                    try {
                      if (grp.unreadIds.length > 0) {
                        await Promise.all(
                          grp.unreadIds.map((id) => markRead(id))
                        );
                        setUnread((u) => Math.max(0, u - grp.unreadIds.length));
                        bcRef.current?.postMessage({
                          type: "unread-delta",
                          delta: -grp.unreadIds.length,
                        });
                      }
                    } catch {
                      /* ignore */
                    }
                    const href = await resolveHref(
                      grp.base as NotificationItem & {
                        meta?: NotificationMeta | string | undefined;
                      }
                    );
                    if (href) window.location.href = href;
                  } else {
                    const single = n as Extract<
                      DisplayItem,
                      { isGroup?: false }
                    >;
                    try {
                      if (!single.readAt) {
                        await markRead(single.id);
                        setUnread((u) => Math.max(0, u - 1));
                        bcRef.current?.postMessage({
                          type: "unread-delta",
                          delta: -1,
                        });
                      }
                    } catch {
                      /* ignore */
                    }
                    const href = await resolveHref(
                      single as NotificationItem & {
                        meta?: NotificationMeta | string | undefined;
                      }
                    );
                    if (href) window.location.href = href;
                  }
                }}
                className={`w-full text-left p-3 hover:bg-gray-50 ${n.readAt ? "bg-gray-50" : "bg-white"}`}
              >
                {(n as any).isGroup ? (
                  <div className="text-sm font-semibold text-gray-900">
                    {(n as any).title}
                  </div>
                ) : (
                  <>
                    <div
                      className={`text-sm ${n.readAt ? "font-normal text-gray-700" : "font-semibold text-gray-900"}`}
                    >
                      {n.title}
                    </div>
                    {n.body ? (
                      <div
                        className={`text-xs ${n.readAt ? "text-gray-500" : "text-gray-600"} line-clamp-2`}
                      >
                        {n.body}
                      </div>
                    ) : null}
                  </>
                )}
              </button>
            ))
          )}
          <div className="p-2 text-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <I18nLink
                  href="/dashboard/notifications"
                  className="text-xs underline text-blue-500"
                >
                  View all
                </I18nLink>
                <I18nLink
                  href="/dashboard/notifications#prefs"
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Settings
                </I18nLink>
              </div>
              <button
                onClick={async () => {
                  try {
                    await markAllRead();
                    setUnread(0);
                    bcRef.current?.postMessage({ type: "unread-reset" });
                  } catch {
                    /* ignore */
                  }
                }}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
