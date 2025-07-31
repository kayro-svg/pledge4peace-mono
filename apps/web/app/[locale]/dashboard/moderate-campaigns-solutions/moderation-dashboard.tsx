"use client";

import { useState } from "react";
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

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    title:
      "Israel should reform its constitution, legal, and administrative systems to ensure equal rights for all citizens",
    description:
      "Israel should reform its constitution, legal, and administrative systems to ensure equal rights for all citizens, regardless of religion, ethnicity, or color. In addition, it should take concrete steps to end the culture of hate toward other nations and neighbors...",
    author: "John Doe",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    category: "Political Reform",
    votes: { up: 7, down: 0 },
    comments: 2,
    shares: 4,
    country: "Israel",
    tags: ["reform", "equality", "rights"],
  },
  {
    id: 2,
    title:
      "Israel should stop the war and withdraw from Gaza and the West Bank immediately",
    description:
      "Israel should stop the war and withdraw from Gaza and the West Bank immediately, with UN forces assuming control over these areas. Additionally, Israel should release all imprisoned Palestinian children...",
    author: "Jane Smith",
    submittedAt: "2024-01-14T15:45:00Z",
    status: "pending",
    category: "Peace Initiative",
    votes: { up: 5, down: 0 },
    comments: 1,
    shares: 3,
    country: "Israel",
    tags: ["peace", "withdrawal", "UN"],
  },
  {
    id: 3,
    title: "Implement comprehensive education reform",
    description:
      "A detailed plan for implementing comprehensive education reform that focuses on critical thinking and practical skills...",
    author: "Mike Johnson",
    submittedAt: "2024-01-13T09:20:00Z",
    status: "approved",
    category: "Education",
    votes: { up: 12, down: 2 },
    comments: 8,
    shares: 15,
    country: "USA",
    tags: ["education", "reform", "skills"],
  },
  {
    id: 4,
    title: "Inappropriate content example",
    description:
      "This is an example of content that was rejected due to policy violations...",
    author: "User123",
    submittedAt: "2024-01-12T14:15:00Z",
    status: "rejected",
    category: "Other",
    votes: { up: 0, down: 5 },
    comments: 0,
    shares: 0,
    country: "Unknown",
    tags: ["inappropriate"],
    rejectionReason: "Violates community guidelines",
  },
];

export function ModerationDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const filterPosts = (posts: typeof mockPosts, status: string) => {
    return posts
      .filter((post) => post.status === status)
      .filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (post) =>
          selectedCategory === "all" || post.category === selectedCategory
      )
      .filter(
        (post) => selectedCountry === "all" || post.country === selectedCountry
      );
  };

  const pendingPosts = filterPosts(mockPosts, "pending");
  const approvedPosts = filterPosts(mockPosts, "approved");
  const rejectedPosts = filterPosts(mockPosts, "rejected");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl tracking-tight">Moderation Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and review user-submitted posts and solutions
            </p>
          </div>
          <Button>
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </div>

        {/* Stats */}
        <ModerationStats
          pending={pendingPosts.length}
          approved={approvedPosts.length}
          rejected={rejectedPosts.length}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, authors, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          </Select>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="Israel">Israel</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {pendingPosts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {pendingPosts.length}
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
                  {approvedPosts.length}
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
                  {rejectedPosts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending posts found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No approved posts found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {approvedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No rejected posts found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {rejectedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
