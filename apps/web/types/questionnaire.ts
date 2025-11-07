// Peace Seal Questionnaire Types
export interface FileUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  documentType: string;
}

export interface CompanyInformation {
  organizationName: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  headquartersCountry: string;
  countriesOfOperations: string;
  employeeCount: number;
  annualRevenueRange: string;
}

export interface EthicalPracticesGovernance {
  ownershipGovernanceStructure: string;
  hasEthicsCode: boolean;
  ethicsCodeFile?: FileUpload;
  supplierTreatmentDescription: string;
  engagesInLobbying: boolean;
  lobbyingDetails?: string;
  politicalDonationsDetails?: string;
}

export interface PeaceAlignedFinancialPractices {
  hasDefenseInvestments: boolean;
  defenseInvestmentDetails?: string;
  publishesESGDisclosures: boolean;
  esgDisclosuresFile?: FileUpload;
  auditedFinancialsFile?: FileUpload;
}

export interface SupplyChainEthics {
  hasSupplierCodeOfConduct: boolean;
  supplierCodeFile?: FileUpload;
  vendorDueDiligenceProcess: string;
  topSuppliersFile?: FileUpload;
  conflictResourcesPolicy: string;
}

export interface InternalPeaceInclusionPolicies {
  hrHandbookFile?: FileUpload;
  deiPoliciesDescription: string;
  conflictResolutionPrograms: string;
  mentalHealthPrograms: string;
  vulnerablePopulationsHiring: boolean;
  vulnerablePopulationsDetails?: string;
}

export interface AdvocacyPublicPositioning {
  peaceStatements: string[];
  peaceStatementsLinks: string[];
  politicalDonationsDisclosure?: FileUpload;
  peacePlatformExamples: string;
  socialMediaLinks: string[];
}

export interface ConflictFreeOperations {
  operationCountries: string[];
  conflictZonePolicy: string;
  activeConflictZoneOperations: boolean;
  conflictZoneDetails?: string;
  humanitarianExceptions?: string;
}

export interface HumanitarianContribution {
  ngoPartnershipsFile?: FileUpload;
  peacebuildingDonations: string;
  csrInitiativesDescription: string;
  employeeVolunteerPrograms: string;
  impactMeasurement: string;
}

export interface TransparencyReporting {
  annualReportsFile?: FileUpload;
  impactStatementsFile?: FileUpload;
  grievanceSystem: string;
  publicComplaintsProcess: string;
  transparencyCommitment: string;
}

export interface EmployeeRightsWorkplaceCulture {
  wageStandardsBenefits: string;
  deiProgramsFile?: FileUpload;
  deiAuditResults?: FileUpload;
  whistleblowerProtections: string;
  workplaceCultureDescription: string;
}

export interface SocialImpactCommunityEngagement {
  communityPartnerships: string;
  volunteerPrograms: string;
  conflictSensitivePractices: string;
  highRiskRegionOperations: string;
  communityFeedbackMechanisms: string;
}

export interface EnvironmentalResponsibility {
  carbonFootprintFile?: FileUpload;
  sustainabilityCertificationsFile?: FileUpload;
  renewableEnergyUsage: string;
  environmentalPolicies: string;
  climateCommitments: string;
}

export interface GlobalPeaceCommitmentConflictAvoidance {
  oppressiveRegimePolicy: boolean;
  oppressiveRegimePolicyFile?: FileUpload;
  conflictResolutionAdvocacy: string;
  peaceTalksSupport: string;
  conflictPreventionMeasures: string;
}

export interface PublicFeedbackExternalReporting {
  glassdoorLink?: string;
  googleReviewsLink?: string;
  newsMentions: string[];
  publicComplaintsResponse: string;
  crisisManagement: string;
  reputationManagement: string;
}

export interface EnvironmentalPeacebuilding {
  sustainabilityPeaceLink: boolean;
  waterAccessInitiatives?: string;
  indigenousProtection?: string;
  resourceConflictPrevention?: string;
  environmentalJustice?: string;
}

export interface PeaceSealQuestionnaire {
  // Section 1
  companyInformation: CompanyInformation;

