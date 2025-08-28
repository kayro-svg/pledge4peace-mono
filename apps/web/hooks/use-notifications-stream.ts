"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/config";
import { getUnreadCount, type NotificationItem } from "@/lib/api/notifications";
// import { getCampaigns } from "@/lib/sanity/queries";
import { useLocale } from "next-intl";

export function useNotificationsStream(accessToken?: string | null) {
  type NotificationMeta = {
    campaignId?: string;
    slug?: string;
    solutionId?: string | number;
    commentId?: string | number;
    [key: string]: unknown;
  };
  type StreamItem = NotificationItem & { meta?: NotificationMeta | string };

  const [items, setItems] = useState<StreamItem[]>([]);
  const [unread, setUnread] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const hydratingRef = useRef(false);
  const idsRef = useRef<Set<string>>(new Set());
  const locale = useLocale() as "en" | "es";
  const [slugMap, setSlugMap] = useState<Record<string, string>>({});
  const fetchingSlugRef = useRef<Set<string>>(new Set());

  // Load campaigns and build id -> slug map
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/${locale}/api/campaign-slugs`, {
          next: { revalidate: 3600 },
        });
        if (resp.ok) {
          const map = (await resp.json()) as Record<string, string>;
          setSlugMap(map);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [locale]);

  const enrichHref = useCallback(
    (n: StreamItem): StreamItem => {
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
          /* ignore */
          meta = {};
        }
      }
      const campaignId = meta?.campaignId as string | undefined;
      const slug = campaignId ? slugMap[campaignId] : undefined;
      if (!slug) {
        // lazy refresh slug map if missing
        if (campaignId && !fetchingSlugRef.current.has(campaignId)) {
          fetchingSlugRef.current.add(campaignId);
          (async () => {
            try {
              const resp = await fetch(`/${locale}/api/campaign-slugs`, {
                next: { revalidate: 3600 },
              });
              let newSlug: string | undefined;
              if (resp.ok) {
                const slugMapResp = (await resp.json()) as Record<
                  string,
                  string
                >;
                setSlugMap((prev) => ({ ...prev, ...slugMapResp }));
                newSlug = slugMapResp[campaignId];
              }
              if (newSlug) {
                const params = new URLSearchParams();
                if (meta?.solutionId)
                  params.set("solutionId", String(meta.solutionId));
                if (meta?.commentId)
                  params.set("commentId", String(meta.commentId));
                const href = `/campaigns/${newSlug}${params.toString() ? `?${params.toString()}` : ""}`;
                setItems((prev) =>
                  prev.map((it) => (it.id === n.id ? { ...it, href } : it))
                );
              }
            } finally {
              fetchingSlugRef.current.delete(campaignId);
            }
          })();
        }
        return n;
      }
      const params = new URLSearchParams();
      if (meta?.solutionId) params.set("solutionId", String(meta.solutionId));
      if (meta?.commentId) params.set("commentId", String(meta.commentId));
      return {
        ...n,
        href: `/campaigns/${slug}${params.toString() ? `?${params.toString()}` : ""}`,
      };
    },
    [locale, slugMap]
  );

  useEffect(() => {
    if (!accessToken) return;

    bcRef.current = new BroadcastChannel("notif");
    bcRef.current.onmessage = (e) => {
      if (e.data?.type === "notif") {
        let n = e.data.payload;
        n = enrichHref(n);
        if (!n || !n.id || idsRef.current.has(n.id)) return;
        idsRef.current.add(n.id);
        setItems((prev) => [n, ...prev].slice(0, 100));
        if (!e.data?.hydrating) setUnread((n) => n + 1);
        try {
          window.dispatchEvent(
            new CustomEvent("p2p:new-notification", {
              detail: { id: n.id, hydrating: !!e.data?.hydrating },
            })
          );
        } catch {}
      }
    };

    const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(
      accessToken
    )}`;
    let retry = 1000;

    const open = async () => {
      // initialize exact unread count on mount
      try {
        const res = await getUnreadCount();
        if (typeof res.count === "number") setUnread(res.count);
      } catch {
        /* ignore */
      }

      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("hydrate", () => {
        hydratingRef.current = true;
        // No reiniciamos el contador aquí, solo evitamos incrementos durante la hidratación
      });
      es.addEventListener("hydrated", () => {
        hydratingRef.current = false;
      });

      es.onmessage = (evt) => {
        retry = 1000;
        try {
          let data = JSON.parse(evt.data);
          data = enrichHref(data);
          if (!data || !data.id || idsRef.current.has(data.id)) return;
          idsRef.current.add(data.id);
          bcRef.current?.postMessage({
            type: "notif",
            payload: data,
            hydrating: hydratingRef.current,
          });
          setItems((prev) => [data, ...prev].slice(0, 100));
          if (!hydratingRef.current) setUnread((n) => n + 1);
          try {
            window.dispatchEvent(
              new CustomEvent("p2p:new-notification", {
                detail: { id: data.id, hydrating: hydratingRef.current },
              })
            );
          } catch {}
        } catch {
          /* ignore */
        }
      };

      es.onerror = () => {
        es.close();
        setTimeout(open, Math.min(retry, 8000));
        retry *= 2;
      };
    };

    open();
    return () => {
      esRef.current?.close();
      bcRef.current?.close();
    };
  }, [accessToken, enrichHref]);

  return { items, unread, setUnread };
}
