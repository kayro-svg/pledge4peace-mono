"use client";

import { useState, useEffect } from "react";
import { SanityCampaign } from "@/lib/types";
import AllCampaignsFilters from "@/components/all-campaigns-page/all-campaigns-filters";
import CampaignCard from "@/components/ui/campaign-card";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AllCampaignsContentProps {
  initialCampaigns: SanityCampaign[];
}

const ALL_REGIONS_LABEL = "All Countries/Regions";

export default function AllCampaignsContent({
  initialCampaigns,
}: AllCampaignsContentProps) {
  // —— estados
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS_LABEL);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // —— campañas mostradas
  const [campaigns, setCampaigns] =
    useState<SanityCampaign[]>(initialCampaigns);

  // —— listas auxiliares
  const campaignCategories = [
    "Peace",
    "Democracy",
    "Environment",
    "Education",
    "Health",
  ];
  const countryOptions = initialCampaigns.flatMap((c) => c.countriesInvolved);

  // —— handlers
  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedRegion(ALL_REGIONS_LABEL);
  };

  // —— recalcula `campaigns`
  useEffect(() => {
    let filtered = initialCampaigns;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((c) =>
        selectedCategories.includes(c.category || "")
      );
    }
    if (selectedRegion !== ALL_REGIONS_LABEL) {
      filtered = filtered.filter((c) =>
        c.countriesInvolved?.includes(selectedRegion)
      );
    }

    setCampaigns(filtered);
  }, [initialCampaigns, searchQuery, selectedCategories, selectedRegion]);

  return (
    <div>
      {/* ===== SEARCH BAR ===== */}
      <div
        className="shadow-sm mt-[-90px] md:mt-[-105px]"
        style={{ zIndex: 1000 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-sm md:max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 md:py-6 text-base md:text-lg rounded-full shadow-lg bg-white"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <AllCampaignsFilters
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        isFilterOpen={isFilterOpen}
        onFilterOpenChange={setIsFilterOpen}
        onClearFilters={clearFilters}
        categories={campaignCategories}
        countryOptions={countryOptions}
      />

      {/* ===== RESULTS ===== */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {campaigns.length} campaign
            {campaigns.length !== 1 ? "s" : ""}
          </p>

          {/* Badge móvil con nº de filtros */}
          <div className="md:hidden">
            {(selectedCategories.length > 0 ||
              selectedRegion !== ALL_REGIONS_LABEL) && (
              <Badge variant="outline">
                {selectedCategories.length +
                  (selectedRegion !== ALL_REGIONS_LABEL ? 1 : 0)}{" "}
                filter
                {selectedCategories.length +
                  (selectedRegion !== ALL_REGIONS_LABEL ? 1 : 0) !==
                1
                  ? "s"
                  : ""}{" "}
                active
              </Badge>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard
              key={c._id}
              title={c.title}
              description={c.description}
              featuredImage={c.featuredImage?.asset?.url || "/placeholder.svg"}
              goal={c.goalPledges}
              category={c.category || "General"}
              action="Pledge Now"
              variant="default"
              link={c.slug.current}
              campaignId={c._id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