  // Section 2 (30% weight)
  ethicalPracticesGovernance: EthicalPracticesGovernance;

  // Section 3 (25% weight)
  peaceAlignedFinancialPractices: PeaceAlignedFinancialPractices;

  // Section 4
  supplyChainEthics: SupplyChainEthics;

  // Section 5
  internalPeaceInclusionPolicies: InternalPeaceInclusionPolicies;

  // Section 6
  advocacyPublicPositioning: AdvocacyPublicPositioning;

  // Section 7
  conflictFreeOperations: ConflictFreeOperations;

  // Section 8
  humanitarianContribution: HumanitarianContribution;

  // Section 9
  transparencyReporting: TransparencyReporting;

  // Section 10 (20% weight)
  employeeRightsWorkplaceCulture: EmployeeRightsWorkplaceCulture;

  // Section 11 (15% weight)
  socialImpactCommunityEngagement: SocialImpactCommunityEngagement;

  // Section 12 (10% weight)
  environmentalResponsibility: EnvironmentalResponsibility;

  // Section 13 (10% weight)
  globalPeaceCommitmentConflictAvoidance: GlobalPeaceCommitmentConflictAvoidance;

  // Section 14 (5% weight)
  publicFeedbackExternalReporting: PublicFeedbackExternalReporting;

  // Section 15 (Optional)
  environmentalPeacebuilding?: EnvironmentalPeacebuilding;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  isOptional?: boolean;
  fields: QuestionnaireField[];
}

// Multi-input support types
export interface CompositeValue {
  text?: string;
  url?: string;
  file?: FileUpload;
  agreement?: AgreementAcceptance;
}

export type InputKind = "text" | "textarea" | "url" | "file";

export interface InputModeConfig {
  kind: InputKind;
  label?: string;
  placeholder?: string;
  helpText?: string;
  fileTypes?: string[];
  maxFileSize?: number;
  hasTemplate?: boolean;
  templateId?: string;
  templateType?: "simple" | "beneficial-ownership";
}

export interface QuestionnaireField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "boolean"
    | "select"
    | "multiselect"
    | "file"
    | "url"
    | "email"
    | "number"
    | "array";
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  tooltipText?: string;
  tooltipLink?: string;
  fileTypes?: string[];
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  hasTemplate?: boolean; // Whether field supports template acceptance
  templateId?: string; // Template resource ID
  templateType?: "simple" | "beneficial-ownership"; // Special handling needed
  inputModes?: InputModeConfig[]; // When present, treat as multi-input field
  completionMode?: "any" | "all"; // Default "any" - field complete if any mode has value
  learnMoreTopicId?: string; // Topic ID for Learn More deep-link (defaults to field.id)
}

export interface SectionProgress {
  sectionId: string;
  completedFields: number;
  totalFields: number;
  isComplete: boolean;
  percentage: number;
}

export interface QuestionnaireProgress {
  overallPercentage: number;
  sectionsProgress: SectionProgress[];
  completedSections: number;
  totalSections: number;
}

// File upload related types
export interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  fileName?: string;
  error?: string;
}

export interface R2UploadRequest {
  file: File;
  companyId: string;
  documentType: string;
  sectionId: string;
  fieldId: string;
}

// Scoring related types
export interface SectionScore {
  sectionId: string;
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  feedback?: string;
}

export interface QuestionnaireScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionsScores: SectionScore[];
  passThreshold: number;
  conditionalThreshold: number;
  status: "verified" | "conditional" | "did_not_pass";
}

// Agreement acceptance related types
export interface AgreementAcceptance {
  id: string;
  sectionId: string;
  fieldId: string;
  templateId: string;
  acceptedAt: string;
  acceptanceData?: Record<string, any>;
  templateTitle?: string;
  templateDescription?: string;
  templateUrl?: string;
}

export interface TemplateResource {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  fileUrl: string;
  category: string;
  isPublic: number;
  accessLevel: string;
  createdAt: number;
  updatedAt: number;
}

export interface AcceptAgreementRequest {
  sectionId: string;
  fieldId: string;
  templateId: string;
  acceptanceData?: Record<string, any>;
}
