import {
  fieldToQuestionMap,
  fieldToSectionMap,
  getQuestionnaireSections,
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
 * Uses size-based schema selection based on employee count
 */
export function parseQuestionnaireResponses(
  responsesJson: string,
  employeeCount?: number
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

  // Get employee count from responses if not provided, default to 0 (small business)
  const employeeCountFromResponses =
    employeeCount !== undefined
      ? employeeCount
      : Number(
          (responses.companyInformation as Record<string, unknown>)
            ?.employeeCount || 0
        );

  // Get the appropriate schema based on company size
  const sections = getQuestionnaireSections(employeeCountFromResponses);

  // Build parsed sections based on schema
  const parsedSections: ParsedQuestionnaireSection[] = sections.map(
    (section) => {
      const sectionData =
        (responses[section.id] as Record<string, unknown>) || {};

      // Only include fields that exist in the schema
      const sectionResponses: ParsedQuestionnaireResponse[] = section.fields
        .map((field) => {
          const answer = sectionData[field.id];
          const isEmpty = isEmptyAnswer(answer);

          return {
            fieldId: field.id,
            question: field.label,
            answer: formatAnswer(answer),
            section: section.title,
            isEmpty,
          };
        })
        .filter((response) => {
          // Include all fields from schema, even if empty
          // This ensures advisor sees all expected fields
          return true;
        });

      return {
        sectionTitle: section.title,
        responses: sectionResponses,
      };
    }
  );

  return parsedSections;
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
 * Handles composite values (multi-input fields) by preferring file/agreement over url/text
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

    // Handle composite values (multi-input fields)
    // Check if it's a composite value with text, url, file, or agreement
    if (
      "text" in answerObj ||
      "url" in answerObj ||
      "file" in answerObj ||
      "agreement" in answerObj
    ) {
      // Prefer file/agreement over url/text
      if ("agreement" in answerObj && answerObj.agreement) {
        const agreement = answerObj.agreement as Record<string, unknown>;
        return {
          type: "agreement",
          templateId: agreement.templateId,
          acceptedAt: agreement.acceptedAt,
          id: agreement.id || null,
        };
      }

      if ("file" in answerObj && answerObj.file) {
        const file = answerObj.file as Record<string, unknown>;
        return {
          type: "file",
          name: file.fileName || file.name || null,
          size: file.fileSize || file.size || null,
          url: file.fileUrl || file.url || null,
          id: file.id || file.fileId || null,
          mimeType: file.mimeType || null,
        };
      }

      if ("url" in answerObj && answerObj.url) {
        const urlValue = String(answerObj.url);
        return urlValue.trim().length > 0 ? urlValue : null;
      }

      if ("text" in answerObj && answerObj.text) {
        const textValue = String(answerObj.text);
        return textValue.trim().length > 0 ? textValue : null;
      }

      // If composite but all empty, return null
      return null;
    }

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
