import {
  fieldToQuestionMap,
  fieldToSectionMap,
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

  Object.entries(responses).forEach(([fieldId, answer]) => {
    const question = fieldToQuestionMap[fieldId] || formatFieldName(fieldId);
    const section = fieldToSectionMap[fieldId] || "Other Information";
    const isEmpty = isEmptyAnswer(answer);

    const parsedResponse: ParsedQuestionnaireResponse = {
      fieldId,
      question,
      answer: formatAnswer(answer),
      section,
      isEmpty,
    };

    if (!sectionGroups[section]) {
      sectionGroups[section] = [];
    }
    sectionGroups[section].push(parsedResponse);
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
    // Debug log to see what we're getting
    console.log("Processing object:", JSON.stringify(answer, null, 2));

    // Only convert to file if it has CLEAR file indicators
    // Must have a name/filename AND at least one other file property
    const hasFileName = "name" in answer || "fileName" in answer;
    const hasFileUrl = "url" in answer || "fileUrl" in answer;
    const hasFileSize = "size" in answer || "fileSize" in answer;
    const hasMimeType = "mimeType" in answer;
    const hasFileId = "id" in answer || "fileId" in answer;

    // Only convert if it has a filename AND at least one other file property
    if (
      hasFileName &&
      (hasFileUrl || hasFileSize || hasMimeType || hasFileId)
    ) {
      const fileName = (answer as any).name || (answer as any).fileName;

      console.log("Converting to file object:", fileName);

      return {
        type: "file",
        name: fileName,
        size: (answer as any).size || (answer as any).fileSize || null,
        url: (answer as any).url || (answer as any).fileUrl || null,
        id: (answer as any).id || (answer as any).fileId || null,
        mimeType: (answer as any).mimeType || null,
      };
    }

    console.log("Keeping as regular object with keys:", Object.keys(answer));

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
