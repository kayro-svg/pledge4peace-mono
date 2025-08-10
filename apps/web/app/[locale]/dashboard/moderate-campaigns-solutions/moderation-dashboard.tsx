"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { PostCard } from "@/components/dashboard/moderation-campaign-solutions/post-card";
import { ModerationStats } from "@/components/dashboard/moderation-campaign-solutions/moderation-stats";
import {
  getModerationList,
  ModerationRow,
  approveAllDrafts,
} from "@/lib/api/solutions";
import { getCampaigns } from "@/lib/sanity/queries";
import { useLocale } from "next-intl";

type UIStatus = "pending" | "approved" | "rejected";

export function ModerationDashboard() {
  const locale = useLocale() as "en" | "es";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [rows, setRows] = useState<ModerationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<UIStatus>("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [refreshKey, setRefreshKey] = useState(0);
  const [statsCounts, setStatsCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [campaignOptions, setCampaignOptions] = useState<
    Array<{ id: string; title: string }>
  >([]);

  // Fetch campaigns for filter
  useEffect(() => {
    (async () => {
      try {
        const campaigns = await getCampaigns(20, locale);
        setCampaignOptions(
          (campaigns || []).map((c: any) => ({ id: c._id, title: c.title }))
        );
      } catch {}
    })();
  }, [locale]);

  // Fetch moderation list when filters change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const statusMap: Record<UIStatus, "draft" | "published" | "archived"> =
          {
            pending: "draft",
            approved: "published",
            rejected: "archived",
          };
        const data = await getModerationList({
          status: statusMap[tab],
          campaignId: selectedCampaign === "all" ? undefined : selectedCampaign,
          page,
          limit,
          q: searchTerm || undefined,
        });
        setRows(data.items);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCampaign, tab, page, refreshKey]);

  // Fetch totals for stats across all statuses (independent of current tab/page)
  useEffect(() => {
    (async () => {
      try {
        const campaignId =
          selectedCampaign === "all" ? undefined : selectedCampaign;
        const [p, a, r] = await Promise.all([
          getModerationList({
            status: "draft",
            campaignId,
            page: 1,
            limit: 10,
          }),
          getModerationList({
            status: "published",
            campaignId,
            page: 1,
            limit: 10,
          }),
          getModerationList({
            status: "archived",
            campaignId,
            page: 1,
            limit: 10,
          }),
        ]);
        setStatsCounts({
          pending: p.total,
          approved: a.total,
          rejected: r.total,
        });
      } catch {
        setStatsCounts({ pending: 0, approved: 0, rejected: 0 });
      }
    })();
  }, [selectedCampaign, refreshKey]);

  // no-op placeholder removed (using the typed filter below)

  type UIPost = {
    id: string;
    title: string;
    description: string;
    author: string;
    submittedAt: string;
    status: UIStatus;
    category: string;
    votes: { up: number; down: number };
    comments: number;
    shares: number;
    country: string;
    tags: string[];
  };

  const mapped = useMemo<UIPost[]>(() => {
    const toPost = (r: ModerationRow): UIPost => ({
      id: r.id,
      title: r.title,
      description: r.description,
      author: r.author,
      submittedAt: new Date(r.submittedAt).toISOString(),
      status:
        r.status === "draft"
          ? "pending"
          : r.status === "published"
            ? "approved"
            : "rejected",
      category: "Solution", // placeholder; extend backend if needed
      votes: { up: 0, down: 0 },
      comments: 0,
      shares: 0,
      country: "",
      tags: [],
    });
    return rows.map(toPost);
  }, [rows]);

  const filterPosts = (posts: UIPost[], status: UIStatus) => {
    return posts
      .filter((post) => post.status === status)
      .filter(
        (post: UIPost) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (post: UIPost) =>
          selectedCategory === "all" || post.category === selectedCategory
      )
      .filter(
        (post: UIPost) =>
          selectedCountry === "all" || post.country === selectedCountry
      );
  };

  const pendingPosts = filterPosts(mapped, "pending");
  const approvedPosts = filterPosts(mapped, "approved");
  const rejectedPosts = filterPosts(mapped, "rejected");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl tracking-tight">Moderation Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and review user-submitted posts and solutions
          </p>
        </div>

        {/* Stats */}
        <ModerationStats
          pending={statsCounts.pending}
          approved={statsCounts.approved}
          rejected={statsCounts.rejected}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, authors, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setRefreshKey((k) => k + 1);
                }
              }}
            />
          </div>

          {/* <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Political Reform">Political Reform</SelectItem>
              <SelectItem value="Peace Initiative">Peace Initiative</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select> */}

          {/* <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="Israel">Israel</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select> */}

          {/* Campaign filter */}
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaignOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as UIStatus);
            setPage(1);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {pendingPosts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {statsCounts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              {approvedPosts.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {statsCounts.approved}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              {rejectedPosts.length > 0 && (
                <Badge
                  variant="outline"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {statsCounts.rejected}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 overflow-y-auto">
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending posts found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onStatusChange={(id, newStatus) => {
                      // Optimistic update list
                      if (newStatus === "approved") {
                        setRows((rows) => rows.filter((r) => r.id !== id));
                      }
                      if (newStatus === "rejected") {
                        setRows((rows) => rows.filter((r) => r.id !== id));
                      }
                      // Refresh counters
                      setRefreshKey((k) => k + 1);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 overflow-y-auto">
            {approvedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No approved posts found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {approvedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onStatusChange={(id, newStatus) => {
                      if (newStatus === "rejected" || newStatus === "pending") {
                        setRows((rows) => rows.filter((r) => r.id !== id));
                      }
                      setRefreshKey((k) => k + 1);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 overflow-y-auto">
            {rejectedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No rejected posts found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {rejectedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onStatusChange={(id, newStatus) => {
                      if (newStatus === "pending" || newStatus === "approved") {
                        setRows((rows) => rows.filter((r) => r.id !== id));
                      }
                      setRefreshKey((k) => k + 1);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination & bulk actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Page {page} of {Math.max(1, Math.ceil(total / limit))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
          <div>
            {tab === "pending" && (
              <Button
                size="sm"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await approveAllDrafts(
                      selectedCampaign === "all" ? undefined : selectedCampaign
                    );
                    setPage(1);
                    setRefreshKey((k) => k + 1);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Approve All Pending
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
