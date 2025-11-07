// Scoring manifest for Peace Seal questionnaire
// Lightweight structure for backend scoring - mirrors frontend questionnaire-configs.ts
// but includes only essential scoring metadata

export interface ScoringField {
  id: string;
  required: boolean;
  inputModes?: Array<{
    kind: "text" | "textarea" | "url" | "file";
  }>;
  completionMode?: "any" | "all";
  isOptionalBonus?: boolean; // Fields that contribute to the +5% optional bonus
}

export interface ScoringSection {
  id: string;
  weight: number; // Percentage weight of this section
  fields: ScoringField[];
}

export type BusinessSize = "small" | "medium" | "large";

// Helper to determine business size
export function getBusinessSize(employeeCount: number | null | undefined): BusinessSize {
  if (!employeeCount || employeeCount <= 0) return "small";
  if (employeeCount <= 20) return "small";
  if (employeeCount <= 50) return "medium";
  return "large";
}

// SMALL BUSINESS (1-20 Employees) SCORING MANIFEST
export const SMALL_BUSINESS_SCORING: ScoringSection[] = [
  // Section 1: Company Information (not scored - weight 0)
  {
    id: "companyInformation",
    weight: 0,
    fields: [
      { id: "organizationName", required: true },
      { id: "website", required: true },
      { id: "contactEmail", required: true },
      { id: "contactPhone", required: false },
      { id: "contactName", required: true },
      { id: "headquartersCountry", required: true },
      { id: "countriesOfOperations", required: false },
      { id: "employeeCount", required: true },
      { id: "annualRevenueRange", required: false },
    ],
  },
  // Section 2: Ethical Practices & Governance (15%)
  {
    id: "ethicalPracticesGovernance",
    weight: 15,
    fields: [
      { id: "peacePledgeDeclaration", required: true },
      { id: "hrHandbook", required: true },
      { id: "ownershipStructure", required: true },
      { id: "supplierSelfDeclaration", required: true },
      {
        id: "companyValuesStatement",
        required: true,
        inputModes: [{ kind: "textarea" }, { kind: "file" }, { kind: "url" }],
        completionMode: "any",
      },
      { id: "donationReceipts", required: false, isOptionalBonus: true },
      {
        id: "diversityBreakdown",
        required: false,
        isOptionalBonus: true,
        inputModes: [{ kind: "textarea" }, { kind: "file" }],
        completionMode: "any",
      },
    ],
  },
  // Section 3: Employee Rights & Workplace Culture (10%)
  {
    id: "employeeRightsWorkplaceCulture",
    weight: 10,
    fields: [
      { id: "fairWagePractices", required: true },
      { id: "antiHarassmentPolicy", required: true },
      { id: "employeeSatisfactionSurvey", required: false, isOptionalBonus: true },
    ],
  },
  // Section 4: Social Impact & Community Engagement (10%)
  {
    id: "socialImpactCommunityEngagement",
    weight: 10,
    fields: [
      {
        id: "communityContribution",
        required: true,
        inputModes: [{ kind: "textarea" }, { kind: "file" }],
        completionMode: "any",
      },
      { id: "employeeVolunteerPrograms", required: false, isOptionalBonus: true },
    ],
  },
  // Section 5: Environmental Responsibility (5%)
  {
    id: "environmentalResponsibility",
    weight: 5,
    fields: [
      { id: "sustainableSourcingStatement", required: true },
      { id: "recyclingRenewableInitiatives", required: false, isOptionalBonus: true },
    ],
  },
  // Section 6: Transparency & Public Accountability (5%)
  {
    id: "transparencyPublicAccountability",
    weight: 5,
    fields: [
      { id: "universalValuesCommitment", required: true },
      { id: "respectLifeNonViolence", required: true },
      { id: "justStableSocieties", required: true },
      { id: "educationForPeace", required: true },
      { id: "ethicalConductInAction", required: true },
      { id: "rejectionViolenceHate", required: true },
      { id: "internationalCooperationLaw", required: true },
      { id: "humanCenteredDevelopment", required: true },
      { id: "externalReviewAgreement", required: true },
    ],
  },
  // Section 7: Global Peace Commitment & Conflict Avoidance (5%)
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    weight: 5,
    fields: [
      { id: "noArmsTiesDeclaration", required: true },
      { id: "peaceInitiativesSupport", required: false, isOptionalBonus: true },
    ],
  },
  // Section 8: Public Feedback & External Reporting System (5%)
  {
    id: "publicFeedbackExternalReporting",
    weight: 5,
    fields: [
      { id: "googleWebsiteReviews", required: true },
      { id: "complaintResolutionProcess", required: false, isOptionalBonus: true },
    ],
  },
];

