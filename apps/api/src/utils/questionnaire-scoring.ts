// Questionnaire scoring utilities
// Matches frontend completion logic for consistent scoring

import type { ScoringField, ScoringSection } from "../config/scoring-manifest";

/**
 * Check if a field value is completed based on field configuration
 * Matches frontend logic from use-questionnaire.ts and FormField.tsx
 */
export function isFieldCompleted(
  field: ScoringField,
  value: unknown
): boolean {
  if (!field.required && !field.isOptionalBonus) {
    // Optional non-bonus fields don't count toward completion
    return false;
  }

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
      const composite = value as {
        text?: string;
        url?: string;
        file?: unknown;
        agreement?: unknown;
      };
      const completionMode = field.completionMode || "any";

      if (completionMode === "all") {
        // All modes must have values
        return field.inputModes.every((mode) => {
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
      } else {
        // Any mode can have a value (default)
        return field.inputModes.some((mode) => {
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
    ) {
      return true;
    }
    return false;
  }

  // Handle single-input fields
  if (value === null || value === undefined) return false;

  // Boolean fields
  if (typeof value === "boolean") return true;

  // Array fields
  if (Array.isArray(value)) return value.length > 0;

  // File/agreement fields (check for file upload or agreement acceptance)
  if (
    value &&
    typeof value === "object" &&
    ("fileName" in value || "fileUrl" in value || "templateId" in value)
  ) {
    return true;
  }

  // String fields (text, textarea, url, email, etc.)
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  // Number fields
  if (typeof value === "number") {
    return value > 0;
  }

  return false;
}

/**
 * Calculate section completion percentage
 * Only counts required fields for base score
 */
export function calculateSectionCompletion(
  section: ScoringSection,
  sectionData: Record<string, unknown> | null | undefined
): number {
  if (!sectionData) return 0;

  const requiredFields = section.fields.filter((f) => f.required);
  if (requiredFields.length === 0) return 100; // No required fields = 100% complete

  let completedCount = 0;
  requiredFields.forEach((field) => {
    const value = sectionData[field.id];
    if (isFieldCompleted(field, value)) {
      completedCount++;
    }
  });

  return Math.round((completedCount / requiredFields.length) * 100);
}

/**
 * Calculate optional bonus completion percentage
 * Only counts fields marked as isOptionalBonus
 */
export function calculateOptionalBonusCompletion(
  sections: ScoringSection[],
  responses: Record<string, Record<string, unknown>>
): number {
  let totalOptionalFields = 0;
  let completedOptionalFields = 0;

  sections.forEach((section) => {
    const optionalFields = section.fields.filter((f) => f.isOptionalBonus);
    totalOptionalFields += optionalFields.length;

    const sectionData = responses[section.id];
    if (sectionData) {
      optionalFields.forEach((field) => {
        const value = sectionData[field.id];
        if (isFieldCompleted(field, value)) {
          completedOptionalFields++;
        }
      });
    }
  });

  if (totalOptionalFields === 0) return 0;

  // Return percentage (will be capped at 5% bonus)
  return Math.round((completedOptionalFields / totalOptionalFields) * 100);
}

/**
 * Calculate weighted score from questionnaire responses
 * Matches "Automated Scoring System" from PEACE SEAL PROGRAM OVERVIEW:
 * Each section contributes: (section completion % / 100) * section weight %
 * Final score = sum of all section contributions + optional bonus (up to +5%)
 * Returns score 0-100
 */
export function calculateWeightedScore(
  sections: ScoringSection[],
  responses: Record<string, Record<string, unknown>>,
  employeeCount?: number | null
): number {
  // Calculate section scores
  let totalScore = 0;

  sections.forEach((section) => {
    // Skip companyInformation (weight 0)
    if (section.weight === 0) return;

    const sectionData = responses[section.id];
    const sectionCompletion = calculateSectionCompletion(section, sectionData);

    // Each section contributes: (completion % / 100) * section weight %
    // Example: 80% completion in 20% weighted section = 16% contribution
    const sectionContribution = (sectionCompletion / 100) * section.weight;
    totalScore += sectionContribution;
  });

  // Round base score
  let baseScore = Math.round(totalScore);

  // Add optional bonus (up to +5%)
  const optionalCompletion = calculateOptionalBonusCompletion(sections, responses);
  const optionalBonus = Math.round((optionalCompletion / 100) * 5); // Max 5%

  // Final score: base + bonus, capped at 100
  const finalScore = Math.min(100, baseScore + optionalBonus);

  return Math.max(0, Math.min(100, finalScore));
}

