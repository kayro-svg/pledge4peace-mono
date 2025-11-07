"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useSearchParams } from "next/navigation";
import {
  getPeaceSealCenterResources,
  addPeaceSealCenterResource,
  type PeaceSealCenterResource,
  type ResourceType,
  type ResourceCategory,
} from "@/lib/api/peace-seal";
import {
  getLearnMoreTopic,
  LEARN_MORE_TOPICS,
} from "@/config/learn-more-content";
import {
  Download,
  FileText,
  Settings,
  Users,
  Globe,
  Shield,
  BookOpen,
  Plus,
  Calendar,
  Tag,
  HelpCircle,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Mail,
  TrendingUp,
  Info,
} from "lucide-react";

export function PeaceSealCenter() {
  const { session } = useAuthSession();
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const [resources, setResources] = useState<PeaceSealCenterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddResource, setShowAddResource] = useState(false);
  const { toast } = useToast();
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Check if user is admin or advisor
  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "superAdmin";
  const isAdvisor = session?.user?.role === "advisor";

  // Can manage resources: admin, superAdmin, advisor
  const canManageResources = isAdmin || isAdvisor;

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPeaceSealCenterResources();
      setResources(result.resources);
    } catch {
      toast({
        title: "Error loading resources",
        description:
          "Failed to load Peace Seal Center resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Auto-scroll to specific topic accordion when topic is provided
  useEffect(() => {
    if (!topicParam) return;

    // Wait for content to render, then scroll
    // Use multiple attempts to ensure DOM is ready and tabs are switched
    const scrollToTopic = () => {
      // Try to find element by ref first
      let element = topicRefs.current[topicParam];

      // Fallback: try to find element by ID from hash or direct DOM lookup
      if (!element) {
        const hashId = `topic-${topicParam}`;
        element = document.getElementById(hashId) as HTMLDivElement | null;
        if (element) {
          // Store it in refs for future use
          topicRefs.current[topicParam] = element;
        }
      }

      if (element) {
        // Check if element is actually visible (not hidden by tabs)
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        // Element might be hidden if tab is not active - check if it's visible
        if (style.display === "none" || style.visibility === "hidden") {
          return false; // Element exists but not visible, wait
        }

        // Element found and visible - scroll to it
        // Scroll the window first
        const yOffset = -100; // Offset for sticky headers/navigation
        const y = rect.top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });

        // Also try to scroll within the scrollable container if it exists
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
          const parentStyle = window.getComputedStyle(parent);
          if (
            parentStyle.overflowY === "auto" ||
            parentStyle.overflowY === "scroll"
          ) {
            const containerRect = parent.getBoundingClientRect();
            const scrollTop =
              rect.top - containerRect.top + parent.scrollTop - 20;
            parent.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: "smooth",
            });
            break;
          }
          parent = parent.parentElement;
        }
        return true; // Element found and scrolled
      }
      return false; // Element not found yet
    };

    // Use requestAnimationFrame to wait for next paint cycle
    const attemptScroll = () => {
      requestAnimationFrame(() => {
        scrollToTopic();
      });
    };

    // Try immediately (in case component was already mounted)
    attemptScroll();

    // Multiple attempts with increasing delays to handle different load scenarios
    // These delays account for: tab switching, component mounting, DOM rendering
    const timeouts: NodeJS.Timeout[] = [];

    // Try after various delays to catch different render timings
    [100, 300, 500, 800, 1200, 2000, 3000].forEach((delay) => {
      const timeout = setTimeout(() => {
        scrollToTopic();
      }, delay);
      timeouts.push(timeout);
    });

    // Cleanup
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [topicParam]);

  // Also handle hash-based scrolling when component mounts or hash changes
  // This handles the case when URL is loaded directly with hash
  useEffect(() => {
    // Get topic from hash if topicParam is not available
    const hash = window.location.hash;
    const topicIdFromHash = hash?.startsWith("#topic-")
      ? hash.replace("#topic-", "")
      : null;
    const targetTopicId = topicParam || topicIdFromHash;

    if (!targetTopicId) return;

    const scrollToHashElement = () => {
      // Try to find element by ID first (direct DOM lookup)
      let element = document.getElementById(
        `topic-${targetTopicId}`
      ) as HTMLDivElement | null;

      // Also check refs
      if (!element) {
        element = topicRefs.current[targetTopicId];
      }

      if (element) {
        // Verify element is actually visible (not hidden by tabs)
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        // Check if element is hidden
        if (style.display === "none" || style.visibility === "hidden") {
          return false; // Element exists but not visible, wait
        }

        // Element found and visible - scroll to it
        const yOffset = -100;
        const y = rect.top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });

        // Also try scrolling within scrollable containers
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
          const parentStyle = window.getComputedStyle(parent);
          if (
            parentStyle.overflowY === "auto" ||
            parentStyle.overflowY === "scroll"
          ) {
            const containerRect = parent.getBoundingClientRect();
            const scrollTop =
              rect.top - containerRect.top + parent.scrollTop - 20;
            parent.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: "smooth",
            });
            break;
          }
          parent = parent.parentElement;
        }
        return true;
      }
      return false;
    };

    // Try immediately
    if (scrollToHashElement()) return;

    // Retry with delays if element not found initially
    // These delays ensure tab is active and content is rendered
    const attempts = [200, 500, 1000, 1500, 2500, 4000];
    const timeouts = attempts.map((delay) =>
      setTimeout(() => scrollToHashElement(), delay)
    );

    // Listen for hash changes
    const handleHashChange = () => {
      setTimeout(scrollToHashElement, 100);
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [topicParam]); // Run when topicParam changes or on mount

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5" />;
      case "template":
        return <Settings className="w-5 h-5" />;
      case "guide":
        return <BookOpen className="w-5 h-5" />;
      case "tool":
        return <Shield className="w-5 h-5" />;
      case "survey":
        return <Users className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: ResourceCategory) => {
    switch (category) {
      case "hr_policies":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "supplier_codes":
        return "bg-green-50 text-green-700 border-green-200";
      case "peace_statements":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "political_guidelines":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "compliance":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatCategoryName = (category: ResourceCategory) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#548281]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2F4858]">
            Peace Seal Center
          </h1>
          <p className="text-gray-600 mt-1">
            Access tools, resources, and support for maintaining your Peace Seal
            certification
          </p>
        </div>
        {canManageResources && (
          <Dialog open={showAddResource} onOpenChange={setShowAddResource}>
            <DialogTrigger asChild>
              <Button className="bg-[#548281] hover:bg-[#2F4858]">
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Peace Seal Center Resource</DialogTitle>
                <DialogDescription>
                  Add a new resource to help certified companies maintain their
                  Peace Seal standards.
                </DialogDescription>
              </DialogHeader>
              <AddResourceForm
                onResourceAdded={() => {
                  setShowAddResource(false);
                  loadResources();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Quick Access Cards
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {}}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-[#548281]" />
              <div>
                <p className="font-semibold text-sm">HR Policy Support</p>
                <p className="text-xs text-gray-600">
                  Get guidance on HR issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {}}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#548281]" />
              <div>
                <p className="font-semibold text-sm">Employee Surveys</p>
                <p className="text-xs text-gray-600">
                  Third-party satisfaction reports
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {}}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#548281]" />
              <div>
                <p className="font-semibold text-sm">Peace Campaigns</p>
                <p className="text-xs text-gray-600">
                  Campaign ideas & templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {}}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-[#548281]" />
              <div>
                <p className="font-semibold text-sm">Rapid Response</p>
                <p className="text-xs text-gray-600">Crisis messaging kits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Tabs */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList
          className={`grid w-full ${canManageResources ? "grid-cols-1" : "grid-cols-1"}`}
        >
          <TabsTrigger value="resources">Resources</TabsTrigger>
          {/* {canManageResources && (
            <>
              <TabsTrigger value="surveys">Surveys</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </>
          )} */}
          {/* <TabsTrigger value="support">Support</TabsTrigger> */}
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Resources Library:</strong> Here you&apos;ll find
              templates, guides, policies, and tools to help you maintain your
              Peace Seal certification. This includes HR policy templates,
              supplier codes of conduct, peace statements, political donation
              guidelines, and compliance tools. Download what you need to stay
              compliant with Peace Seal standards.
            </AlertDescription>
          </Alert>

          {/* Learn More Accordions - Show all topics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-[#548281]" />
              <h2 className="text-xl font-bold text-[#2F4858]">
                Learn More About Requirements
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[700px] gap-4">
              {Object.values(LEARN_MORE_TOPICS).map((topic) => (
                <div
                  key={topic.topicId}
                  ref={(el) => {
                    topicRefs.current[topic.topicId] = el;
                  }}
                  className="scroll-mt-4 mb-4"
                  id={`topic-${topic.topicId}`}
                >
                  <LearnMoreAccordion
                    topicId={topic.topicId}
                    isHighlighted={topicParam === topic.topicId}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Resources Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.resourceType)}
                      <CardTitle className="text-lg">
                        {resource.title}
                      </CardTitle>
                    </div>
                    <Badge className={getCategoryColor(resource.category)}>
                      {formatCategoryName(resource.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resource.description && (
                    <p className="text-sm text-gray-600">
                      {resource.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Tag className="w-3 h-3" />
                    <span className="capitalize">{resource.resourceType}</span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {resource.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(resource.fileUrl, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div> */}

          {/* Empty State */}
          {resources.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Resources Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Peace Seal Center resources will appear here once they are
                  added.
                </p>
                {canManageResources && (
                  <Button
                    onClick={() => setShowAddResource(true)}
                    className="bg-[#548281] hover:bg-[#2F4858]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Resource
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canManageResources && (
          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Employee Satisfaction Surveys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    As a certified Peace Seal company, you have access to
                    third-party employee satisfaction surveys. We&apos;ll
                    conduct anonymous surveys with your employees and provide
                    you with a detailed report on areas for improvement to make
                    your company more pro-peace and create harmony.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Request Survey</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Schedule an employee satisfaction survey for your
                        company
                      </p>
                      <Button
                        size="sm"
                        className="bg-[#548281] hover:bg-[#2F4858]"
                      >
                        Request Survey
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">View Past Reports</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Access previous survey results and recommendations
                      </p>
                      <Button size="sm" variant="outline">
                        View Reports
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canManageResources && (
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Peace-Driven Campaigns & Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Participate in peace-driven campaigns and get featured in
                    Pledge4Peace newsletters, blog, and social media. Join
                    public campaigns calling for ceasefires or de-escalation in
                    conflict zones.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-[#548281]" />
                        <h3 className="font-semibold">Campaign Ideas</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Browse curated peace campaign ideas for your company
                      </p>
                      <Button size="sm" variant="outline">
                        Browse Ideas
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-[#548281]" />
                        <h3 className="font-semibold">Newsletter Submission</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Submit your peace initiatives for potential feature
                      </p>
                      <Button size="sm" variant="outline">
                        Submit Story
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Expert Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Get personalized guidance on HR policies, supplier codes of
                  conduct, peace statements, and political donation guidelines
                  from our Peace Seal advisors.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">HR Policy Help</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Get guidance on handling HR and policy-related issues
                    </p>
                    <Button
                      size="sm"
                      className="bg-[#548281] hover:bg-[#2F4858]"
                    >
                      Request Help
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Contact Advisor</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Reach out to your assigned Peace Seal advisor
                    </p>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {canManageResources && (
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Compliance & Self-Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Access quarterly self-assessment prompts and compliance
                    nudges to help you maintain your Peace Seal certification.
                    Download templates for supplier codes of conduct, peace
                    statements, and political donation guidelines.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Quarterly Check-in</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Complete your quarterly self-assessment
                      </p>
                      <Button
                        size="sm"
                        className="bg-[#548281] hover:bg-[#2F4858]"
                      >
                        Start Assessment
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Templates</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Download peace statement and policy templates
                      </p>
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Rapid Response</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Get crisis messaging kits for global events
                      </p>
                      <Button size="sm" variant="outline">
                        Get Kit
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Learn More Accordion Component
function LearnMoreAccordion({
  topicId,
  isHighlighted = false,
}: {
  topicId: string;
  isHighlighted?: boolean;
}) {
  const topic = getLearnMoreTopic(topicId);

  if (!topic) {
    return null;
  }

  // Create default open value for all items (auto-expand all)
  const defaultValues = topic.qnas.map((_, index) => `item-${index}`);

  return (
    <Card
      className={`border-2 ${
        isHighlighted
          ? "border-[#548281] shadow-lg ring-2 ring-[#548281]/20"
          : "border-gray-200"
      } transition-all`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#548281]" />
          {topic.title}
        </CardTitle>
        {topic.description && (
          <p className="text-sm text-gray-600 mt-2">{topic.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {/* Show full content if available, otherwise show Q&A */}
        {topic.fullContent ? (
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {topic.fullContent}
            </div>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {topic.qnas.map((qna, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg">
                  {qna.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {qna.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

function AddResourceForm({ onResourceAdded }: { onResourceAdded: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resourceType: "" as ResourceType,
    fileUrl: "",
    category: "" as ResourceCategory,
    isPublic: true,
    accessLevel: "certified",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.resourceType || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addPeaceSealCenterResource({
        title: formData.title,
        description: formData.description || undefined,
        resourceType: formData.resourceType,
        fileUrl: formData.fileUrl || undefined,
        category: formData.category,
        isPublic: formData.isPublic,
        accessLevel: formData.accessLevel,
      });

      toast({
        title: "Resource added successfully",
        description:
          "The new resource has been added to the Peace Seal Center.",
      });

      onResourceAdded();
    } catch {
      toast({
        title: "Error adding resource",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Resource title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Resource description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="resourceType">Resource Type *</Label>
          <Select
            value={formData.resourceType}
            onValueChange={(value) =>
              setFormData({ ...formData, resourceType: value as ResourceType })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="guide">Guide</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
              <SelectItem value="survey">Survey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value as ResourceCategory })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hr_policies">HR Policies</SelectItem>
              <SelectItem value="supplier_codes">Supplier Codes</SelectItem>
              <SelectItem value="peace_statements">Peace Statements</SelectItem>
              <SelectItem value="political_guidelines">
                Political Guidelines
              </SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="fileUrl">File URL</Label>
        <Input
          id="fileUrl"
          value={formData.fileUrl}
          onChange={(e) =>
            setFormData({ ...formData, fileUrl: e.target.value })
          }
          placeholder="https://example.com/resource.pdf"
          type="url"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#548281] hover:bg-[#2F4858]"
        >
          {isSubmitting ? "Adding..." : "Add Resource"}
        </Button>
      </div>
    </form>
  );
}
