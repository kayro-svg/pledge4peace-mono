import { useState, useCallback, useEffect, useMemo } from "react";
import {
  PeaceSealQuestionnaire,
  QuestionnaireProgress,
  SectionProgress,
  FileUpload,
  UploadResponse,
} from "@/types/questionnaire";
import {
  getQuestionnaireSections,
  DOCUMENT_TYPE_MAPPING,
} from "@/config/questionnaire-configs";
import { saveQuestionnaire } from "@/lib/api/peace-seal";
// import { apiClient } from "@/lib/api-client"; // Not used in this file

// Initialize empty questionnaire
function initializeQuestionnaire(): PeaceSealQuestionnaire {
  return {
    companyInformation: {
      organizationName: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      countryOfRegistration: "",
      countryOfOperations: [],
      employeeCount: 0,
      annualRevenueRange: "",
    },
    ethicalPracticesGovernance: {
      ownershipGovernanceStructure: "",
      hasEthicsCode: false,
      supplierTreatmentDescription: "",
      engagesInLobbying: false,
    },
    peaceAlignedFinancialPractices: {
      hasDefenseInvestments: false,
      publishesESGDisclosures: false,
    },
    supplyChainEthics: {
      hasSupplierCodeOfConduct: false,
      vendorDueDiligenceProcess: "",
      conflictResourcesPolicy: "",
    },
    internalPeaceInclusionPolicies: {
      deiPoliciesDescription: "",
      conflictResolutionPrograms: "",
      mentalHealthPrograms: "",
      vulnerablePopulationsHiring: false,
    },
    advocacyPublicPositioning: {
      peaceStatements: [],
      peaceStatementsLinks: [],
      peacePlatformExamples: "",
      socialMediaLinks: [],
    },
    conflictFreeOperations: {
      operationCountries: [],
      conflictZonePolicy: "",
      activeConflictZoneOperations: false,
    },
    humanitarianContribution: {
      peacebuildingDonations: "",
      csrInitiativesDescription: "",
      employeeVolunteerPrograms: "",
      impactMeasurement: "",
    },
    transparencyReporting: {
      grievanceSystem: "",
      publicComplaintsProcess: "",
      transparencyCommitment: "",
    },
    employeeRightsWorkplaceCulture: {
      wageStandardsBenefits: "",
      whistleblowerProtections: "",
      workplaceCultureDescription: "",
    },
    socialImpactCommunityEngagement: {
      communityPartnerships: "",
      volunteerPrograms: "",
      conflictSensitivePractices: "",
      highRiskRegionOperations: "",
      communityFeedbackMechanisms: "",
    },
    environmentalResponsibility: {
      renewableEnergyUsage: "",
      environmentalPolicies: "",
      climateCommitments: "",
    },
    globalPeaceCommitmentConflictAvoidance: {
      oppressiveRegimePolicy: false,
      conflictResolutionAdvocacy: "",
      peaceTalksSupport: "",
      conflictPreventionMeasures: "",
    },
    publicFeedbackExternalReporting: {
      publicComplaintsResponse: "",
      crisisManagement: "",
      reputationManagement: "",
      newsMentions: [],
    },
    environmentalPeacebuilding: {
      sustainabilityPeaceLink: false,
    },
  };
}

