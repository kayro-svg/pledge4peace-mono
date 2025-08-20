"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "@/lib/api/notifications";
import { useAuthSession } from "@/hooks/use-auth-session";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getPreferences, updatePreferences } from "@/lib/api/notifications";
import { getCampaigns } from "@/lib/sanity/queries";
import { useLocale } from "next-intl";

export default function Page() {
  const { session } = useAuthSession();
  type NotificationMeta = {
    campaignId?: string;
    slug?: string;
    solutionId?: string | number;
    commentId?: string | number;
    [key: string]: unknown;
  };
  type NotificationItem = {
    id: string;
    title: string;
    body?: string;
    href?: string;
    type: string;
    createdAt: number;
    readAt?: number | null;
    meta?: unknown;
  };
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const locale = useLocale() as "en" | "es";
  const [slugMap, setSlugMap] = useState<Record<string, string>>({});
  const [prefs, setPrefs] = useState<{
    inappEnabled: boolean;
    emailEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        type Campaign = { _id: string; slug: string | { current: string } };
        const campaigns: Campaign[] = await getCampaigns(200, locale);
        const map: Record<string, string> = {};
        for (const c of campaigns) {
          const id = c._id;
          const slug = typeof c.slug === "string" ? c.slug : c.slug?.current;
          if (id && slug) map[id] = slug;
        }
        setSlugMap(map);
      } catch {
        /* ignore */
      }
    })();
  }, [locale]);

  // Load notification preferences
  useEffect(() => {
    (async () => {
      if (!session) return;
      try {
        const p = await getPreferences();
        setPrefs(p);
      } catch {}
    })();
  }, [session]);

  const enrichHref = useCallback(
    (n: NotificationItem) => {
      if (n?.href && typeof n.href === "string" && n.href.startsWith("/")) {
        return n;
      }
      let meta: NotificationMeta | undefined = n?.meta as
        | NotificationMeta
        | undefined;
      if (typeof n?.meta === "string") {
        try {
          meta = JSON.parse(n.meta) as NotificationMeta;
        } catch {
          meta = {};
        }
      }
      const campaignId = meta?.campaignId as string | undefined;
      const slug = campaignId ? slugMap[campaignId] : undefined;
      if (!slug) return n;
      const params = new URLSearchParams();
      if (meta?.solutionId) params.set("solutionId", String(meta.solutionId));
      if (meta?.commentId) params.set("commentId", String(meta.commentId));
      return {
        ...n,
        href: `/campaigns/${slug}${params.toString() ? `?${params.toString()}` : ""}`,
      };
    },
    [slugMap]
  );

  useEffect(() => {
    (async () => {
      if (!session) return;
      setLoading(true);
      try {
        const res = await listNotifications(20);
        const enriched = res.items.map(enrichHref);
        setItems(enriched);
        setHasMore(enriched.length === 20);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, enrichHref]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || items.length === 0) return;
    setLoadingMore(true);
    try {
      const last = items[items.length - 1];
      const res = await listNotifications(20, { before: last.createdAt });
      const enriched = res.items.map(enrichHref);
      setItems((prev) => {
        const existing = new Set(prev.map((i) => i.id));
        const merged = [...prev];
        for (const it of enriched) if (!existing.has(it.id)) merged.push(it);
        return merged;
      });
      setHasMore(enriched.length === 20);
    } finally {
      setLoadingMore(false);
    }
  }, [items, hasMore, loadingMore, enrichHref]);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div id="prefs" />
      {prefs && (
        <div className="border rounded p-3">
          <h3 className="text-sm font-semibold mb-2">
            Notification preferences
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <Switch
              id="inapp"
              checked={prefs.inappEnabled}
              onCheckedChange={async (val) => {
                const next = { ...prefs, inappEnabled: Boolean(val) };
                setPrefs(next);
                try {
                  await updatePreferences({ inappEnabled: Boolean(val) });
                } catch {}
              }}
            />
            <Label htmlFor="inapp">In-app notifications</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="email"
              checked={prefs.emailEnabled}
              onCheckedChange={async (val) => {
                const next = { ...prefs, emailEnabled: Boolean(val) };
                setPrefs(next);
                try {
                  await updatePreferences({ emailEnabled: Boolean(val) });
                } catch {}
              }}
            />
            <Label htmlFor="email">Email notifications</Label>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await markAllRead();
            setItems((prev) => prev.map((i) => ({ ...i, readAt: Date.now() })));
          }}
        >
          Mark all as read
        </Button>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No notifications</div>
      ) : (
        <div className="divide-y border rounded">
          {items.map((n) => (
            <div key={n.id} className="p-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{n.title}</div>
                {n.body ? (
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                ) : null}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                {n.href && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (n.href) window.location.href = n.href;
                    }}
                  >
                    Open
                  </Button>
                )}
                {!n.readAt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await markRead(n.id);
                      setItems((prev) =>
                        prev.map((it) =>
                          it.id === n.id ? { ...it, readAt: Date.now() } : it
                        )
                      );
                    }}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="flex justify-center p-4">
          {hasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">
              No more notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
}
