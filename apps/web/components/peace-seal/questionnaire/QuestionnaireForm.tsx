"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useQuestionnaire } from "@/hooks/use-questionnaire";
import FormField from "./FormField";

interface QuestionnaireFormProps {
  companyId: string;
  initialData?: any;
  onComplete?: (data: any) => void;
  isCompleted?: boolean;
  employeeCount?: number;
}

// Section Navigation Sidebar
const SectionNavigation = ({
  currentSectionId,
  progress,
  onSectionChange,
  disabled = false,
  validationErrors = {},
  questionnaireSections = [],
}: {
  currentSectionId: string;
  progress: any;
  onSectionChange: (sectionId: string) => void;
  disabled?: boolean;
  validationErrors?: Record<string, string[]>;
  questionnaireSections?: any[];
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg mb-0">Sections</h3>
      {questionnaireSections.map((section, index) => {
        const sectionProgress = progress.sectionsProgress.find(
          (sp: any) => sp.sectionId === section.id
        );
        const isActive = currentSectionId === section.id;
        const isCompleted = sectionProgress?.isComplete;
        const hasErrors =
          validationErrors[section.id] &&
          validationErrors[section.id].length > 0;

        return (
          <button
            key={section.id}
            onClick={() => !disabled && onSectionChange(section.id)}
            disabled={disabled}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              hasErrors
                ? "border-red-500 bg-red-50"
                : isActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    hasErrors
                      ? "bg-red-100 text-red-700"
                      : isCompleted
                        ? "bg-green-100 text-green-700"
                        : isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {hasErrors ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{section.title}</p>
                  {section.isOptional && (
                    <Badge variant="secondary" className="text-xs">
                      Optional
                    </Badge>
                  )}
                  {hasErrors && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      {validationErrors[section.id].length} error(s)
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {sectionProgress?.completedFields || 0}/
                  {sectionProgress?.totalFields || 0}
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      hasErrors ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${sectionProgress?.percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Progress Header
const ProgressHeader = ({
  progress,
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  onSave,
}: {
  progress: any;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Overall Progress</h2>
            <p className="text-sm text-gray-600">
              {progress.completedSections} of {progress.totalSections} sections
              completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {progress.overallPercentage}%
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {isSaving ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600">Unsaved changes</span>
                  <Button size="sm" variant="outline" onClick={onSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <Progress value={progress.overallPercentage} className="h-3" />
      </CardContent>
    </Card>
  );
};

// Main Questionnaire Form Component
export default function QuestionnaireForm({
  companyId = "",
  initialData = {},
  onComplete = () => {},
  isCompleted = false,
  employeeCount = 0,
}: QuestionnaireFormProps) {
  const {
    questionnaire,
    currentSection,
    currentSectionId,
    progress,
    currentSectionProgress,
    questionnaireSections,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    updateField,
    uploadFile,
    deleteFile,
    acceptAgreement,
    deleteAgreement,
    saveProgress,
    goToSection,
    goToNextSection,
    goToPreviousSection,
  } = useQuestionnaire(companyId, initialData, employeeCount);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalValidationErrors, setGlobalValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Validate a specific field
  const validateField = useCallback((field: any, sectionData: any) => {
    const value = sectionData?.[field.id];

    if (!field.required) return true;

    // Handle multi-input fields (composite values)
    if (field.inputModes && field.inputModes.length > 0) {
      // Check if value is a composite value
      if (
        value &&
        typeof value === "object" &&
        ("text" in value ||
          "url" in value ||
          "file" in value ||
          "agreement" in value)
      ) {
        const composite = value as any;
        const completionMode = field.completionMode || "any";

        if (completionMode === "all") {
          // All modes must have values
          return field.inputModes.every((mode: any) => {
            if (mode.kind === "text" || mode.kind === "textarea")
              return !!composite.text;
            if (mode.kind === "url") return !!composite.url;
            if (mode.kind === "file")
              return !!(composite.file || composite.agreement);
            return false;
          });
        } else {
          // Any mode can have a value (default)
          return field.inputModes.some((mode: any) => {
            if (mode.kind === "text" || mode.kind === "textarea") {
              return (
                composite.text &&
                typeof composite.text === "string" &&
                composite.text.trim().length > 0
              );
            }
            if (mode.kind === "url") {
              return (
                composite.url &&
                typeof composite.url === "string" &&
                composite.url.trim().length > 0
              );
            }
            if (mode.kind === "file") {
              return !!(composite.file || composite.agreement);
            }
            return false;
          });
        }
      }
      // Legacy: if it's a string or file, check normally
      if (typeof value === "string") return value.trim().length > 0;
      if (
        value &&
        typeof value === "object" &&
        ("fileName" in value || "templateId" in value)
      )
        return true;
      return false;
    }

    // Handle single-input fields
    switch (field.type) {
      case "boolean":
        return value !== undefined && value !== null;
      case "array":
        return Array.isArray(value) && value.length > 0;
      case "file":
        return !!value;
      case "number":
        return typeof value === "number" && value > 0;
      default:
        return value && (typeof value !== "string" || value.trim().length > 0);
    }
  }, []);

  // Validate current section
  const validateCurrentSection = useCallback(() => {
    if (!currentSection) return true;

    const errors: Record<string, string> = {};
    let isValid = true;

    currentSection.fields.forEach((field) => {
      if (field.required) {
        const sectionData = (questionnaire as any)[currentSection.id];
        const fieldIsValid = validateField(field, sectionData);

        if (!fieldIsValid) {
          errors[field.id] = `${field.label} is required`;
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    return isValid;
  }, [currentSection, questionnaire, validateField]);

  // Validate entire questionnaire (all required fields)
  const validateEntireQuestionnaire = useCallback(() => {
    const allErrors: Record<string, string[]> = {};
    let isValid = true;

    questionnaireSections.forEach((section) => {
      if (section.isOptional) return; // Skip optional sections

      const sectionErrors: string[] = [];
      const sectionData = (questionnaire as any)[section.id];

      section.fields.forEach((field) => {
        if (field.required) {
          const fieldIsValid = validateField(field, sectionData);

          if (!fieldIsValid) {
            sectionErrors.push(`${field.label} is required`);
            isValid = false;
          }
        }
      });

      if (sectionErrors.length > 0) {
        allErrors[section.id] = sectionErrors;
      }
    });

    return { isValid, errors: allErrors };
  }, [questionnaire, validateField, questionnaireSections]);

  // Handle section navigation with validation
  const handleSectionChange = useCallback(
    async (sectionId: string) => {
      // Save current progress before switching
      await saveProgress();
      goToSection(sectionId);
      setFieldErrors({});
      // Clear global validation errors when navigating
      setGlobalValidationErrors({});
    },
    [saveProgress, goToSection]
  );

  const handleNextSection = useCallback(async () => {
    if (!validateCurrentSection()) {
      return;
    }

    await saveProgress();
    goToNextSection();
    setFieldErrors({});
    setGlobalValidationErrors({});
  }, [validateCurrentSection, saveProgress, goToNextSection]);

  const handlePreviousSection = useCallback(() => {
    goToPreviousSection();
    setFieldErrors({});
    setGlobalValidationErrors({});
  }, [goToPreviousSection]);

  const handleComplete = useCallback(async () => {
    // First validate current section
    if (!validateCurrentSection()) {
      alert(
        "Please complete all required fields in this section before submitting."
      );
      return;
    }

    // Then validate entire questionnaire
    const fullValidation = validateEntireQuestionnaire();
    if (!fullValidation.isValid) {
      // Store global validation errors for UI feedback
      setGlobalValidationErrors(fullValidation.errors);

      const errorSections = Object.keys(fullValidation.errors);
      const errorMessages = errorSections
        .map((sectionId) => {
          const section = questionnaireSections.find((s) => s.id === sectionId);
          const errors = fullValidation.errors[sectionId];
          return `${section?.title}: ${errors.join(", ")}`;
        })
        .join("\n\n");

      alert(
        // `No se puede enviar la aplicación. Faltan campos requeridos:\n\n${errorMessages}\n\nPor favor completa todos los campos requeridos antes de enviar.`
        `You cannot submit the application. Required fields are missing:\n\n${errorMessages}\n\nPlease complete all required fields before submitting.`
      );

      // Navigate to first section with errors
      const firstErrorSection = errorSections[0];
      if (firstErrorSection) {
        goToSection(firstErrorSection);
      }
      return;
    }

    // Clear any previous global validation errors
    setGlobalValidationErrors({});

    // All validations passed, proceed with submission
    const success = await saveProgress(true, 100);
    if (success && onComplete) {
      onComplete(questionnaire as any);
    }
  }, [
    validateCurrentSection,
    validateEntireQuestionnaire,
    saveProgress,
    questionnaire,
    onComplete,
    goToSection,
    questionnaireSections,
  ]);

  // Check if we're on the last section
  const isLastSection =
    questionnaireSections[questionnaireSections.length - 1].id ===
    currentSectionId;
  const currentSectionIndex = questionnaireSections.findIndex(
    (s) => s.id === currentSectionId
  );

  // Check if questionnaire can be submitted (all required fields completed)
  const canSubmit = useMemo(() => {
    const validation = validateEntireQuestionnaire();
    return validation.isValid;
  }, [validateEntireQuestionnaire]);

  if (!currentSection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-full">
      <ProgressHeader
        progress={progress}
        isSaving={isSaving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => saveProgress()}
      />

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar Navigation */}
        <div className="w-1/3">
          <div className="sticky top-6 w-full">
            <SectionNavigation
              currentSectionId={currentSectionId}
              progress={progress}
              onSectionChange={handleSectionChange}
              disabled={isSaving}
              validationErrors={globalValidationErrors}
              questionnaireSections={questionnaireSections}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {currentSection.title}
                    {currentSection.isOptional && (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {currentSection.description}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  Section {currentSectionIndex + 1} of{" "}
                  {questionnaireSections.length}
                  {currentSection.weight > 0 && (
                    <div className="text-blue-600 font-medium">
                      {currentSection.weight}% of score
                    </div>
                  )}
                </div>
              </div>

              {/* Section Progress */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Progress
                    value={currentSectionProgress?.percentage || 0}
                    className="h-2"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {currentSectionProgress?.completedFields || 0} /{" "}
                  {currentSectionProgress?.totalFields || 0} fields
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Section Fields */}
              {currentSection.fields.map((field) => {
                const sectionData =
                  (questionnaire as any)[currentSection.id] || {};
                const value = sectionData[field.id];

                return (
                  <FormField
                    key={field.id}
                    field={field}
                    value={value}
                    onChange={(newValue) =>
                      updateField(currentSection.id, field.id, newValue)
                    }
                    onFileUpload={uploadFile}
                    onFileDelete={deleteFile}
                    onAgreementAccept={acceptAgreement}
                    onAgreementDelete={deleteAgreement}
                    sectionId={currentSection.id}
                    error={fieldErrors[field.id]}
                    disabled={isSaving || isCompleted}
                    companyId={companyId}
                  />
                );
              })}

              <Separator className="my-8" />

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousSection}
                  disabled={currentSectionIndex === 0 || isSaving}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => saveProgress()}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Progress"}
                  </Button>

                  {isLastSection ? (
                    <div className="space-y-3">
                      {/* {!canSubmit && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-yellow-800 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">
                              Completa todos los campos requeridos para enviar
                              la aplicación
                            </span>
                          </div>
                        </div>
                      )} */}
                      <Button
                        onClick={handleComplete}
                        disabled={isSaving || !canSubmit || isCompleted}
                        className={`${
                          canSubmit
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {isSaving
                          ? "Submitting..."
                          : canSubmit
                            ? "Submit Application for Review"
                            : "Complete Required Fields"}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleNextSection} disabled={isSaving}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