export function useQuestionnaire(
  companyId: string,
  initialData?: Partial<PeaceSealQuestionnaire>,
  employeeCount?: number
) {
  const [questionnaire, setQuestionnaire] = useState<PeaceSealQuestionnaire>(
    () => ({
      ...initializeQuestionnaire(),
      ...initialData,
    })
  );

  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [currentSectionId, setCurrentSectionId] =
    useState<string>("companyInformation");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get questionnaire sections based on company size
  const questionnaireSections = useMemo(() => {
    return getQuestionnaireSections(employeeCount || 0);
  }, [employeeCount]);

  // Calculate progress
  const progress = useMemo((): QuestionnaireProgress => {
    const sectionsProgress: SectionProgress[] = questionnaireSections.map(
      (section) => {
        let completedFields = 0;
        let totalFields = 0;

        section.fields.forEach((field) => {
          if (field.required || !section.isOptional) {
            totalFields++;

            const sectionData = (questionnaire as any)[section.id];
            const fieldValue = sectionData?.[field.id];

            // Check if field is completed based on type
            let isCompleted = false;
            switch (field.type) {
              case "boolean":
                isCompleted = typeof fieldValue === "boolean";
                break;
              case "array":
                isCompleted =
                  Array.isArray(fieldValue) && fieldValue.length > 0;
                break;
              case "file":
                isCompleted = !!fieldValue; // FileUpload object exists
                break;
              case "number":
                isCompleted = typeof fieldValue === "number" && fieldValue > 0;
                break;
              default:
                isCompleted =
                  typeof fieldValue === "string" &&
                  fieldValue.trim().length > 0;
            }

            if (isCompleted) completedFields++;
          }
        });

        const percentage =
          totalFields > 0
            ? Math.round((completedFields / totalFields) * 100)
            : 0;

        return {
          sectionId: section.id,
          completedFields,
          totalFields,
          isComplete: completedFields === totalFields,
          percentage,
        };
      }
    );

    const totalCompleted = sectionsProgress.reduce(
      (sum, sp) => sum + sp.completedFields,
      0
    );
    const totalFields = sectionsProgress.reduce(
      (sum, sp) => sum + sp.totalFields,
      0
    );
    const overallPercentage =
      totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;
    const completedSections = sectionsProgress.filter(
      (sp) => sp.isComplete
    ).length;

    return {
      overallPercentage,
      sectionsProgress,
      completedSections,
      totalSections: questionnaireSections.filter((s) => !s.isOptional).length,
    };
  }, [questionnaire, questionnaireSections]);

  // Update field value
  const updateField = useCallback(
    (sectionId: string, fieldId: string, value: unknown) => {
      setQuestionnaire((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId as keyof PeaceSealQuestionnaire],
          [fieldId]: value,
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // Upload file directly to backend
  const uploadFile = useCallback(
    async (
      file: File,
      sectionId: string,
      fieldId: string
    ): Promise<UploadResponse> => {
      try {
        const documentType = DOCUMENT_TYPE_MAPPING[fieldId] || "other";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("companyId", companyId);
        formData.append("documentType", documentType);
        formData.append("sectionId", sectionId);
        formData.append("fieldId", fieldId);

        // Use fetch directly for FormData uploads (apiClient forces JSON headers)
        const { getSession } = await import("next-auth/react");
        const session = await getSession();

        if (!session?.accessToken) {
          throw new Error("No authentication token available");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api"}/peace-seal/applications/${companyId}/documents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              // Don't set Content-Type for FormData - let browser handle it
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
          throw new Error(
            `Upload failed: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        // Update questionnaire with file info
        const fileUpload: FileUpload = {
          id: result.documentId,
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          uploadedAt: new Date().toISOString(),
          documentType: result.documentType,
        };

        updateField(sectionId, fieldId, fileUpload);

        return {
          success: true,
          fileId: result.documentId,
          fileUrl: result.fileUrl,
          fileName: result.fileName,
        };
      } catch (error) {
        console.error("File upload error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    [companyId, updateField]
  );

  // Delete file directly from backend
  const deleteFile = useCallback(
    async (sectionId: string, fieldId: string, fileId: string) => {
      try {
        // Use fetch directly for consistency with upload
        const { getSession } = await import("next-auth/react");
        const session = await getSession();

        if (!session?.accessToken) {
          throw new Error("No authentication token available");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api"}/documents/${fileId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Delete failed");
        }

        // Remove file from questionnaire
        updateField(sectionId, fieldId, null);

        return true;
      } catch (error) {
        console.error("File delete error:", error);
        return false;
      }
    },
    [companyId, updateField]
  );

  // Save questionnaire
  const saveProgress = useCallback(
    async (force = false, forceProgress?: number) => {
      if (!hasUnsavedChanges && !force) return true;

      setIsSaving(true);
      try {
        const progressToSend =
          forceProgress !== undefined
            ? forceProgress
            : progress.overallPercentage;
        await saveQuestionnaire(companyId, {
          responses: questionnaire as unknown as Record<string, unknown>,
          progress: progressToSend,
        });

        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        return true;
      } catch (error) {
        console.error("Save error:", error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [questionnaire, progress.overallPercentage, hasUnsavedChanges]
  );

  // Load existing documents on mount
  useEffect(() => {
    const loadExistingDocuments = async () => {
      setLoadingDocuments(true);
      try {
        // Use fetch directly for consistency
        const { getSession } = await import("next-auth/react");
        const session = await getSession();

        if (!session?.accessToken) {
          console.warn(
            "No authentication token available for loading documents"
          );
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787/api"}/documents/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (response.ok) {
          const { documents } = await response.json();

          // Map documents to questionnaire fields
          const updatedQuestionnaire = { ...questionnaire };

          documents.forEach((doc: Record<string, unknown>) => {
            if (doc.sectionId && doc.fieldId) {
              const sectionData = updatedQuestionnaire[
                doc.sectionId as keyof PeaceSealQuestionnaire
              ] as unknown as Record<string, unknown>;
              if (sectionData) {
                sectionData[doc.fieldId as string] = {
                  id: doc.id,
                  fileName: doc.fileName,
                  fileUrl: doc.fileUrl,
                  fileSize: doc.fileSize,
                  uploadedAt: doc.createdAt,
                  documentType: doc.documentType,
                };
              }
            }
          });

          setQuestionnaire(updatedQuestionnaire);
        }
      } catch (error) {
        console.error("Error loading existing documents:", error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadExistingDocuments();
  }, [companyId, questionnaire]); // Include questionnaire for proper updates

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, saveProgress]);

  // Navigate between sections
  const goToSection = useCallback((sectionId: string) => {
    setCurrentSectionId(sectionId);
  }, []);

  const goToNextSection = useCallback(() => {
    const currentIndex = questionnaireSections.findIndex(
      (s) => s.id === currentSectionId
    );
    if (currentIndex < questionnaireSections.length - 1) {
      setCurrentSectionId(questionnaireSections[currentIndex + 1].id);
    }
  }, [currentSectionId, questionnaireSections]);

  const goToPreviousSection = useCallback(() => {
    const currentIndex = questionnaireSections.findIndex(
      (s) => s.id === currentSectionId
    );
    if (currentIndex > 0) {
      setCurrentSectionId(questionnaireSections[currentIndex - 1].id);
    }
  }, [currentSectionId, questionnaireSections]);

  // Get current section info
  const currentSection = useMemo(() => {
    return questionnaireSections.find((s) => s.id === currentSectionId);
  }, [currentSectionId, questionnaireSections]);

  const currentSectionProgress = useMemo(() => {
    return progress.sectionsProgress.find(
      (sp) => sp.sectionId === currentSectionId
    );
  }, [progress.sectionsProgress, currentSectionId]);

  return {
    // Data
    questionnaire,
    currentSection,
    currentSectionId,
    progress,
    currentSectionProgress,
    questionnaireSections,

    // Status
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    loadingDocuments,

    // Actions
    updateField,
    uploadFile,
    deleteFile,
    saveProgress,

    // Navigation
    goToSection,
    goToNextSection,
    goToPreviousSection,

    // Utilities
    setQuestionnaire,
  };
}
