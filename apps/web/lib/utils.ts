import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatEventDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } catch {
    return "Date and time not specified";
  }
}

/**
 * Verifica si un usuario es SuperAdmin
 * @param userRole - El role del usuario desde la sesión
 */
export function isSuperAdmin(userRole?: string): boolean {
  return userRole === "superAdmin";
}

export function isModeratorOrAbove(userRole?: string): boolean {
  return (
    userRole === "moderator" ||
    userRole === "admin" ||
    userRole === "superAdmin"
  );
}

/**
 * Verifica si un usuario puede eliminar un recurso específico
 * @param currentUserId - ID del usuario actual
 * @param resourceOwnerId - ID del propietario del recurso
 * @param userRole - Role del usuario actual
 */
export function canDeleteResource(
  currentUserId?: string,
  resourceOwnerId?: string,
  userRole?: string
): boolean {
  if (!currentUserId || !resourceOwnerId) return false;

  // El usuario puede eliminar si es el propietario O si es superAdmin
  return currentUserId === resourceOwnerId || isSuperAdmin(userRole);
}

/**
 * Verifica si se debe mostrar los controles de administración
 * @param userRole - Role del usuario desde la sesión
 */
export function showAdminControls(userRole?: string): boolean {
  return isSuperAdmin(userRole);
}
