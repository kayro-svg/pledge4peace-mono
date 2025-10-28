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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
} from "lucide-react";
import type { TemplateResource } from "@/types/questionnaire";

interface OwnerInfo {
  name: string;
  email: string;
}

interface BeneficialOwnershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateResource | null;
  onAccept: (data: { numberOfOwners: number; owners: OwnerInfo[] }) => void;
  isAccepting?: boolean;
}

export default function BeneficialOwnershipModal({
  open,
  onOpenChange,
  template,
  onAccept,
  isAccepting = false,
}: BeneficialOwnershipModalProps) {
  const [step, setStep] = useState(1);
  const [numberOfOwners, setNumberOfOwners] = useState(1);
  const [owners, setOwners] = useState<OwnerInfo[]>([{ name: "", email: "" }]);
  const [allOwnersAgree, setAllOwnersAgree] = useState(false);

  const handleClose = () => {
    setStep(1);
    setNumberOfOwners(1);
    setOwners([{ name: "", email: "" }]);
    setAllOwnersAgree(false);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step === 1) {
      // Generate owner input fields based on number
      const newOwners = Array.from({ length: numberOfOwners }, () => ({
        name: "",
        email: "",
      }));
      setOwners(newOwners);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleAccept = () => {
    if (allOwnersAgree) {
      onAccept({ numberOfOwners, owners });
    }
  };

  const updateOwner = (
    index: number,
    field: keyof OwnerInfo,
    value: string
  ) => {
    const newOwners = [...owners];
    newOwners[index][field] = value;
    setOwners(newOwners);
  };

  const addOwner = () => {
    setOwners([...owners, { name: "", email: "" }]);
  };

  const removeOwner = (index: number) => {
    const newOwners = owners.filter((_, i) => i !== index);
    setOwners(newOwners);
  };

  const canProceedStep1 = numberOfOwners > 0 && numberOfOwners <= 20;
  const canProceedStep2 = owners.every((owner) => owner.name.trim() !== "");
  const canProceedStep3 = allOwnersAgree;

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

        {/* Step 1: Number of owners */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">View Policy</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Please review the policy document
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

            <div className="space-y-2">
              <Label htmlFor="owner-count">
                How many individuals own or have control over the organization?
              </Label>
              <Input
                id="owner-count"
                type="number"
                min="1"
                max="20"
                value={numberOfOwners}
                onChange={(e) =>
                  setNumberOfOwners(parseInt(e.target.value) || 1)
                }
              />
              <p className="text-xs text-gray-500">
                Enter a number between 1 and 20
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Owner details */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">
              Please provide details for each owner/controller:
            </p>

            <div className="space-y-3">
              {owners.map((owner, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Owner {index + 1}</h4>
                    {owners.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOwner(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owner-${index}-name`}>Full Name *</Label>
                    <Input
                      id={`owner-${index}-name`}
                      value={owner.name}
                      onChange={(e) =>
                        updateOwner(index, "name", e.target.value)
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owner-${index}-email`}>
                      Email (Optional)
                    </Label>
                    <Input
                      id={`owner-${index}-email`}
                      type="email"
                      value={owner.email}
                      onChange={(e) =>
                        updateOwner(index, "email", e.target.value)
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              ))}
            </div>

            {owners.length < 20 && (
              <Button variant="outline" onClick={addOwner} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Owner
              </Button>
            )}
          </div>
        )}

        {/* Step 3: Agreement */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-sm mb-2">Document Preview</h4>
              <p className="text-sm text-gray-700">
                The following individuals agree to these policies:
              </p>
              <ul className="mt-2 space-y-1">
                {owners.map((owner, index) => (
                  <li key={index} className="text-sm">
                    {index + 1}. {owner.name || `Owner ${index + 1}`}
                    {owner.email && ` (${owner.email})`}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
              <Checkbox
                id="all-owners-agree"
                checked={allOwnersAgree}
                onCheckedChange={(checked) =>
                  setAllOwnersAgree(checked === true)
                }
              />
              <label
                htmlFor="all-owners-agree"
                className="text-sm leading-relaxed cursor-pointer"
              >
                All listed individuals agree to these policies. I understand
                that this cannot be changed unless an auditor unlocks it.
              </label>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                You can email these policies to all parties involved later from
                your dashboard.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500">Step {step} of 3</div>
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isAccepting}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2) ||
                    isAccepting
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleAccept}
                  disabled={!canProceedStep3 || isAccepting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isAccepting ? "Accepting..." : "Accept Agreement"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
