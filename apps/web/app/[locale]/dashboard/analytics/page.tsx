"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useLocale } from "next-intl";
import { getCampaigns } from "@/lib/sanity/queries";
import {
  getCampaignSummary,
  getCampaignTimeSeries,
  getRecentActivity,
  TimeSeriesPoint,
  getGlobalSummary,
  getGlobalTimeSeries,
} from "@/lib/api/admin-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageCircle,
  HandshakeIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCampaignPledges } from "@/lib/api/admin-analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function Page() {
  const { session } = useAuthSession();
  const locale = useLocale() as "en" | "es";
  const [campaignOptions, setCampaignOptions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [campaignId, setCampaignId] = useState<string>("all");
  const [campaignTitleMap, setCampaignTitleMap] = useState<
    Record<string, string>
  >({});
  const [campaignSlugMap, setCampaignSlugMap] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [donations, setDonations] = useState<{
    count: number;
    totalAmount: number;
  } | null>(null);
  const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
  const [pledgesTable, setPledgesTable] = useState<{
    items: any[];
    page: number;
    total: number;
    limit: number;
  }>({ items: [], page: 1, total: 0, limit: 10 });
  const [pledgesQuery, setPledgesQuery] = useState("");

  const isPrivileged = ["moderator", "admin", "superAdmin"].includes(
    (session?.user?.role as string) || "user"
  );

  useEffect(() => {
    (async () => {
      const cs = await getCampaigns(200, locale);
      const opts = cs.map((c: any) => ({ id: c._id, title: c.title }));
      setCampaignOptions(opts);
      setCampaignTitleMap(
        Object.fromEntries(opts.map((o: any) => [o.id, o.title]))
      );
      setCampaignSlugMap(
        Object.fromEntries(
          cs
            .map((c: any) => [
              c._id,
              typeof c.slug === "string" ? c.slug : c.slug?.current,
            ])
            .filter((pair: any) => pair && pair[1])
        ) as Record<string, string>
      );
    })();
  }, [locale]);

  useEffect(() => {
    if (!isPrivileged) return;
    (async () => {
      setLoading(true);
      try {
        const useGlobal = campaignId === "all";
        const targetCampaign = useGlobal ? campaignOptions[0]?.id : campaignId;
        if (!useGlobal && !targetCampaign) return;
        const [s, t, r] = await Promise.all([
          useGlobal ? getGlobalSummary() : getCampaignSummary(targetCampaign),
          useGlobal
            ? getGlobalTimeSeries(30)
            : getCampaignTimeSeries(targetCampaign!, 30),
          getRecentActivity(useGlobal ? undefined : targetCampaign!, 50),
        ]);
        setSummary(s.data);
        setSeries(t.data);
        setRecent(r.data);
        setLastActivityAt(r.data[0]?.createdAt || null);
        // Donations (last 30 days) - global, no por campaña
        const dm = await fetch("/api/donations/metrics?days=30")
          .then((res) => res.json())
          .catch(() => null);
        if (dm?.success) {
          setDonations({
            count: dm.data.count,
            totalAmount: dm.data.totalAmount,
          });
        } else {
          setDonations(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId, isPrivileged, campaignOptions]);

  // Load pledges list when a specific campaign is selected
  useEffect(() => {
    (async () => {
      if (!isPrivileged) return;
      if (campaignId === "all") {
        setPledgesTable({ items: [], page: 1, total: 0, limit: 10 });
        return;
      }
      const res = await getCampaignPledges(campaignId, 1, 10);
      setPledgesTable({ ...res.data });
    })();
  }, [campaignId, isPrivileged]);

  // Event-based incremental updates: usa Visibility API + backoff simple
  useEffect(() => {
    if (!isPrivileged) return;
    let cancelled = false;
    let timer: any;

    async function tick() {
      if (document.hidden) {
        timer = setTimeout(tick, 20000);
        return;
      }
      const targetCampaign =
        campaignId === "all" ? campaignOptions[0]?.id : campaignId;
      if (!targetCampaign) {
        timer = setTimeout(tick, 15000);
        return;
      }
      try {
        const since = lastActivityAt || undefined;
        const r = await getRecentActivity(targetCampaign, 50, since);
        if (!cancelled && Array.isArray(r.data) && r.data.length > 0) {
          setRecent((prev) => {
            const existing = new Set(
              prev.map(
                (i) =>
                  `${i.type}-${i.createdAt}-${i.meta?.solutionId || ""}-${i.meta?.userId || ""}`
              )
            );
            const fresh = r.data.filter(
              (i) =>
                !existing.has(
                  `${i.type}-${i.createdAt}-${i.meta?.solutionId || ""}-${i.meta?.userId || ""}`
                )
            );
            return [...fresh, ...prev].slice(0, 100);
          });
          setLastActivityAt(r.data[0].createdAt);
        }
      } catch {
      } finally {
        timer = setTimeout(tick, 15000);
      }
    }

    timer = setTimeout(tick, 15000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isPrivileged, campaignId, campaignOptions, lastActivityAt]);

  if (!isPrivileged) return null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4 justify-between">
            <h2 className="text-xl font-semibold">Analytics</h2>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger className="w-96">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select campaign</SelectItem>
                {campaignOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : summary ? (
            <>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {campaignId === "all" ? "Global metrics" : "Campaign metrics"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {campaignId === "all"
                    ? "aggregated across all campaigns"
                    : "for selected campaign"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Solutions</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {summary.solutionsPublished}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Likes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {summary.interactions.likes}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {summary.comments}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Pledges</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {summary.pledges}
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Global metrics
                </span>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Donations (30d)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg font-semibold">
                      {donations ? (
                        <div className="flex items-baseline gap-3">
                          <div className="text-2xl font-bold">
                            ${donations.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {donations.count} transactions
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Pledges table for selected campaign */}
              {campaignId !== "all" && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Pledges
                    </span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search name or email"
                        value={pledgesQuery}
                        onChange={(e) => setPledgesQuery(e.target.value)}
                        className="h-8 w-56"
                      />
                      <Button
                        variant="outline"
                        className="h-8"
                        onClick={async () => {
                          const res = await getCampaignPledges(
                            campaignId,
                            1,
                            pledgesTable.limit,
                            pledgesQuery || undefined
                          );
                          setPledgesTable({ ...res.data, page: 1 });
                        }}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          {/* Removed per request: campaign updates opt-in not used */}
                          <th className="text-right p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pledgesTable.items.map((row) => (
                          <tr key={row.pledgeId} className="border-t">
                            <td className="p-2">{row.userName || "—"}</td>
                            <td className="p-2">{row.userEmail || "—"}</td>
                            {/* removed subscribeToUpdates column */}
                            <td className="p-2 text-right">
                              {new Date(row.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {pledgesTable.items.length === 0 && (
                          <tr>
                            <td
                              className="p-4 text-center text-muted-foreground"
                              colSpan={4}
                            >
                              No pledges found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      Page {pledgesTable.page} of{" "}
                      {Math.max(
                        1,
                        Math.ceil(pledgesTable.total / pledgesTable.limit)
                      )}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="h-8"
                        onClick={async () => {
                          const next = Math.max(1, pledgesTable.page - 1);
                          const res = await getCampaignPledges(
                            campaignId,
                            next,
                            pledgesTable.limit,
                            pledgesQuery || undefined
                          );
                          setPledgesTable({ ...res.data });
                        }}
                        disabled={pledgesTable.page <= 1}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8"
                        onClick={async () => {
                          const next = pledgesTable.page + 1;
                          const maxPage = Math.max(
                            1,
                            Math.ceil(pledgesTable.total / pledgesTable.limit)
                          );
                          if (next > maxPage) return;
                          const res = await getCampaignPledges(
                            campaignId,
                            next,
                            pledgesTable.limit,
                            pledgesQuery || undefined
                          );
                          setPledgesTable({ ...res.data });
                        }}
                        disabled={
                          pledgesTable.page >=
                          Math.max(
                            1,
                            Math.ceil(pledgesTable.total / pledgesTable.limit)
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}

          <div className="mt-6">
            {loading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : series && series.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Last 30 days</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{}}
                    className="aspect-auto h-[240px] w-full"
                  >
                    <AreaChart data={series}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="likes"
                        type="monotone"
                        stroke="#22c55e"
                        fill="#22c55e20"
                      />
                      <Area
                        dataKey="comments"
                        type="monotone"
                        stroke="#f97316"
                        fill="#f9731620"
                      />
                      <Area
                        dataKey="pledges"
                        type="monotone"
                        stroke="#0ea5e9"
                        fill="#0ea5e920"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"> */}
          <Card className="mt-6 w-full">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="space-y-3">
                  {recent.slice(0, 15).map((it, idx) => {
                    const type = String(it.type || "").toLowerCase();
                    const ts = new Date(it.createdAt);
                    const cid =
                      it.meta?.solutionCampaignId || it.meta?.campaignId;
                    const campaignTitle = cid
                      ? campaignTitleMap[cid]
                      : undefined;
                    const solutionTitle = it.meta?.solutionTitle as
                      | string
                      | undefined;
                    const userName = it.meta?.userName as string | undefined;
                    const solutionId = it.meta?.solutionId as
                      | string
                      | undefined;
                    const campaignSlug = cid ? campaignSlugMap[cid] : undefined;
                    const prefix = locale ? `/${locale}` : "";
                    const truncate = (s?: string, n = 60) =>
                      s && s.length > n ? s.slice(0, n - 1) + "…" : s || "";
                    const Icon =
                      type === "like"
                        ? ThumbsUp
                        : type === "dislike"
                          ? ThumbsDown
                          : type === "share"
                            ? Share2
                            : type === "comment"
                              ? MessageCircle
                              : HandshakeIcon;
                    const typeLabel =
                      type.charAt(0).toUpperCase() + type.slice(1);
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border p-3 flex items-start gap-3"
                      >
                        <div className="mt-0.5 shrink-0 rounded-md bg-muted p-2">
                          <Icon className="h-4 w-4 text-[#548281]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {typeLabel}
                            </Badge>
                            {userName && (
                              <span className="text-sm font-medium text-foreground truncate">
                                by {userName}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground truncate">
                            {solutionTitle && campaignSlug ? (
                              <button
                                type="button"
                                className="truncate underline decoration-dotted hover:text-foreground"
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  if (solutionId)
                                    params.set("solutionId", solutionId);
                                  params.set("action", type);
                                  const url = `${prefix}/campaigns/${campaignSlug}${params.toString() ? `?${params.toString()}` : ""}`;
                                  window.open(url, "_blank");
                                }}
                                title={solutionTitle}
                              >
                                at {truncate(solutionTitle, 60)}
                              </button>
                            ) : solutionTitle ? (
                              <span className="truncate">
                                at {truncate(solutionTitle, 40)}
                              </span>
                            ) : null}
                            {campaignTitle && (
                              <span className="ml-1 truncate">
                                in {truncate(campaignTitle, 40)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-xs text-muted-foreground">
                          {ts.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
