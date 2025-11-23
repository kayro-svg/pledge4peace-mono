"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ResolutionModalProps {
  evaluation: { id: string; companyName?: string } | null;
  resolutionType: "resolved" | "dismissed" | null;
  isOpen: boolean;
  onClose: () => void;
  onResolutionSubmitted: (finalResolutionNotes: string) => void;
}

export function ResolutionModal({
  evaluation,
  resolutionType,
  isOpen,
  onClose,
  onResolutionSubmitted,
}: ResolutionModalProps) {
  const [finalResolutionNotes, setFinalResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!evaluation || !resolutionType) return;

    setIsSubmitting(true);
    try {
      onResolutionSubmitted(finalResolutionNotes);
      // Reset form
      setFinalResolutionNotes("");
    } catch (error) {
      console.error("Error submitting resolution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFinalResolutionNotes("");
    onClose();
  };

  if (!evaluation || !resolutionType) return null;

  const isResolved = resolutionType === "resolved";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isResolved ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Mark Evaluation as Resolved
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-600" />
                Dismiss Evaluation
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isResolved
              ? `Mark this evaluation for ${evaluation.companyName || "the company"} as resolved. Add any final notes about the resolution.`
              : `Dismiss this evaluation for ${evaluation.companyName || "the company"}. Add any notes explaining why it was dismissed.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="finalResolutionNotes">
              {isResolved ? "Resolution Notes" : "Dismissal Notes"} (Optional)
            </Label>
            <Textarea
              id="finalResolutionNotes"
              placeholder={
                isResolved
                  ? "Add any notes about how this issue was resolved..."
                  : "Add any notes explaining why this evaluation was dismissed..."
              }
              value={finalResolutionNotes}
              onChange={(e) => setFinalResolutionNotes(e.target.value)}
              rows={6}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={
                isResolved
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }
            >
              {isSubmitting
                ? "Processing..."
                : isResolved
                  ? "Mark as Resolved"
                  : "Dismiss"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

