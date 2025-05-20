"use client";

import { ReactNode, createContext, useContext, useState } from "react";

// Tipo para almacenar interacciones del usuario
interface UserInteractions {
  likes: Record<string, boolean>;
  dislikes: Record<string, boolean>;
  shares: Record<string, boolean>;
  comments: Record<string, boolean>;
}

// Tipo para los datos de conteo de interacciones de cada solución
interface InteractionCounts {
  likes: Record<string, number>;
  dislikes: Record<string, number>;
  shares: Record<string, number>;
  comments: Record<string, number>;
}

interface InteractionContextType {
  // Datos de interacción del usuario actual
  userInteractions: UserInteractions;
  // Contadores globales de interacciones
  interactionCounts: InteractionCounts;
  // Métodos para interactuar
  handleInteraction: (
    type: string,
    solutionId: string,
    count: number
  ) => Promise<void>;
  // Verificar si el usuario ha interactuado
  hasInteracted: (type: string, solutionId: string) => boolean;
  // Obtener conteo actual
  getInteractionCount: (type: string, solutionId: string) => number;
}

// Valores iniciales de ejemplo (mock data)
const mockCounts: InteractionCounts = {
  likes: {
    "strengthen-democracy": 542,
    "land-reforms": 378,
    "economy-charter": 425,
    "national-security-charter": 289,
  },
  dislikes: {
    "strengthen-democracy": 78,
    "land-reforms": 126,
    "economy-charter": 85,
    "national-security-charter": 143,
  },
  shares: {
    "strengthen-democracy": 215,
    "land-reforms": 187,
    "economy-charter": 193,
    "national-security-charter": 112,
  },
  comments: {
    "strengthen-democracy": 10,
    "land-reforms": 5,
    "economy-charter": 8,
    "national-security-charter": 3,
  },
};

// Crear el contexto
const InteractionContext = createContext<InteractionContextType | undefined>(
  undefined
);

// Proveedor del contexto
export function InteractionProvider({ children }: { children: ReactNode }) {
  // Estado para las interacciones del usuario
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({
    likes: {},
    dislikes: {},
    shares: {},
    comments: {},
  });

  // Estado para los contadores globales (inicializado con datos simulados)
  const [interactionCounts, setInteractionCounts] = useState<InteractionCounts>(
    {
      likes: { ...mockCounts.likes },
      dislikes: { ...mockCounts.dislikes },
      shares: { ...mockCounts.shares },
      comments: { ...mockCounts.comments },
    }
  );

  // Función para manejar las interacciones
  const handleInteraction = async (
    type: string,
    solutionId: string,
    count: number
  ) => {
    try {
      // Actualizar el estado de interacción del usuario primero
      setUserInteractions((prev) => {
        const newInteractions = { ...prev };
        if (
          type === "like" ||
          type === "dislike" ||
          type === "share" ||
          type === "comment"
        ) {
          const typeKey = type as keyof UserInteractions;
          const hasInteracted =
            newInteractions[typeKey] && newInteractions[typeKey][solutionId];

          // Si ya existe, lo eliminamos (toggle)
          if (hasInteracted) {
            const updatedType = { ...newInteractions[typeKey] };
            delete updatedType[solutionId];
            newInteractions[typeKey] = updatedType;
          } else {
            // Añadimos la nueva interacción
            newInteractions[typeKey] = {
              ...newInteractions[typeKey],
              [solutionId]: true,
            };

            // Si es like, eliminamos el dislike si existe (o viceversa)
            if (type === "like" || type === "dislike") {
              const oppositeType = type === "like" ? "dislikes" : "likes";
              if (
                newInteractions[oppositeType] &&
                newInteractions[oppositeType][solutionId]
              ) {
                const updatedOpposite = { ...newInteractions[oppositeType] };
                delete updatedOpposite[solutionId];
                newInteractions[oppositeType] = updatedOpposite;
              }
            }
          }
        }
        return newInteractions;
      });

      // Después actualizamos los contadores con base en el estado actualizado
      setInteractionCounts((prev) => {
        // Creamos una copia para modificar
        const newCounts = { ...prev };

        if (type === "like" || type === "dislike" || type === "share") {
          const typeKey = type as keyof InteractionCounts;

          // Actualizamos el contador para el tipo actual (like, dislike o share)
          newCounts[typeKey] = {
            ...(newCounts[typeKey] || {}),
            [solutionId]: count,
          };

          // Si es like o dislike, también actualizamos el contador del tipo opuesto
          if (type === "like" || type === "dislike") {
            const oppositeType = type === "like" ? "dislikes" : "likes";

            // Verificar si existe el contador actual y el valor previo
            const prevTypeCount = prev[typeKey] && prev[typeKey][solutionId];
            const prevCount =
              typeof prevTypeCount === "number" ? prevTypeCount : 0;

            // Verificar si existe el contador opuesto
            const oppositeTypeKey = oppositeType as keyof InteractionCounts;
            const prevOppositeCount =
              prev[oppositeTypeKey] && prev[oppositeTypeKey][solutionId];

            const oppositeCount =
              typeof prevOppositeCount === "number" ? prevOppositeCount : 0;

            // Si estamos incrementando uno, decrementamos el otro si es necesario
            if (count > prevCount && oppositeCount > 0) {
              newCounts[oppositeTypeKey] = {
                ...(newCounts[oppositeTypeKey] || {}),
                [solutionId]: Math.max(0, oppositeCount - 1),
              };
            }
          }
        }

        return newCounts;
      });
    } catch (error) {
      console.error("Error al procesar la interacción:", error);
    }
  };

  // Verificar si el usuario ha interactuado
  const hasInteracted = (type: string, solutionId: string): boolean => {
    if (!solutionId) return false;

    if (
      type === "like" ||
      type === "dislike" ||
      type === "share" ||
      type === "comment"
    ) {
      const typeKey = type as keyof UserInteractions;
      const interactionsForType = userInteractions[typeKey] || {};
      return Boolean(interactionsForType[solutionId]);
    }
    return false;
  };

  // Obtener conteo actual
  const getInteractionCount = (type: string, solutionId: string): number => {
    if (!solutionId) return 0;

    if (
      type === "like" ||
      type === "dislike" ||
      type === "share" ||
      type === "comment"
    ) {
      const typeKey = type as keyof InteractionCounts;
      const countsForType = interactionCounts[typeKey] || {};
      return countsForType[solutionId] || 0;
    }
    return 0;
  };

  // Valor del contexto
  const value: InteractionContextType = {
    userInteractions,
    interactionCounts,
    handleInteraction,
    hasInteracted,
    getInteractionCount,
  };

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useInteractions() {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error(
      "useInteractions debe ser usado dentro de un InteractionProvider"
    );
  }
  return context;
}
