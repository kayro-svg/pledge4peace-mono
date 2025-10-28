"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import type { TemplateResource } from "@/types/questionnaire";

interface AgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateResource | null;
  onAccept: () => void;
  isAccepting?: boolean;
}

export default function AgreementModal({
  open,
  onOpenChange,
  template,
  onAccept,
  isAccepting = false,
}: AgreementModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleClose = () => {
    setAccepted(false);
    onOpenChange(false);
  };

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            {template?.title || "Loading..."}
          </DialogTitle>
          <DialogDescription>
            {template?.description || "Loading agreement template..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">View Agreement</p>
                <p className="text-xs text-gray-600 mt-1">
                  Please review the agreement document before accepting
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  template && window.open(template.fileUrl, "_blank")
                }
                disabled={!template}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Document
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="agreement-checkbox"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="agreement-checkbox"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and agree to this document. I understand that once I
              accept this agreement, it cannot be changed unless an auditor
              unlocks it for me to modify.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAccepting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted || isAccepting || !template}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? "Accepting..." : "Accept Agreement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
