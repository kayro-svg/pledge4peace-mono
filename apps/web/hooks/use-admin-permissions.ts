import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  isSuperAdmin,
  canDeleteResource,
  showAdminControls,
} from "@/lib/utils";

/**
 * Hook personalizado para manejar permisos de administración
 * Proporciona funciones para verificar si el usuario actual tiene permisos de superAdmin
 */
export function useAdminPermissions() {
  const { data: session } = useSession();

  const permissions = useMemo(() => {
    const user = session?.user;
    const userId = user?.id;
    const userRole = user?.role;

    return {
      // Verificar si el usuario es superAdmin
      isSuperAdmin: isSuperAdmin(userRole),

      // Verificar si se deben mostrar controles de administración
      showAdminControls: showAdminControls(userRole),

      // Función para verificar si puede eliminar un recurso específico
      canDelete: (resourceOwnerId?: string) =>
        canDeleteResource(userId, resourceOwnerId, userRole),

      // Información del usuario actual
      currentUserId: userId,
      userRole: userRole,
    };
  }, [session]);

  return permissions;
}
