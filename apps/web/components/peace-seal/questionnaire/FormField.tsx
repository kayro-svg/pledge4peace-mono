"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  X,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  QuestionnaireField,
  FileUpload,
  UploadResponse,
  AgreementAcceptance,
  TemplateResource,
  CompositeValue,
} from "@/types/questionnaire";
import AgreementModal from "./AgreementModal";
import BeneficialOwnershipModal from "./BeneficialOwnershipModal";
import EmployeeSurveyModal from "./EmployeeSurveyModal";
import { useEffect } from "react";
import { getTemplates } from "@/lib/api/peace-seal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocale } from "next-intl";
import { hasLearnMoreTopic } from "@/config/learn-more-content";

interface FormFieldProps {
  field: QuestionnaireField;
  value: unknown;
  onChange: (value: unknown) => void;
  onFileUpload?: (
    file: File,
    sectionId: string,
    fieldId: string
  ) => Promise<UploadResponse>;
  onFileDelete?: (
    sectionId: string,
    fieldId: string,
    fileId: string
  ) => Promise<boolean>;
  onAgreementAccept?: (
    sectionId: string,
    fieldId: string,
    templateId: string,
    acceptanceData?: Record<string, any>
  ) => Promise<void>;
  onAgreementDelete?: (
    sectionId: string,
    fieldId: string,
    acceptanceId: string
  ) => Promise<boolean>;
  sectionId: string;
  error?: string;
  disabled?: boolean;
  companyId?: string;
  companyName?: string;
  questionnaire?: any; // Full questionnaire object to access company info
}

// Hook to generate Learn More URL
function useLearnMoreUrl(field: QuestionnaireField): string | null {
  const locale = useLocale();
  const topicId = field.learnMoreTopicId ?? field.id;

  // Only generate URL if topic exists in our content
  if (hasLearnMoreTopic(topicId)) {
    // Build URL path with hash to scroll to specific accordion
    // For target="_blank", we need full URL, so construct it manually
    const path = `/dashboard/company-peace-seal`;
    const query = `tab=center&topic=${encodeURIComponent(topicId)}`;
    const hash = `#topic-${topicId}`;

    // With localePrefix: "as-needed", "en" doesn't need prefix, "es" does
    if (locale === "en") {
      return `${path}?${query}${hash}`;
    } else {
      return `/${locale}${path}?${query}${hash}`;
    }
  }

  // Fallback to external tooltipLink if provided
  return field.tooltipLink || null;
}

