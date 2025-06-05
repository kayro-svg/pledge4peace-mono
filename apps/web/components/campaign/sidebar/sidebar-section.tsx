import CommentsSection from "@/components/campaign/comments/comments-section";
import { API_ENDPOINTS } from "@/lib/config";
import { useEffect, useState, useCallback, useRef } from "react";

interface SidebarSectionProps {
  solutionId?: string;
}

export default function SidebarSection({ solutionId }: SidebarSectionProps) {
  const [solutionTitle, setSolutionTitle] = useState<string | null>(null);

  // Cache de títulos de soluciones para evitar llamadas repetidas a la API
  const solutionTitleCache = useRef<Record<string, string>>({});
  
  // Función para obtener solución con caché
  const fetchSolution = useCallback(async (sid: string) => {
    // Si ya tenemos el título en caché, usarlo
    if (solutionTitleCache.current[sid]) {
      console.log(`[Sidebar] Using cached solution title for: ${sid}`);
      setSolutionTitle(solutionTitleCache.current[sid]);
      return;
    }
    
    try {
      console.log(`[Sidebar] Fetching solution details for: ${sid}`);
      
      // Usar AbortController para evitar peticiones colgadas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const solution = await fetch(
        API_ENDPOINTS.solutions.getById(sid),
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!solution.ok) {
        throw new Error(`Failed to fetch solution: ${solution.status}`);
      }
      
      const data = await solution.json();
      
      // Guardar en caché y actualizar estado
      if (data.title) {
        solutionTitleCache.current[sid] = data.title;
        setSolutionTitle(data.title);
      }
    } catch (error) {
      console.error("[Sidebar] Error fetching solution:", error);
      // Usar un título genérico en caso de error
      setSolutionTitle("Solution details");
    }
  }, []);

  // Efecto para cargar la solución cuando cambia el ID
  useEffect(() => {
    if (solutionId) {
      fetchSolution(solutionId);
    } else {
      setSolutionTitle(null);
    }
  }, [solutionId, fetchSolution]);

  return (
    <div className="bg-white rounded-3xl shadow-[0_0_10px_rgba(0,0,0,0.1)] p-6 flex flex-col h-full lg:max-h-[88vh] overflow-y-auto">
      <div className="flex flex-col gap-4 mb-4">
        <p className="text-lg font-bold leading-tight">
          {solutionTitle ||
            "Select a solution to view comments and add your thoughts"}
        </p>
        {solutionId && (
          <p className="text-sm text-gray-500">
            Share your thoughts on the solution and help us make it better.
          </p>
        )}
      </div>

      <CommentsSection solutionId={solutionId} />
    </div>
  );
}
