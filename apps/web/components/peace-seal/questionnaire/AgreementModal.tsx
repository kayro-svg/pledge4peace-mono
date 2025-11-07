"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AGREEMENT_TEXTS as SMALL_AGREEMENTS } from "@/config/templates/small-business-agreements";
import { MEDIUM_AGREEMENT_TEXTS } from "@/config/templates/medium-business-agreements";
import { LARGE_AGREEMENT_TEXTS } from "@/config/templates/large-business-agreements";
import type { TemplateResource } from "@/types/questionnaire";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

// Merge small, medium, and large agreement texts
const ALL_AGREEMENT_TEXTS = {
  ...SMALL_AGREEMENTS,
  ...MEDIUM_AGREEMENT_TEXTS,
  ...LARGE_AGREEMENT_TEXTS,
};

interface AgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateResource | null;
  templateId?: string; // Fallback template ID if template is not loaded from API
  onAccept: (acceptanceData?: Record<string, any>) => void;
  isAccepting?: boolean;
}

export default function AgreementModal({
  open,
  onOpenChange,
  template,
  templateId,
  onAccept,
  isAccepting = false,
}: AgreementModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [onBehalfOf, setOnBehalfOf] = useState("");
  // Supplier Self-Declaration fields
  const [companyName, setCompanyName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [contactPersonTitle, setContactPersonTitle] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [natureOfBusiness, setNatureOfBusiness] = useState("");
  const [q1_armsIndustry, setQ1_armsIndustry] = useState("");
  const [q2_sanctionedPartners, setQ2_sanctionedPartners] = useState("");
  const [q3_hasSupplierCode, setQ3_hasSupplierCode] = useState("");
  const [policyNotes, setPolicyNotes] = useState("");

  // Get agreement text for this template - use templateId as fallback
  const agreementText = useMemo(() => {
    const idToUse = template?.id || templateId;
    if (!idToUse) {
      console.warn("No template ID available", {
        templateId: template?.id,
        fieldTemplateId: templateId,
      });
      return null;
    }
    const text = ALL_AGREEMENT_TEXTS[idToUse];
    if (!text) {
      console.warn(
        "Agreement text not found for template ID:",
        idToUse,
        "Available IDs:",
        Object.keys(ALL_AGREEMENT_TEXTS)
      );
    }
    return text || null;
  }, [template, templateId]);

  // Use agreement text title if available, otherwise use template from API
  const displayTitle = agreementText?.title || template?.title || "Loading...";

  // Reset form when modal closes or template changes
  const resetForm = () => {
    setAccepted(false);
    setSignatoryName("");
    setSignatoryTitle("");
    setOnBehalfOf("");
    setCompanyName("");
    setBusinessAddress("");
    setContactPersonTitle("");
    setEmailPhone("");
    setNatureOfBusiness("");
    setQ1_armsIndustry("");
    setQ2_sanctionedPartners("");
    setQ3_hasSupplierCode("");
    setPolicyNotes("");
  };

  // Reset form when template or templateId changes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [template?.id, templateId, open]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Validate signature fields based on template requirements
  const isFormValid = useMemo(() => {
    if (!agreementText) return accepted;

    const fields = agreementText.signatureFields;
    let valid = true;

    if (fields.signatoryName && !signatoryName.trim()) valid = false;
    if (fields.signatoryTitle && !signatoryTitle.trim()) valid = false;
    if (fields.onBehalfOf && !onBehalfOf.trim()) valid = false;
    if (fields.companyName && !companyName.trim()) valid = false;
    if (fields.businessAddress && !businessAddress.trim()) valid = false;
    if (fields.contactPersonTitle && !contactPersonTitle.trim()) valid = false;
    if (fields.emailPhone && !emailPhone.trim()) valid = false;
    if (fields.natureOfBusiness && !natureOfBusiness.trim()) valid = false;
    if (fields.q1_armsIndustry && !q1_armsIndustry) valid = false;
    if (fields.q2_sanctionedPartners && !q2_sanctionedPartners) valid = false;
    if (fields.q3_hasSupplierCode && !q3_hasSupplierCode) valid = false;

    return valid && accepted;
  }, [
    agreementText,
    accepted,
    signatoryName,
    signatoryTitle,
    onBehalfOf,
    companyName,
    businessAddress,
    contactPersonTitle,
    emailPhone,
    natureOfBusiness,
    q1_armsIndustry,
    q2_sanctionedPartners,
    q3_hasSupplierCode,
  ]);

  const handleAccept = () => {
    if (!isFormValid) return;

    const acceptanceData: Record<string, any> = {
      signatoryName: signatoryName.trim(),
      signatoryTitle: signatoryTitle.trim(),
      acceptedAt: new Date().toISOString(),
    };

    if (agreementText?.signatureFields.onBehalfOf && onBehalfOf.trim()) {
      acceptanceData.onBehalfOf = onBehalfOf.trim();
    }

    // Supplier Self-Declaration specific fields
    if (agreementText?.signatureFields.companyName && companyName.trim()) {
      acceptanceData.companyName = companyName.trim();
    }

    if (
      agreementText?.signatureFields.businessAddress &&
      businessAddress.trim()
    ) {
      acceptanceData.businessAddress = businessAddress.trim();
    }

    if (
      agreementText?.signatureFields.contactPersonTitle &&
      contactPersonTitle.trim()
    ) {
      acceptanceData.contactPersonTitle = contactPersonTitle.trim();
    }

    if (agreementText?.signatureFields.emailPhone && emailPhone.trim()) {
      acceptanceData.emailPhone = emailPhone.trim();
    }

    if (
      agreementText?.signatureFields.natureOfBusiness &&
      natureOfBusiness.trim()
    ) {
      acceptanceData.natureOfBusiness = natureOfBusiness.trim();
    }

    if (agreementText?.signatureFields.q1_armsIndustry && q1_armsIndustry) {
      acceptanceData.q1_armsIndustry = q1_armsIndustry;
    }

    if (
      agreementText?.signatureFields.q2_sanctionedPartners &&
      q2_sanctionedPartners
    ) {
      acceptanceData.q2_sanctionedPartners = q2_sanctionedPartners;
    }

    if (
      agreementText?.signatureFields.q3_hasSupplierCode &&
      q3_hasSupplierCode
    ) {
      acceptanceData.q3_hasSupplierCode = q3_hasSupplierCode;
    }

    if (agreementText?.signatureFields.policyNotes && policyNotes.trim()) {
      acceptanceData.policyNotes = policyNotes.trim();
    }

    onAccept(acceptanceData);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-5xl w-[95vw] h-[95vh] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            {displayTitle}
          </DialogTitle>
          {/* <DialogDescription>{displayDescription}</DialogDescription> */}
        </DialogHeader>

        <div className="space-y-4">
          {/* Agreement Text Viewer */}
          <div className="space-y-2">
            <div>
              <p className="font-medium text-sm">View Agreement</p>
              <p className="text-xs text-gray-600 mt-1">
                Please review the agreement document before accepting
              </p>
            </div>
            {agreementText && (
              <div className="border rounded-lg bg-white p-6 max-h-[600px] overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {agreementText.body.split("\n").map((line, idx) => {
                    if (line.startsWith("# ")) {
                      return (
                        <h1 key={idx} className="text-xl font-bold mt-4 mb-2">
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
                        <h3 key={idx} className="text-md font-medium mt-2 mb-1">
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
          </div>

          {/* Signature Fields */}
          {agreementText && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Signature Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signatoryName">
                    Authorized Signatory Name{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signatoryName"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signatoryTitle">
                    Role/Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="signatoryTitle"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    placeholder="e.g., CEO, Owner, Manager"
                    required
                  />
                </div>

                {agreementText.signatureFields.onBehalfOf && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="onBehalfOf">
                      On behalf of (CEO/Owner Name){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="onBehalfOf"
                      value={onBehalfOf}
                      onChange={(e) => setOnBehalfOf(e.target.value)}
                      placeholder="Name of CEO/Owner"
                      required
                    />
                  </div>
                )}

                {/* Supplier Self-Declaration: Section 1 - Supplier Information */}
                {agreementText.signatureFields.companyName && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <h4 className="font-medium text-sm mt-4 mb-2">
                        Section 1: Supplier Information
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        Company/Organization Name{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company or organization name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">
                        Business Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="businessAddress"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Full business address"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPersonTitle">
                        Contact Person & Title{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactPersonTitle"
                        value={contactPersonTitle}
                        onChange={(e) => setContactPersonTitle(e.target.value)}
                        placeholder="Name and title of contact person"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailPhone">
                        Email & Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emailPhone"
                        value={emailPhone}
                        onChange={(e) => setEmailPhone(e.target.value)}
                        placeholder="Email address and phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="natureOfBusiness">
                        Nature of Business/Industry{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="natureOfBusiness"
                        value={natureOfBusiness}
                        onChange={(e) => setNatureOfBusiness(e.target.value)}
                        placeholder="Describe the nature of your business or industry"
                        rows={2}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Supplier Self-Declaration Questions */}
              {agreementText.signatureFields.q1_armsIndustry && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-sm">
                    Verification Questions
                  </h4>

                  <div className="space-y-2">
                    <Label>
                      Do you or your affiliates produce or sell arms, weapons,
                      or related technologies?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={q1_armsIndustry}
                      onValueChange={setQ1_armsIndustry}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="q1_no" />
                        <Label htmlFor="q1_no" className="cursor-pointer">
                          No
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="q1_yes" />
                        <Label htmlFor="q1_yes" className="cursor-pointer">
                          Yes
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Do you conduct business with organizations or governments
                      sanctioned for war or human rights abuses?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={q2_sanctionedPartners}
                      onValueChange={setQ2_sanctionedPartners}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="q2_no" />
                        <Label htmlFor="q2_no" className="cursor-pointer">
                          No
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="q2_yes" />
                        <Label htmlFor="q2_yes" className="cursor-pointer">
                          Yes
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Do you have a supplier/vendor code of conduct or
                      equivalent policy in place to ensure ethical sourcing?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={q3_hasSupplierCode}
                      onValueChange={setQ3_hasSupplierCode}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="q3_no" />
                        <Label htmlFor="q3_no" className="cursor-pointer">
                          No
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="q3_yes" />
                        <Label htmlFor="q3_yes" className="cursor-pointer">
                          Yes
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {agreementText.signatureFields.policyNotes && (
                    <div className="space-y-2">
                      <Label htmlFor="policyNotes">
                        If Yes, please provide a brief explanation or attach
                        policy details:
                      </Label>
                      <Textarea
                        id="policyNotes"
                        value={policyNotes}
                        onChange={(e) => setPolicyNotes(e.target.value)}
                        placeholder="Optional: Provide details about your supplier code of conduct..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            disabled={!isFormValid || isAccepting || !agreementText}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? "Accepting..." : "Accept Agreement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
