import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import AdminActions from "@/components/admin/admin-actions";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";

interface CommentItemProps {
  id: string; // Agregar ID del comentario
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  onDeleted?: () => void; // Callback cuando se elimina el comentario
}

export default function CommentItem({
  id,
  author,
  content,
  createdAt,
  onDeleted,
}: CommentItemProps) {
  const { canDelete } = useAdminPermissions();

  // Get initials for avatar fallback
  const initials = (author.name || "Anonymous")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group flex gap-3 py-3 hover:bg-gray-50 rounded-lg px-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author.avatar} alt={author.name || "Anonymous"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm">
              {author.name || "Anonymous"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>

          {/* Botón de administración - Solo visible si el usuario tiene permisos */}
          {canDelete(author.id) && (
            <AdminActions
              type="comment"
              resourceId={id}
              resourceOwnerId={author.id}
              onDeleted={onDeleted}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
        <p className="text-sm mt-1 text-gray-700">{content}</p>
      </div>
    </div>
  );
}
