"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Globe, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface AllCampaignsFiltersProps {
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  isFilterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  onClearFilters: () => void;
  categories: string[];
  countryOptions: (string | undefined)[];
  selectedQty: number;
  onQtyChange: (qty: number) => void;
}

const DESKTOP_OFFSET = 80; // px → coincide con `top-[80px]`

const AllCampaignsFilters: FC<AllCampaignsFiltersProps> = ({
  selectedCategories,
  onToggleCategory,
  selectedRegion,
  onRegionChange,
  isFilterOpen,
  onFilterOpenChange,
  onClearFilters,
  categories,
  countryOptions,
  selectedQty,
  onQtyChange,
}) => {
  const t = useTranslations("AllCampaigns_Page");
  const ALL_REGIONS_LABEL = "All Countries/Regions";
  const activeCount =
    selectedCategories.length + (selectedRegion !== ALL_REGIONS_LABEL ? 1 : 0);

  /** ▶ ref hacia el <section> para leer su posición */
  const sectionRef = useRef<HTMLElement | null>(null);
  /** ▶ estado: ¿ya está pegado? */
  const [isStuck, setIsStuck] = useState(false);

  /** ▶ detecta scroll solo en viewport ≥ md */
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      // Solo aplicamos en escritorio
      if (window.innerWidth < 768) {
        setIsStuck(false);
        return;
      }
      const { top } = sectionRef.current.getBoundingClientRect();
      setIsStuck(top <= DESKTOP_OFFSET);
    };

    handleScroll(); // llamada inicial
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`border-b sticky top-0 md:top-[70px] mt-2 md:mt-6 z-40 shadow-sm transition-colors ${
        isStuck ? "md:bg-white" : "md:bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        {/* === BOTÓN DE FILTRO (MÓVIL) === */}
        <div className="md:hidden bg-white">
          <Sheet open={isFilterOpen} onOpenChange={onFilterOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>{t("filters_mobile_label")}</span>
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeCount}
                    </Badge>
                  )}
                </div>
              </Button>
            </SheetTrigger>

            {/* === PANEL DESPLEGABLE (MÓVIL) === */}
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filter Campaigns</SheetTitle>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Categorías (móvil) */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {t("filters_categories_label")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={
                          selectedCategories.includes(cat)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => onToggleCategory(cat)}
                        className={`justify-start ${
                          selectedCategories.includes(cat)
                            ? "bg-primary"
                            : "bg-white"
                        }`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Regiones (móvil) */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {t("filters_countries_label")}
                  </h3>
                  <Select value={selectedRegion} onValueChange={onRegionChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_REGIONS_LABEL}>
                        {ALL_REGIONS_LABEL}
                      </SelectItem>
                      {countryOptions.map((opt, i) => (
                        <SelectItem key={i} value={opt || ""}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Limpiar filtros (móvil) */}
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={onClearFilters}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("filters_clear_all_label")}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* === FILTROS (DESKTOP) === */}
        <div className="hidden md:block">
          {/* Categorías + regiones */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            {/* Categorías */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {t("filters_categories_label")}:
              </span>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={
                    selectedCategories.includes(cat) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onToggleCategory(cat)}
                  className={`text-sm ${
                    selectedCategories.includes(cat) ? "bg-primary" : "bg-white"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Selector de región */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {t("filters_countries_label")}:
              </span>
              <Select value={selectedRegion} onValueChange={onRegionChange}>
                <SelectTrigger
                  className={`w-full sm:w-64 bg-white active:bg-primary`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_REGIONS_LABEL}>
                    {ALL_REGIONS_LABEL}
                  </SelectItem>
                  {countryOptions.map((opt, i) => (
                    <SelectItem key={i} value={opt || ""}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {t("filters_qty_label")}:
              </span>
              <Select
                value={selectedQty.toString()}
                onValueChange={(value) => onQtyChange(Number(value))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">10</SelectItem>
                  <SelectItem value="19">20</SelectItem>
                  <SelectItem value="29">30</SelectItem>
                  <SelectItem value="39">40</SelectItem>
                  <SelectItem value="49">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros activos + “Clear all” */}
          {activeCount > 0 && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {t("filters_active_label")}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="text-xs flex items-center"
                    >
                      {cat}
                      <button
                        onClick={() => onToggleCategory(cat)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedRegion !== ALL_REGIONS_LABEL && (
                    <Badge
                      variant="secondary"
                      className="text-xs flex items-center"
                    >
                      {selectedRegion}
                      <button
                        onClick={() => onRegionChange(ALL_REGIONS_LABEL)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {t("filters_clear_all_label")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AllCampaignsFilters;
