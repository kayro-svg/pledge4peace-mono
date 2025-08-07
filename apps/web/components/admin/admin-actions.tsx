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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("toastMessages");
  // No mostrar nada si el usuario no tiene permisos
  if (!canDelete(resourceOwnerId)) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      if (type === "solution") {
        await deleteSolution(resourceId);
        toast.success(t("solutionDeleted"));
      } else {
        const response = await deleteComment(resourceId);

        // Mostrar mensaje de éxito con información sobre replies eliminados
        if (response.deletedReplies && response.deletedReplies.length > 0) {
          toast.success(
            t("commentAndRepliesDeleted", {
              count: response.deletedReplies.length,
            })
          );
        } else {
          toast.success(t("commentDeleted"));
        }
      }

      // Llamar callback si se proporciona
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("failedToDelete");
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
            {t("confirmDeletion")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmDeletionDescription", { type })}
            {isSuperAdmin && resourceOwnerId && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>{t("adminAction")}:</strong>{" "}
                  {t("adminActionDescription")}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
