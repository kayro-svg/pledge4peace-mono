"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteSolution, deleteComment } from "@/lib/api/solutions";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { logger } from "@/lib/utils/logger";

interface AdminActionsProps {
  type: "solution" | "comment";
  resourceId: string;
  resourceOwnerId?: string;
  onDeleted?: () => void;
  className?: string;
}

/**
 * Componente de acciones de administración para SuperAdmins
 * Permite eliminar solutions y comments con confirmación
 */
export default function AdminActions({
  type,
  resourceId,
  resourceOwnerId,
  onDeleted,
  className,
}: AdminActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { canDelete, isSuperAdmin } = useAdminPermissions();

  // No mostrar nada si el usuario no tiene permisos
  if (!canDelete(resourceOwnerId)) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      if (type === "solution") {
        await deleteSolution(resourceId);
        toast.success("Solution deleted successfully");
      } else {
        await deleteComment(resourceId);
        toast.success("Comment deleted successfully");
      }

      // Llamar callback si se proporciona
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-red-600 hover:text-red-700 bg-red-50 md:bg-transparent md:hover:bg-red-50 ${className}`}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          {isSuperAdmin && resourceOwnerId ? (
            <span className="ml-1 text-xs">(Admin)</span>
          ) : null}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {type}? This action cannot be
            undone.
            {isSuperAdmin && resourceOwnerId && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Admin Action:</strong> You are deleting content
                  created by another user.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