// MEDIUM BUSINESS (21-50 Employees) SCORING MANIFEST
export const MEDIUM_BUSINESS_SCORING: ScoringSection[] = [
  {
    id: "companyInformation",
    weight: 0,
    fields: [
      { id: "organizationName", required: true },
      { id: "website", required: true },
      { id: "contactEmail", required: true },
      { id: "contactPhone", required: false },
      { id: "contactName", required: true },
      { id: "headquartersCountry", required: true },
      { id: "countriesOfOperations", required: false },
      { id: "employeeCount", required: true },
      { id: "annualRevenueRange", required: false },
    ],
  },
  {
    id: "ethicalPracticesGovernance",
    weight: 20,
    fields: [
      { id: "peacePledgeDeclaration", required: true },
      { id: "boardApprovedPeacePolicy", required: true },
      { id: "beneficialOwnershipPolicy", required: true },
      { id: "supplierVendorCodeOfConduct", required: true },
      { id: "companyValuesStatement", required: true }, // textarea only for medium
      { id: "noLobbyingDeclaration", required: true },
      { id: "esgReport", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    weight: 15,
    fields: [
      { id: "equalOpportunityPolicy", required: true },
      { id: "whistleblowerProtectionPolicy", required: true },
      { id: "fairWagePractices", required: true },
      { id: "mentalHealthPrograms", required: false, isOptionalBonus: true },
      { id: "employeeSatisfactionSurvey", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    weight: 10,
    fields: [
      { id: "ngoPartnerships", required: true }, // textarea
      { id: "employeeVolunteerPrograms", required: true }, // textarea
      { id: "csrReport", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "environmentalResponsibility",
    weight: 5,
    fields: [
      { id: "carbonFootprintDisclosure", required: true },
      { id: "greenBusinessCertification", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "transparencyPublicAccountability",
    weight: 5,
    fields: [
      { id: "universalValuesCommitment", required: true },
      { id: "respectLifeNonViolence", required: true },
      { id: "justStableSocieties", required: true },
      { id: "educationForPeace", required: true },
      { id: "ethicalConductInAction", required: true },
      { id: "rejectionViolenceHate", required: true },
      { id: "internationalCooperationLaw", required: true },
      { id: "humanCenteredDevelopment", required: true },
      { id: "externalReviewAgreement", required: true },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    weight: 5,
    fields: [
      { id: "noArmsTiesDeclaration", required: true },
      { id: "peaceInitiativesSupport", required: true }, // textarea for medium
      { id: "peacebuildingAdvocacy", required: false, isOptionalBonus: true }, // textarea
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    weight: 5,
    fields: [
      { id: "complaintResolutionProcess", required: true },
      { id: "resolutionChannels", required: true }, // textarea
      { id: "googleWebsiteReviews", required: false, isOptionalBonus: true },
    ],
  },
];

// LARGE BUSINESS (50+ Employees) SCORING MANIFEST
export const LARGE_BUSINESS_SCORING: ScoringSection[] = [
  {
    id: "companyInformation",
    weight: 0,
    fields: [
      { id: "organizationName", required: true },
      { id: "website", required: true },
      { id: "contactEmail", required: true },
      { id: "contactPhone", required: false },
      { id: "contactName", required: true },
      { id: "headquartersCountry", required: true },
      { id: "countriesOfOperations", required: false },
      { id: "employeeCount", required: true },
      { id: "annualRevenueRange", required: false },
    ],
  },
  {
    id: "ethicalPracticesGovernance",
    weight: 20,
    fields: [
      { id: "peacePledgeDeclaration", required: true },
      { id: "boardApprovedPeacePolicy", required: true },
      { id: "beneficialOwnershipPolicy", required: true },
      { id: "supplierVendorCodeOfConduct", required: true },
      { id: "companyValuesStatement", required: true }, // textarea only for large
      { id: "noLobbyingDeclaration", required: true },
      { id: "fullEsgReport", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    weight: 15,
    fields: [
      { id: "equalOpportunityPolicy", required: true },
      { id: "fairWagePractices", required: true },
      { id: "mentalHealthPrograms", required: true },
      { id: "whistleblowerProtectionPolicy", required: true },
      { id: "internalMediationProgram", required: false, isOptionalBonus: true },
      { id: "employeeSatisfactionSurvey", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    weight: 10,
    fields: [
      { id: "csrImpactReport", required: true }, // file
      { id: "humanitarianDonations", required: true }, // textarea
      { id: "employeeVolunteerPrograms", required: true }, // textarea
      { id: "peacebuildingNgoPartnerships", required: false, isOptionalBonus: true }, // textarea
    ],
  },
  {
    id: "environmentalResponsibility",
    weight: 5,
    fields: [
      { id: "carbonFootprintDisclosure", required: true },
      { id: "peaceLinkedEnvironmentalInitiatives", required: false, isOptionalBonus: true },
      { id: "greenBusinessCertification", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "transparencyPublicAccountability",
    weight: 5,
    fields: [
      { id: "universalValuesCommitment", required: true },
      { id: "respectLifeNonViolence", required: true },
      { id: "justStableSocieties", required: true },
      { id: "educationForPeace", required: true },
      { id: "ethicalConductInAction", required: true },
      { id: "rejectionViolenceHate", required: true },
      { id: "internationalCooperationLaw", required: true },
      { id: "humanCenteredDevelopment", required: true },
      { id: "transparentFundingDisclosures", required: true },
      { id: "externalReviewAgreement", required: true },
      { id: "independentThirdPartyAudits", required: false, isOptionalBonus: true },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    weight: 5,
    fields: [
      { id: "noArmsTiesDeclaration", required: true },
      { id: "peaceInitiativesSupport", required: true }, // textarea for large
      { id: "peacebuildingAdvocacy", required: false, isOptionalBonus: true }, // textarea
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    weight: 5,
    fields: [
      { id: "complaintResolutionProcess", required: true },
      { id: "resolutionChannels", required: true }, // textarea
      { id: "googleWebsiteReviews", required: false, isOptionalBonus: true },
    ],
  },
];

// Get scoring manifest by business size
export function getScoringManifest(
  employeeCount: number | null | undefined
): ScoringSection[] {
  const size = getBusinessSize(employeeCount);
  switch (size) {
    case "small":
      return SMALL_BUSINESS_SCORING;
    case "medium":
      return MEDIUM_BUSINESS_SCORING;
    case "large":
      return LARGE_BUSINESS_SCORING;
    default:
      return SMALL_BUSINESS_SCORING;
  }
}

