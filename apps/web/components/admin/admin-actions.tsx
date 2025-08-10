"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, MoreVertical, Pencil } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteSolution, deleteComment } from "@/lib/api/solutions";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AdminActionsProps {
  type: "solution" | "comment";
  resourceId: string;
  resourceOwnerId?: string;
  onDeleted?: () => void;
  onEditClick?: () => void;
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
  onEditClick,
}: AdminActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { canDelete, isSuperAdmin, canEdit, isModeratorOrAbove } =
    useAdminPermissions();
  const t = useTranslations("toastMessages");
  // No mostrar nada si el usuario no tiene permisos
  // Solo mostrar para roles privilegiados
  if (!isModeratorOrAbove) {
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`md:opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canEdit() && onEditClick && (
            <DropdownMenuItem
              onClick={onEditClick}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
          )}
          {canDelete(resourceOwnerId) && (
            <>
              {canEdit() && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onSelect={() => {
                  // Allow menu to close, then open the dialog to avoid focus being inside aria-hidden menu
                  setTimeout(() => setIsConfirmOpen(true), 0);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {t("confirmDeletion")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeletionDescription", { type })}
              {isSuperAdmin && resourceOwnerId && (
                <span className="mt-2 block p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <span className="text-sm text-yellow-800">
                    ⚠️ <strong>{t("adminAction")}:</strong>{" "}
                    {t("adminActionDescription")}
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleDelete();
                setIsConfirmOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
