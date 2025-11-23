"use client";

import { useState, useMemo } from "react";
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
import { AGREEMENT_TEXTS as SMALL_AGREEMENTS } from "@/config/templates/small-business-agreements";
import { MEDIUM_AGREEMENT_TEXTS } from "@/config/templates/medium-business-agreements";
import { LARGE_AGREEMENT_TEXTS } from "@/config/templates/large-business-agreements";

// Merge small, medium, and large agreement texts
const ALL_AGREEMENT_TEXTS = {
  ...SMALL_AGREEMENTS,
  ...MEDIUM_AGREEMENT_TEXTS,
  ...LARGE_AGREEMENT_TEXTS,
};

interface OwnerInfo {
  name: string;
  email: string;
}

interface BeneficialOwnershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateResource | null;
  templateId?: string; // Fallback template ID if template is not loaded from API
  onAccept: (data: { numberOfOwners: number; owners: OwnerInfo[] }) => void;
  isAccepting?: boolean;
}

export default function BeneficialOwnershipModal({
  open,
  onOpenChange,
  template,
  templateId,
  onAccept,
  isAccepting = false,
}: BeneficialOwnershipModalProps) {
  const [step, setStep] = useState(1);
  const [numberOfOwners, setNumberOfOwners] = useState(1);
  const [owners, setOwners] = useState<OwnerInfo[]>([{ name: "", email: "" }]);
  const [allOwnersAgree, setAllOwnersAgree] = useState(false);

  // Get agreement text for this template - use templateId as fallback
  const agreementText = useMemo(() => {
    const idToUse =
      template?.id || templateId || "template_beneficial_ownership";
    return ALL_AGREEMENT_TEXTS[idToUse] || null;
  }, [template, templateId]);

  // Use agreement text title if available, otherwise use template from API
  const displayTitle = agreementText?.title || template?.title || "Loading...";

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
      <DialogContent className="!max-w-5xl w-[95vw] h-[95vh] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            {displayTitle}
          </DialogTitle>
          <DialogDescription>
            {template?.description ||
              "Please review the policy and provide ownership information"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Policy content and number of owners */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Policy Text Viewer */}
            <div className="space-y-2">
              <div>
                <p className="font-medium text-sm">View Policy</p>
                <p className="text-xs text-gray-600 mt-1">
                  Please review the policy document before proceeding
                </p>
              </div>
              {agreementText && (
                <div className="border rounded-lg bg-white p-6 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {agreementText.body
                      .split("\n")
                      .map((line: string, idx: number) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1
                              key={idx}
                              className="text-xl font-bold mt-4 mb-2"
                            >
                              {line.substring(2)}
                            </h1>
                          );
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h2
                              key={idx}
                              className="text-lg font-semibold mt-3 mb-2"
                            >
                              {line.substring(3)}
                            </h2>
                          );
                        }
                        if (line.startsWith("### ")) {
                          return (
                            <h3
                              key={idx}
                              className="text-md font-medium mt-2 mb-1"
                            >
                              {line.substring(4)}
                            </h3>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <li key={idx} className="ml-4 mb-1">
                              {line.substring(2)}
                            </li>
                          );
                        }
                        if (line.trim() === "") {
                          return <br key={idx} />;
                        }
                        return (
                          <p key={idx} className="mb-2 text-sm leading-relaxed">
                            {line}
                          </p>
                        );
                      })}
                  </div>
                </div>
              )}
              {!agreementText && template?.fileUrl && (
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
                      onClick={() => window.open(template.fileUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Document
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
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

            {/* <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                You can email these policies to all parties involved later from
                your dashboard.
              </p>
            </div> */}
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