// Reusable Label with Learn More link component
function FieldLabelWithLearnMore({ field }: { field: QuestionnaireField }) {
  const learnMoreUrl = useLearnMoreUrl(field);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={field.id} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      {field.tooltipText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-600">{field.tooltipText}</p>
              {learnMoreUrl && (
                <a
                  href={learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-2"
                >
                  Learn more
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// File Upload Component
const FileUploadField = ({
  field,
  value,
  onChange,
  onFileUpload,
  onFileDelete,
  onAgreementAccept,
  onAgreementDelete,
  sectionId,
  error,
  disabled,
  companyId,
}: FormFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showBeneficialModal, setShowBeneficialModal] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [template, setTemplate] = useState<TemplateResource | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !onFileUpload) return;

      // Validate file size
      if (field.maxFileSize && file.size > field.maxFileSize) {
        setUploadError(
          `File size exceeds ${(field.maxFileSize / (1024 * 1024)).toFixed(1)}MB limit`
        );
        return;
      }

      // Validate file type
      if (field.fileTypes && field.fileTypes.length > 0) {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!field.fileTypes.includes(extension)) {
          setUploadError(
            `File type not allowed. Allowed types: ${field.fileTypes.join(", ")}`
          );
          return;
        }
      }

      setUploading(true);
      setUploadError(null);

      try {
        const result = await onFileUpload(file, sectionId, field.id);

        if (
          result.success &&
          result.fileId &&
          result.fileUrl &&
          result.fileName
        ) {
          const fileUpload: FileUpload = {
            id: result.fileId,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            documentType: field.id,
          };
          onChange(fileUpload);
        } else {
          setUploadError(result.error || "Upload failed");
        }
      } catch (error) {
        setUploadError("Upload failed");
      } finally {
        setUploading(false);
      }

      // Reset input
      event.target.value = "";
    },
    [field, onChange, onFileUpload, sectionId]
  );

  const handleFileDelete = useCallback(async () => {
    const fileValue = value as FileUpload | null;
    if (!fileValue || !onFileDelete) return;

    const success = await onFileDelete(sectionId, field.id, fileValue.id);
    if (success) {
      onChange(null);
    }
  }, [value, onFileDelete, sectionId, field.id, onChange]);

  const handleAgreementAccept = useCallback(
    async (acceptanceData?: Record<string, any>) => {
      if (!onAgreementAccept || !field.templateId) return;

      setAcceptingAgreement(true);
      try {
        await onAgreementAccept(
          sectionId,
          field.id,
          field.templateId,
          acceptanceData
        );
        setShowAgreementModal(false);
        setShowBeneficialModal(false);
      } catch (error) {
        console.error("Error accepting agreement:", error);
      } finally {
        setAcceptingAgreement(false);
      }
    },
    [onAgreementAccept, sectionId, field.id, field.templateId]
  );

  const handleBeneficialOwnershipAccept = useCallback(
    async (data: { numberOfOwners: number; owners: any[] }) => {
      if (!onAgreementAccept || !field.templateId) return;

      setAcceptingAgreement(true);
      try {
        await onAgreementAccept(sectionId, field.id, field.templateId, data);
        setShowBeneficialModal(false);
      } catch (error) {
        console.error("Error accepting beneficial ownership agreement:", error);
      } finally {
        setAcceptingAgreement(false);
      }
    },
    [onAgreementAccept, sectionId, field.id, field.templateId]
  );

  // Load template when modal opens
  useEffect(() => {
    const loadTemplate = async () => {
      if (!field.templateId || (!showAgreementModal && !showBeneficialModal)) {
        return;
      }

      setLoadingTemplate(true);
      try {
        const { templates } = await getTemplates({ resourceType: "template" });
        const foundTemplate = templates.find((t) => t.id === field.templateId);
        if (foundTemplate) {
          setTemplate(foundTemplate);
        }
      } catch (error) {
        console.error("Error loading template:", error);
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, [field.templateId, showAgreementModal, showBeneficialModal]);

  // Check if value is a file upload or agreement acceptance using discriminant checks
  const isFile =
    value && typeof value === "object" && "fileName" in (value as any);
  const isAgreement =
    value && typeof value === "object" && "templateId" in (value as any);
  const currentFile = isFile ? (value as FileUpload) : null;
  const currentAgreement = isAgreement ? (value as AgreementAcceptance) : null;
  const hasValue = currentFile || currentAgreement;

  const handleAgreementRemove = useCallback(async () => {
    if (currentAgreement && onAgreementDelete) {
      const success = await onAgreementDelete(
        sectionId,
        field.id,
        currentAgreement.id
      );
      if (success) {
        onChange(null);
      }
    } else {
      onChange(null);
    }
  }, [currentAgreement, onAgreementDelete, sectionId, field.id, onChange]);

  return (
    <div className="space-y-2">
      <FieldLabelWithLearnMore field={field} />

      {field.helpText && (
        <p className="text-sm text-gray-600">{field.helpText}</p>
      )}

      {!hasValue ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center space-y-3">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor={`${field.id}-upload`} className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </span>
                <Input
                  id={`${field.id}-upload`}
                  type="file"
                  accept={field.fileTypes?.join(",")}
                  onChange={handleFileSelect}
                  disabled={uploading || disabled}
                  className="sr-only"
                />
              </Label>

              {field.hasTemplate && field.templateId && (
                <>
                  <span className="text-sm text-gray-500">or</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (field.templateType === "beneficial-ownership") {
                        setShowBeneficialModal(true);
                      } else {
                        setShowAgreementModal(true);
                      }
                    }}
                    disabled={disabled}
                    className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Use Our Template
                  </Button>
                </>
              )}
            </div>
            {field.fileTypes && (
              <p className="text-xs text-gray-500 mt-1">
                Allowed: {field.fileTypes.join(", ")}
              </p>
            )}
            {field.maxFileSize && (
              <p className="text-xs text-gray-500">
                Max size: {(field.maxFileSize / (1024 * 1024)).toFixed(1)}MB
              </p>
            )}
          </div>
        </div>
      ) : currentFile ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{currentFile.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {(currentFile.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFileDelete}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : currentAgreement ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Agreement Accepted</p>
                  <p className="text-xs text-gray-500">
                    Accepted on{" "}
                    {new Date(currentAgreement.acceptedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAgreementRemove}
                disabled={disabled}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {(uploadError || error) && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Modals */}
      {field.hasTemplate && field.templateId && (
        <>
          {field.templateType === "beneficial-ownership" ? (
            <BeneficialOwnershipModal
              open={showBeneficialModal}
              onOpenChange={setShowBeneficialModal}
              template={template}
              templateId={field.templateId}
              onAccept={handleBeneficialOwnershipAccept}
              isAccepting={acceptingAgreement || loadingTemplate}
            />
          ) : (
            <AgreementModal
              open={showAgreementModal}
              onOpenChange={setShowAgreementModal}
              template={template}
              templateId={field.templateId}
              onAccept={(acceptanceData) =>
                handleAgreementAccept(acceptanceData)
              }
              isAccepting={acceptingAgreement || loadingTemplate}
            />
          )}
        </>
      )}
    </div>
  );
};

// Array Field Component (for multiple values)
const ArrayField = ({
  field,
  value,
  onChange,
  error,
  disabled,
}: FormFieldProps) => {
  const arrayValue = (value as string[]) || [];
  const [inputValue, setInputValue] = useState("");

  const addItem = useCallback(() => {
    if (inputValue.trim()) {
      onChange([...arrayValue, inputValue.trim()]);
      setInputValue("");
    }
  }, [inputValue, arrayValue, onChange]);

  const removeItem = useCallback(
    (index: number) => {
      onChange(arrayValue.filter((_, i) => i !== index));
    },
    [arrayValue, onChange]
  );

  return (
    <div className="space-y-2">
      <FieldLabelWithLearnMore field={field} />

      {field.helpText && (
        <p className="text-sm text-gray-600">{field.helpText}</p>
      )}

      <div className="flex space-x-2">
        <Input
          id={field.id}
          type={field.type === "url" ? "url" : "text"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          disabled={disabled || !inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {arrayValue.length > 0 && (
        <div className="space-y-2">
          {arrayValue.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <span className="text-sm">{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Multi-Input Field Component
const MultiInputField = ({
  field,
  value,
  onChange,
  onFileUpload,
  onFileDelete,
  onAgreementAccept,
  onAgreementDelete,
  sectionId,
  error,
  disabled,
  companyId,
  companyName,
  questionnaire,
}: FormFieldProps) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  // Get company name from questionnaire if not provided
  const resolvedCompanyName =
    companyName ||
    (questionnaire?.companyInformation?.organizationName as string) ||
    "your company";

  // Normalize value to CompositeValue
  const compositeValue: CompositeValue = (() => {
    if (!value) return {};

    // If it's already a CompositeValue, return it
    if (
      typeof value === "object" &&
      ("text" in value ||
        "url" in value ||
        "file" in value ||
        "agreement" in value ||
        "survey" in value)
    ) {
      return value as CompositeValue;
    }

    // If it's a string (legacy), convert to composite with text
    if (typeof value === "string") {
      return { text: value };
    }

    // If it's a FileUpload (legacy), convert to composite with file
    if (value && typeof value === "object" && "fileName" in value) {
      return { file: value as FileUpload };
    }

    // If it's an AgreementAcceptance (legacy), convert to composite with agreement
    if (value && typeof value === "object" && "templateId" in value) {
      return { agreement: value as AgreementAcceptance };
    }

    return {};
  })();

  // Initialize selected mode if not set
  useEffect(() => {
    if (!selectedMode && field.inputModes && field.inputModes.length > 0) {
      // Prefer first mode with existing value, otherwise first mode
      const modeWithValue = field.inputModes.find((mode) => {
        if (mode.kind === "text" || mode.kind === "textarea")
          return !!compositeValue.text;
        if (mode.kind === "url") return !!compositeValue.url;
        if (mode.kind === "file")
          return !!compositeValue.file || !!compositeValue.agreement;
        if (mode.kind === "survey") return !!compositeValue.survey;
        return false;
      });
      setSelectedMode(modeWithValue?.kind || field.inputModes[0].kind);
    }
  }, [field.inputModes, compositeValue, selectedMode]);

  const updateCompositeValue = useCallback(
    (updates: Partial<CompositeValue>) => {
      // When switching modes, clear the other mode's value
      const newValue = { ...compositeValue, ...updates };
      
      // If setting file/agreement, clear survey
      if (updates.file !== undefined || updates.agreement !== undefined) {
        newValue.survey = undefined;
      }
      
      // If setting survey, clear file/agreement
      if (updates.survey !== undefined) {
        newValue.file = undefined;
        newValue.agreement = undefined;
      }
      
      onChange(newValue);
    },
    [compositeValue, onChange]
  );

  const handleModeChange = useCallback((modeKind: string) => {
    setSelectedMode(modeKind);
  }, []);

  const currentMode = field.inputModes?.find((m) => m.kind === selectedMode);

  if (!field.inputModes || field.inputModes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <FieldLabelWithLearnMore field={field} />

      {field.helpText && (
        <p className="text-sm text-gray-600">{field.helpText}</p>
      )}

      {/* Mode selector */}
      <div className="flex gap-2 border rounded-lg p-1 bg-gray-50">
        {field.inputModes.map((mode) => {
          const hasValue =
            ((mode.kind === "text" || mode.kind === "textarea") &&
              !!compositeValue.text) ||
            (mode.kind === "url" && !!compositeValue.url) ||
            (mode.kind === "file" &&
              (!!compositeValue.file || !!compositeValue.agreement)) ||
            (mode.kind === "survey" && !!compositeValue.survey);

          return (
            <button
              key={mode.kind}
              type="button"
              onClick={() => handleModeChange(mode.kind)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedMode === mode.kind
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-center gap-2">
                {mode.label ||
                  mode.kind.charAt(0).toUpperCase() + mode.kind.slice(1)}
                {hasValue && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 italic">
        Choose one method; you can switch anytime.
      </p>

      {/* Render appropriate input based on selected mode */}
      {currentMode && (
        <div className="mt-2">
          {currentMode.kind === "text" || currentMode.kind === "textarea" ? (
            <div className="space-y-2">
              {currentMode.helpText && (
                <p className="text-sm text-gray-600">{currentMode.helpText}</p>
              )}
              <Textarea
                id={`${field.id}-${currentMode.kind}`}
                value={compositeValue.text || ""}
                onChange={(e) => updateCompositeValue({ text: e.target.value })}
                placeholder={currentMode.placeholder || field.placeholder}
                rows={4}
                disabled={disabled}
                className={error ? "border-red-500" : ""}
              />
            </div>
          ) : currentMode.kind === "url" ? (
            <div className="space-y-2">
              {currentMode.helpText && (
                <p className="text-sm text-gray-600">{currentMode.helpText}</p>
              )}
              <Input
                id={`${field.id}-${currentMode.kind}`}
                type="url"
                value={compositeValue.url || ""}
                onChange={(e) => updateCompositeValue({ url: e.target.value })}
                placeholder={currentMode.placeholder || field.placeholder}
                disabled={disabled}
                className={error ? "border-red-500" : ""}
              />
            </div>
          ) : currentMode.kind === "file" ? (
            <FileUploadField
              field={{
                ...field,
                type: "file",
                fileTypes: currentMode.fileTypes || field.fileTypes,
                maxFileSize: currentMode.maxFileSize || field.maxFileSize,
                hasTemplate: currentMode.hasTemplate || field.hasTemplate,
                templateId: currentMode.templateId || field.templateId,
                templateType: currentMode.templateType || field.templateType,
                helpText: currentMode.helpText || field.helpText,
              }}
              value={compositeValue.file || compositeValue.agreement || null}
              onChange={(newValue) => {
                if (newValue && typeof newValue === "object") {
                  if ("templateId" in newValue) {
                    updateCompositeValue({
                      agreement: newValue as AgreementAcceptance,
                      file: undefined,
                    });
                  } else if ("fileName" in newValue) {
                    updateCompositeValue({
                      file: newValue as FileUpload,
                      agreement: undefined,
                    });
                  }
                } else {
                  updateCompositeValue({
                    file: undefined,
                    agreement: undefined,
                  });
                }
              }}
              onFileUpload={onFileUpload}
              onFileDelete={onFileDelete}
              onAgreementAccept={onAgreementAccept}
              onAgreementDelete={onAgreementDelete}
              sectionId={sectionId}
              error={error}
              disabled={disabled}
              companyId={companyId}
            />
          ) : currentMode.kind === "survey" ? (
            <div className="space-y-3">
              {currentMode.helpText && (
                <p className="text-sm text-gray-600">{currentMode.helpText}</p>
              )}
              {compositeValue.survey ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <p className="font-medium text-sm">
                            Survey Invitations Sent
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Sent on{" "}
                          {new Date(
                            compositeValue.survey.invitedAt
                          ).toLocaleDateString()}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {compositeValue.survey.invitedCount} employee
                            {compositeValue.survey.invitedCount !== 1
                              ? "s"
                              : ""}{" "}
                            invited
                          </p>
                          <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                            {compositeValue.survey.invitations.map(
                              (invitation, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-gray-600 py-1"
                                >
                                  {invitation.name} ({invitation.email})
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      {!disabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateCompositeValue({ survey: undefined });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Button
                    type="button"
                    onClick={() => setShowSurveyModal(true)}
                    disabled={disabled || !companyId}
                    className="bg-[#548281] hover:bg-[#2F4858]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Send Survey Invitations
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Send email invitations to employees to complete the survey
                  </p>
                </div>
              )}
              {companyId && (
                <EmployeeSurveyModal
                  open={showSurveyModal}
                  onOpenChange={setShowSurveyModal}
                  companyId={companyId}
                  companyName={resolvedCompanyName}
                  onSuccess={(invitationData) => {
                    updateCompositeValue({
                      survey: invitationData,
                      file: undefined, // Clear file if survey is selected
                    });
                    setShowSurveyModal(false);
                  }}
                />
              )}
            </div>
          ) : null}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Main FormField Component
export default function FormField(props: FormFieldProps) {
  const { field, value, onChange, error, disabled } = props;

  // Check if this is a multi-input field
  if (field.inputModes && field.inputModes.length > 0) {
    return <MultiInputField {...props} />;
  }

  const commonProps = {
    id: field.id,
    disabled,
    "aria-describedby": error ? `${field.id}-error` : undefined,
  };

  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-2">
          <FieldLabelWithLearnMore field={field} />
          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}

          <Textarea
            {...commonProps}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={error ? "border-red-500" : ""}
          />

          {error && (
            <div
              id={`${field.id}-error`}
              className="flex items-center space-x-2 text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );

    case "boolean":
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Switch
              {...commonProps}
              checked={(value as boolean) || false}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.id} className="flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>

          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <FieldLabelWithLearnMore field={field} />

          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}

          <Select
            value={(value as string) || ""}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${field.label.toLowerCase()}`
                }
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );

    case "multiselect": {
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-2">
          <FieldLabelWithLearnMore field={field} />

          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option));
                    }
                  }}
                  disabled={disabled}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>

          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((selectedValue) => (
                <Badge key={selectedValue} variant="secondary">
                  {selectedValue}
                </Badge>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    case "file":
      return <FileUploadField {...props} />;

    case "array":
      return <ArrayField {...props} />;

    case "number":
      return (
        <div className="space-y-2">
          <FieldLabelWithLearnMore field={field} />

          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}

          <Input
            {...commonProps}
            type="number"
            value={(value as number) || ""}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
          />

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );

    default: // text, email, url
      return (
        <div className="space-y-2">
          <FieldLabelWithLearnMore field={field} />

          {field.helpText && (
            <p className="text-sm text-gray-600">{field.helpText}</p>
          )}

          <Input
            {...commonProps}
            type={field.type}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
          />

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
  }
}
