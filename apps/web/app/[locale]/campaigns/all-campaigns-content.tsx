"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { SanityCampaign } from "@/lib/types";
import { getCampaigns } from "@/lib/sanity/queries";
import AllCampaignsFilters from "@/components/all-campaigns-page/all-campaigns-filters";
import CampaignCard from "@/components/ui/campaign-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ALL_REGIONS_LABEL = "All Countries/Regions";

interface Props {
  initialCampaigns?: SanityCampaign[];
}

export default function AllCampaignsContent({ initialCampaigns = [] }: Props) {
  /* ───────── Locale de la ruta ───────── */
  const { locale } = useParams<{ locale: "en" | "es" }>();

  /* ───────── Estado ───────── */
  const [campaigns, setCampaigns] =
    useState<SanityCampaign[]>(initialCampaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS_LABEL);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedQty, setSelectedQty] = useState(9);

  /* ───────── Fetch (solo cuando cambia selectedQty) ───────── */
  useEffect(() => {
    if (initialCampaigns.length) return; // ya hidratado desde servidor
    getCampaigns(selectedQty, locale).then(setCampaigns);
  }, [initialCampaigns, selectedQty, locale]);

  /* ───────── Helpers ───────── */
  const toggleCategory = useCallback(
    (cat: string) =>
      setSelectedCategories((prev) =>
        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
      ),
    []
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedRegion(ALL_REGIONS_LABEL);
  };

  /* ───────── Derivados ───────── */
  const filteredCampaigns = useMemo(() => {
    let list = campaigns;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length) {
      list = list.filter((c) => selectedCategories.includes(c.category ?? ""));
    }

    if (selectedRegion !== ALL_REGIONS_LABEL) {
      list = list.filter((c) => c.countriesInvolved?.includes(selectedRegion));
    }
    return list;
  }, [campaigns, searchQuery, selectedCategories, selectedRegion]);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) =>
      c.countriesInvolved?.forEach((cty) => set.add(cty))
    );
    return Array.from(set);
  }, [campaigns]);

  /* ───────── Render ───────── */
  return (
    <div>
      {/* SEARCH BAR */}
      <div
        className="shadow-sm mt-[-90px] md:mt-[-105px]"
        style={{ zIndex: 1000 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-sm md:max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
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

      {/* FILTERS */}
      <AllCampaignsFilters
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        isFilterOpen={isFilterOpen}
        onFilterOpenChange={setIsFilterOpen}
        onClearFilters={clearFilters}
        categories={[
          "Peace",
          "Democracy",
          "Environment",
          "Education",
          "Health",
        ]}
        countryOptions={countryOptions}
        selectedQty={selectedQty}
        onQtyChange={setSelectedQty}
      />

      {/* RESULTS */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredCampaigns.length} campaign
            {filteredCampaigns.length !== 1 ? "s" : ""}
          </p>

          {/* badge móvil */}
          <div className="md:hidden">
            {(selectedCategories.length ||
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
          {filteredCampaigns.map((c) => (
            <CampaignCard
              key={c._id}
              title={c.title}
              description={c.description}
              featuredImage={c.featuredImage?.asset?.url ?? "/placeholder.svg"}
              goal={c.goalPledges}
              category={c.category ?? "General"}
              action="Pledge Now"
              variant="default"
              link={`/${locale}/campaigns/${c.slug.current}`}
              campaignId={c._id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* Puedes envolver el componente en <Suspense/> si lo cargas
   desde un Server Component para que haga streaming:         */
// <Suspense fallback={<Spinner/>}>
//   <AllCampaignsContent/>
// </Suspense>

// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { SanityCampaign } from "@/lib/types";
// import AllCampaignsFilters from "@/components/all-campaigns-page/all-campaigns-filters";
// import CampaignCard from "@/components/ui/campaign-card";
// import { Input } from "@/components/ui/input";
// import { Search, X } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { getCampaigns } from "@/lib/sanity/queries";

// interface AllCampaignsContentProps {
//   initialCampaigns?: SanityCampaign[]; // si ya hidratas algo desde el server
// }

// const ALL_REGIONS_LABEL = "All Countries/Regions";

// export default function AllCampaignsContent({
//   initialCampaigns = [], // fallback seguro
// }: AllCampaignsContentProps) {
//   /* ──────────────────────────
//      1.  ESTADO BÁSICO
//   ────────────────────────── */
//   const [campaigns, setCampaigns] =
//     useState<SanityCampaign[]>(initialCampaigns);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS_LABEL);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [selectedQty, setSelectedQty] = useState(9);

//   /* ──────────────────────────
//      2.  FETCH SOLO UNA VEZ
//   ────────────────────────── */
//   const campaignsToFetch = useMemo(() => {
//     return getCampaigns(selectedQty);
//   }, [selectedQty]);

//   useEffect(() => {
//     // si ya llegaron campañas inic., evita nuevo fetch
//     if (initialCampaigns.length) return;

//     (async () => {
//       const data = await campaignsToFetch;
//       setCampaigns(data);
//     })();
//   }, [initialCampaigns, campaignsToFetch]);
//   /* ──────────────────────────
//      3.  DATOS DERIVADOS
//   ────────────────────────── */
//   const filteredCampaigns = useMemo(() => {
//     let list = campaigns;

//     // búsqueda por texto
//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       list = list.filter(
//         (c) =>
//           c.title.toLowerCase().includes(q) ||
//           c.description.toLowerCase().includes(q)
//       );
//     }

//     // categorías
//     if (selectedCategories.length) {
//       list = list.filter((c) => selectedCategories.includes(c.category ?? ""));
//     }

//     // región
//     if (selectedRegion !== ALL_REGIONS_LABEL) {
//       list = list.filter((c) => c.countriesInvolved?.includes(selectedRegion));
//     }

//     return list;
//   }, [campaigns, searchQuery, selectedCategories, selectedRegion]);

//   // Opciones de países - se recalculan solo cuando cambia la data original
//   const countryOptions = useMemo(
//     () => campaigns.flatMap((c) => c.countriesInvolved),
//     [campaigns]
//   );

//   /* ──────────────────────────
//      4.  HANDLERS
//   ────────────────────────── */
//   const toggleCategory = (cat: string) =>
//     setSelectedCategories((prev) =>
//       prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
//     );

//   const clearFilters = () => {
//     setSearchQuery("");
//     setSelectedCategories([]);
//     setSelectedRegion(ALL_REGIONS_LABEL);
//   };

//   /* ──────────────────────────
//      5.  RENDER
//   ────────────────────────── */
//   return (
//     <div>
//       {/* ===== SEARCH BAR ===== */}
//       <div
//         className="shadow-sm mt-[-90px] md:mt-[-105px]"
//         style={{ zIndex: 1000 }}
//       >
//         <div className="container mx-auto px-4 py-4">
//           <div className="max-w-sm md:max-w-2xl mx-auto relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
//             <Input
//               type="text"
//               placeholder="Search campaigns..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-12 pr-4 py-4 md:py-6 text-base md:text-lg rounded-full shadow-lg bg-white"
//             />
//             {searchQuery && (
//               <Button
//                 variant="ghost"
//                 onClick={() => setSearchQuery("")}
//                 className="absolute right-4 top-1/2 -translate-y-1/2"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ===== FILTERS ===== */}
//       <AllCampaignsFilters
//         selectedCategories={selectedCategories}
//         onToggleCategory={toggleCategory}
//         selectedRegion={selectedRegion}
//         onRegionChange={setSelectedRegion}
//         isFilterOpen={isFilterOpen}
//         onFilterOpenChange={setIsFilterOpen}
//         onClearFilters={clearFilters}
//         categories={[
//           "Peace",
//           "Democracy",
//           "Environment",
//           "Education",
//           "Health",
//         ]}
//         countryOptions={countryOptions}
//         selectedQty={selectedQty}
//         onQtyChange={setSelectedQty}
//       />

//       {/* ===== RESULTS ===== */}
//       <section className="container mx-auto px-4 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <p className="text-gray-600">
//             Showing {filteredCampaigns.length} campaign
//             {filteredCampaigns.length !== 1 ? "s" : ""}
//           </p>

//           {/* Badge móvil con nº de filtros */}
//           <div className="md:hidden">
//             {(selectedCategories.length ||
//               selectedRegion !== ALL_REGIONS_LABEL) && (
//               <Badge variant="outline">
//                 {selectedCategories.length +
//                   (selectedRegion !== ALL_REGIONS_LABEL ? 1 : 0)}{" "}
//                 filter
//                 {selectedCategories.length +
//                   (selectedRegion !== ALL_REGIONS_LABEL ? 1 : 0) !==
//                 1
//                   ? "s"
//                   : ""}{" "}
//                 active
//               </Badge>
//             )}
//           </div>
//         </div>

//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredCampaigns.map((c) => (
//             <CampaignCard
//               key={c._id}
//               title={c.title}
//               description={c.description}
//               featuredImage={c.featuredImage?.asset?.url || "/placeholder.svg"}
//               goal={c.goalPledges}
//               category={c.category || "General"}
//               action="Pledge Now"
//               variant="default"
//               link={c.slug.current}
//               campaignId={c._id}
//             />
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
