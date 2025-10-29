import {
  fieldToQuestionMap,
  fieldToSectionMap,
  QUESTIONNAIRE_SECTIONS,
} from "../config/questionnaire-config";

export interface ParsedQuestionnaireResponse {
  fieldId: string;
  question: string;
  answer: unknown;
  section: string;
  isEmpty: boolean;
}

export interface ParsedQuestionnaireSection {
  sectionTitle: string;
  responses: ParsedQuestionnaireResponse[];
}

/**
 * Parse questionnaire responses into structured format with questions and answers
 */
export function parseQuestionnaireResponses(
  responsesJson: string
): ParsedQuestionnaireSection[] {
  if (!responsesJson) {
    return [];
  }

  let responses: Record<string, unknown>;
  try {
    responses = JSON.parse(responsesJson);
  } catch (error) {
    console.error("Failed to parse questionnaire responses:", error);
    return [];
  }

  // Group responses by section
  const sectionGroups: Record<string, ParsedQuestionnaireResponse[]> = {};

  // Iterate over sections (top-level keys in responses)
  Object.entries(responses).forEach(([sectionId, sectionData]) => {
    // Skip if sectionData is not an object
    if (
      typeof sectionData !== "object" ||
      sectionData === null ||
      Array.isArray(sectionData)
    ) {
      return;
    }

    // Get section title from config by finding the section with matching ID
    const sectionConfig = QUESTIONNAIRE_SECTIONS.find(
      (s) => s.id === sectionId
    );
    const sectionTitle = sectionConfig?.title || formatFieldName(sectionId);

    // Initialize section group if it doesn't exist
    if (!sectionGroups[sectionTitle]) {
      sectionGroups[sectionTitle] = [];
    }

    // Iterate over fields within this section
    Object.entries(sectionData as Record<string, unknown>).forEach(
      ([fieldId, answer]) => {
        const question =
          fieldToQuestionMap[fieldId] || formatFieldName(fieldId);
        const isEmpty = isEmptyAnswer(answer);

        const parsedResponse: ParsedQuestionnaireResponse = {
          fieldId,
          question,
          answer: formatAnswer(answer),
          section: sectionTitle,
          isEmpty,
        };

        sectionGroups[sectionTitle].push(parsedResponse);
      }
    );
  });

  // Convert to array format
  return Object.entries(sectionGroups).map(([sectionTitle, responses]) => ({
    sectionTitle,
    responses,
  }));
}

/**
 * Check if an answer is considered empty
 */
function isEmptyAnswer(answer: unknown): boolean {
  if (answer === null || answer === undefined || answer === "") {
    return true;
  }

  if (Array.isArray(answer) && answer.length === 0) {
    return true;
  }

  if (typeof answer === "object" && Object.keys(answer).length === 0) {
    return true;
  }

  return false;
}

/**
 * Format answer for display
 */
function formatAnswer(answer: unknown): unknown {
  if (answer === null || answer === undefined || answer === "") {
    return null; // Frontend will handle empty state
  }

  if (typeof answer === "boolean") {
    return answer;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0 ? answer : null;
  }

  if (typeof answer === "object" && answer !== null) {
    const answerObj = answer as Record<string, unknown>;

    // Check if it's an agreement object (has acceptedAt, templateId, sectionId, fieldId)
    const isAgreement =
      "acceptedAt" in answerObj &&
      "templateId" in answerObj &&
      "sectionId" in answerObj &&
      "fieldId" in answerObj;

    if (isAgreement) {
      // Format agreement object for display
      return {
        type: "agreement",
        templateId: answerObj.templateId,
        acceptedAt: answerObj.acceptedAt,
        id: answerObj.id || null,
      };
    }

    // Only convert to file if it has CLEAR file indicators
    // Must have a name/filename AND at least one other file property
    const hasFileName = "name" in answerObj || "fileName" in answerObj;
    const hasFileUrl = "url" in answerObj || "fileUrl" in answerObj;
    const hasFileSize = "size" in answerObj || "fileSize" in answerObj;
    const hasMimeType = "mimeType" in answerObj;
    const hasFileId = "id" in answerObj || "fileId" in answerObj;

    // Only convert if it has a filename AND at least one other file property
    if (
      hasFileName &&
      (hasFileUrl || hasFileSize || hasMimeType || hasFileId)
    ) {
      const fileName = answerObj.name || answerObj.fileName;

      return {
        type: "file",
        name: fileName,
        size: answerObj.size || answerObj.fileSize || null,
        url: answerObj.url || answerObj.fileUrl || null,
        id: answerObj.id || answerObj.fileId || null,
        mimeType: answerObj.mimeType || null,
      };
    }

    // For all other objects, return as-is (they will be handled as regular objects in frontend)
    return answer;
  }

  return String(answer);
}

/**
 * Format field name as fallback when question not found
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Get summary statistics for questionnaire responses
 */
export function getQuestionnaireStats(sections: ParsedQuestionnaireSection[]) {
  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.responses.length,
    0
  );
  const answeredQuestions = sections.reduce(
    (sum, section) => sum + section.responses.filter((r) => !r.isEmpty).length,
    0
  );
  const completionRate =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;

  return {
    totalQuestions,
    answeredQuestions,
    completionRate,
    sectionsCount: sections.length,
  };
}
