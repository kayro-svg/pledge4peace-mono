// hooks/useSanityData.ts
"use client";

import { useState, useEffect } from "react";
import { getHomePageData } from "@/lib/sanity/queries";
import { HomePageData } from "@/lib/types";

export function useHomePageData() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const homeData = await getHomePageData();
        setData(homeData);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching Sanity data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}
