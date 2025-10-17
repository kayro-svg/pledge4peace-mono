import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateSolution } from "@/lib/api/solutions";
import { logger } from "@/lib/utils/logger";

interface EditSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: {
    id: string;
    title: string;
    description: string;
  };
  onSave: (updatedSolution: {
    id: string;
    title: string;
    description: string;
  }) => void;
}

export function EditSolutionModal({
  isOpen,
  onClose,
  solution,
  onSave,
}: EditSolutionModalProps) {
  const [title, setTitle] = useState(solution.title);
  const [description, setDescription] = useState(solution.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSaving(true);
    try {
      await updateSolution(solution.id, {
        title: title.trim(),
        description: description.trim(),
      });

      toast.success("Solution updated successfully");
      onSave({
        id: solution.id,
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (error) {
      logger.error("Error updating solution:", error);
      toast.error("Failed to update solution");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setTitle(solution.title);
    setDescription(solution.description);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Solution</DialogTitle>
          <DialogDescription>
            Make changes to the solution content before approving it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter solution title"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter solution description"
              className="w-full min-h-[120px]"
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
