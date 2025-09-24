// Questionnaire configuration for Peace Seal
export interface QuestionnaireField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  fileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  fields: QuestionnaireField[];
}

export const QUESTIONNAIRE_SECTIONS: QuestionnaireSection[] = [
  {
    id: "companyInformation",
    title: "Company Information",
    description: "Basic information about your organization",
    weight: 0,
    fields: [
      {
        id: "organizationName",
        label: "Organization/Business Name",
        type: "text",
        required: true,
        placeholder: "Enter your organization name",
      },
      {
        id: "website",
        label: "Website",
        type: "url",
        required: true,
        placeholder: "https://example.com",
      },
      {
        id: "contactEmail",
        label: "Contact Email",
        type: "email",
        required: true,
        placeholder: "contact@example.com",
      },
      {
        id: "contactPhone",
        label: "Contact Phone",
        type: "text",
        required: false,
        placeholder: "+1 (555) 123-4567",
      },
      {
        id: "countryOfRegistration",
        label: "Country of Registration",
        type: "select",
        required: true,
      },
      {
        id: "countryOfOperations",
        label: "Countries of Operations",
        type: "multiselect",
        required: true,
        helpText: "Select all countries where you operate",
      },
      {
        id: "employeeCount",
        label: "Size (number of employees)",
        type: "number",
        required: true,
        placeholder: "e.g., 150",
      },
      {
        id: "annualRevenueRange",
        label: "Annual Revenue Range (optional, for context)",
        type: "select",
        required: false,
      },
    ],
  },
  {
    id: "ethicalPracticesGovernance",
    title: "Ethical Practices & Governance",
    description: "Your organizational ethics and governance structure",
    weight: 30,
    fields: [
      {
        id: "ownershipGovernanceStructure",
        label: "Describe your ownership and governance structure",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your ownership structure, board composition, and governance practices...",
      },
      {
        id: "hasEthicsCode",
        label: "Do you have an ethics code or anti-corruption policy?",
        type: "boolean",
        required: true,
      },
      {
        id: "ethicsCodeFile",
        label: "Upload Ethics Code or Anti-Corruption Policy",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024,
        helpText: "Required if you answered 'Yes' to ethics code question",
      },
      {
        id: "supplierTreatmentDescription",
        label:
          "How do you ensure fair and equitable treatment of suppliers and contractors?",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your supplier and contractor treatment policies...",
      },
      {
        id: "engagesInLobbying",
        label: "Do you engage in lobbying or political donations?",
        type: "boolean",
        required: true,
      },
      {
        id: "lobbyingDetails",
        label: "Provide details about your lobbying activities",
        type: "textarea",
        required: false,
        placeholder: "Detail your lobbying activities and expenditures...",
        helpText: "Required if you answered 'Yes' to lobbying question",
      },
      {
        id: "politicalDonationsDetails",
        label: "Provide details about your political donations",
        type: "textarea",
        required: false,
        placeholder: "Detail your political donations and recipients...",
        helpText:
          "Required if you answered 'Yes' to political donations question",
      },
    ],
  },
  {
    id: "peaceAlignedFinancialPractices",
    title: "Peace-Aligned Financial Practices",
    description: "Your financial practices and investment policies",
    weight: 25,
    fields: [
      {
        id: "hasDefenseInvestments",
        label:
          "Do you invest in or have financial ties to defense, arms, or military contractors?",
        type: "boolean",
        required: true,
      },
      {
        id: "defenseInvestmentDetails",
        label: "Provide details about your defense investments",
        type: "textarea",
        required: false,
        placeholder: "Detail your defense-related investments and policies...",
        helpText:
          "Required if you answered 'Yes' to defense investments question",
      },
      {
        id: "publishesESGDisclosures",
        label: "Do you publish ESG-aligned investment disclosures?",
        type: "boolean",
        required: true,
      },
      {
        id: "esgDisclosuresFile",
        label: "Upload ESG Investment Disclosures",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024,
        helpText: "Required if you answered 'Yes' to ESG disclosures question",
      },
      {
        id: "auditedFinancialsFile",
        label:
          "Provide recent audited financials (sensitive data may be redacted)",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024,
        helpText: "Upload your most recent audited financial statements",
      },
    ],
  },
  {
    id: "supplyChainEthics",
    title: "Supply Chain Ethics",
    description: "Your supply chain ethical practices",
    weight: 8,
    fields: [
      {
        id: "hasSupplierCodeOfConduct",
        label:
          "Do you have a Supplier Code of Conduct addressing conflict resources?",
        type: "boolean",
        required: true,
      },
      {
        id: "supplierCodeFile",
        label: "Upload Supplier Code of Conduct",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024,
        helpText: "Required if you answered 'Yes' to supplier code question",
      },
      {
        id: "vendorDueDiligenceProcess",
        label: "Describe your vendor due diligence process",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your vendor screening and due diligence procedures...",
      },
      {
        id: "conflictResourcesPolicy",
        label: "Describe your conflict resources policy",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your policies regarding conflict minerals and resources...",
      },
      {
        id: "topSuppliersFile",
        label: "Provide a list of your top 10–20 suppliers",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx", ".xlsx"],
        maxFileSize: 5 * 1024 * 1024,
        helpText: "Upload a document listing your primary suppliers",
      },
    ],
  },
  {
    id: "internalPeaceInclusionPolicies",
    title: "Internal Peace & Inclusion Policies",
    description: "Your internal policies for peace and inclusion",
    weight: 12,
    fields: [
      {
        id: "hrHandbookFile",
        label: "Attach HR or Employee Handbook with DEI policies",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024,
        helpText:
          "Upload your employee handbook containing diversity, equity, and inclusion policies",
      },
      {
        id: "deiPoliciesDescription",
        label: "Describe your diversity, equity, and inclusion policies",
        type: "textarea",
        required: true,
        placeholder: "Detail your DEI initiatives and policies...",
      },
      {
        id: "conflictResolutionPrograms",
        label: "What conflict resolution programs exist for staff?",
        type: "textarea",
        required: true,
        placeholder: "Describe your employee conflict resolution programs...",
        helpText:
          "Include mediation services, grievance procedures, and conflict management",
      },
      {
        id: "mentalHealthPrograms",
        label: "What mental health programs exist for staff?",
        type: "textarea",
        required: true,
        placeholder: "Describe your employee mental health support programs...",
        helpText:
          "Include counseling services, wellness programs, and mental health resources",
      },
      {
        id: "vulnerablePopulationsHiring",
        label:
          "Do you include vulnerable populations (refugees, veterans, conflict survivors) in hiring initiatives?",
        type: "boolean",
        required: true,
      },
      {
        id: "vulnerablePopulationsDetails",
        label: "Describe your vulnerable populations hiring initiatives",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your programs for hiring vulnerable populations...",
        helpText:
          "Required if you answered 'Yes' to vulnerable populations question",
      },
    ],
  },
  {
    id: "advocacyPublicPositioning",
    title: "Advocacy & Public Positioning",
    description: "Your public stance on peace and nonviolence",
    weight: 7,
    fields: [
      {
        id: "peaceStatements",
        label:
          "Has your company issued public statements in support of peace/nonviolence?",
        type: "array",
        required: true,
        placeholder: "Add your public peace statements...",
        helpText:
          "List your public statements supporting peace and nonviolence",
      },
      {
        id: "peaceStatementsLinks",
        label: "Links to Peace Statements",
        type: "array",
        required: false,
        placeholder: "https://example.com/peace-statement",
        helpText: "Provide links to your public peace statements",
      },
      {
        id: "politicalDonationsDisclosure",
        label: "Upload Political Donations Disclosure",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024,
        helpText: "Upload disclosure of political donations and affiliations",
      },
      {
        id: "peacePlatformExamples",
        label:
          "Share examples of how you have used platforms (ads, campaigns, social media) to promote peace",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your peace promotion activities across various platforms...",
      },
      {
        id: "socialMediaLinks",
        label: "Social Media Links",
        type: "array",
        required: false,
        placeholder: "https://twitter.com/yourcompany",
        helpText: "Provide links to your social media accounts",
      },
    ],
  },
  {
    id: "conflictFreeOperations",
    title: "Conflict-Free Operations",
    description: "Your operational policies in conflict-sensitive regions",
    weight: 5,
    fields: [
      {
        id: "operationCountries",
        label: "List of countries/regions you operate in",
        type: "array",
        required: true,
        placeholder: "Add countries where you operate...",
        helpText:
          "List all countries and regions where your company has operations",
      },
      {
        id: "conflictZonePolicy",
        label: "How do you ensure no operations in active conflict zones?",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your conflict zone assessment and avoidance policies...",
      },
      {
        id: "activeConflictZoneOperations",
        label: "Do you currently operate in any active conflict zones?",
        type: "boolean",
        required: true,
      },
      {
        id: "conflictZoneDetails",
        label: "Provide details about operations in conflict zones",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your operations in conflict zones and justification...",
        helpText: "Required if you answered 'Yes' to conflict zone operations",
      },
      {
        id: "humanitarianExceptions",
        label: "Describe any humanitarian exceptions to conflict zone policies",
        type: "textarea",
        required: false,
        placeholder: "Detail any humanitarian work in conflict zones...",
      },
    ],
  },
  {
    id: "humanitarianContribution",
    title: "Humanitarian Contribution & Engagement",
    description: "Your humanitarian and peacebuilding contributions",
    weight: 8,
    fields: [
      {
        id: "peacebuildingDonations",
        label:
          "Provide documentation of donations/partnerships with peacebuilding or humanitarian NGOs",
        type: "textarea",
        required: false,
        placeholder: "List your peacebuilding donations and partnerships...",
      },
      {
        id: "csrInitiativesDescription",
        label: "Describe any CSR initiatives tied to peace and justice",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your corporate social responsibility initiatives...",
      },
      {
        id: "employeeVolunteerPrograms",
        label:
          "Describe employee volunteer initiatives tied to peace and justice",
        type: "textarea",
        required: false,
        placeholder: "Detail your employee volunteer programs...",
      },
      {
        id: "impactMeasurement",
        label:
          "How do you measure the impact of your humanitarian contributions?",
        type: "textarea",
        required: false,
        placeholder: "Describe your impact measurement methods...",
      },
      {
        id: "ngoPartnershipsFile",
        label: "Upload documentation of NGO partnerships",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024,
        helpText:
          "Upload agreements or documentation of humanitarian partnerships",
      },
    ],
  },
  {
    id: "transparencyReporting",
    title: "Transparency & Reporting",
    description: "Your transparency and reporting practices",
    weight: 3,
    fields: [
      {
        id: "grievanceSystem",
        label:
          "Describe your grievance redressal system for employees, suppliers, and customers",
        type: "textarea",
        required: false,
        placeholder: "Detail your grievance handling procedures...",
      },
      {
        id: "publicComplaintsProcess",
        label: "Describe your public complaints process",
        type: "textarea",
        required: false,
        placeholder: "Detail how you handle public complaints...",
      },
      {
        id: "transparencyCommitment",
        label: "Provide annual reports or impact statements",
        type: "textarea",
        required: false,
        placeholder: "Describe your transparency reporting practices...",
      },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    title: "Employee Rights & Workplace Culture",
    description: "Your workplace culture and employee rights practices",
    weight: 20,
    fields: [
      {
        id: "wageStandardsBenefits",
        label: "Describe wage standards and benefits",
        type: "textarea",
        required: false,
        placeholder: "Detail your wage standards and employee benefits...",
      },
      {
        id: "whistleblowerProtections",
        label: "How do you ensure whistleblower protections?",
        type: "textarea",
        required: false,
        placeholder: "Describe your whistleblower protection policies...",
      },
      {
        id: "workplaceCultureDescription",
        label: "Describe your workplace culture",
        type: "textarea",
        required: false,
        placeholder: "Detail your workplace culture and values...",
      },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    title: "Social Impact & Community Engagement",
    description: "Your social impact and community engagement practices",
    weight: 15,
    fields: [
      {
        id: "communityPartnerships",
        label: "Detail your community partnerships and volunteer programs",
        type: "textarea",
        required: false,
        placeholder: "Describe your community partnerships...",
      },
      {
        id: "volunteerPrograms",
        label: "Describe your volunteer programs",
        type: "textarea",
        required: false,
        placeholder: "Detail your volunteer initiatives...",
      },
      {
        id: "conflictSensitivePractices",
        label:
          "Describe your practices in conflict-sensitive or high-risk regions",
        type: "textarea",
        required: false,
        placeholder: "Detail your conflict-sensitive practices...",
      },
      {
        id: "highRiskRegionOperations",
        label: "Describe your operations in high-risk regions",
        type: "textarea",
        required: false,
        placeholder: "Detail your high-risk region operations...",
      },
      {
        id: "communityFeedbackMechanisms",
        label: "Describe your community feedback mechanisms",
        type: "textarea",
        required: false,
        placeholder:
          "Detail how you collect and respond to community feedback...",
      },
    ],
  },
  {
    id: "environmentalResponsibility",
    title: "Environmental Responsibility",
    description: "Your environmental responsibility practices",
    weight: 10,
    fields: [
      {
        id: "renewableEnergyUsage",
        label:
          "Provide carbon footprint reports, sustainability certifications, or renewable energy usage data",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your renewable energy usage and environmental data...",
      },
      {
        id: "environmentalPolicies",
        label: "Describe your environmental policies",
        type: "textarea",
        required: false,
        placeholder: "Detail your environmental policies and initiatives...",
      },
      {
        id: "climateCommitments",
        label: "Describe your climate commitments",
        type: "textarea",
        required: false,
        placeholder: "Detail your climate change commitments and actions...",
      },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    title: "Global Peace Commitment & Conflict Avoidance",
    description: "Your global peace commitment and conflict avoidance policies",
    weight: 10,
    fields: [
      {
        id: "oppressiveRegimePolicy",
        label:
          "Do you have policies to avoid partnering with oppressive regimes or conflict-linked entities?",
        type: "boolean",
        required: false,
      },
      {
        id: "conflictResolutionAdvocacy",
        label: "Share any advocacy for conflict resolution or peace talks",
        type: "textarea",
        required: false,
        placeholder: "Detail your conflict resolution advocacy...",
      },
      {
        id: "peaceTalksSupport",
        label: "Describe your support for peace talks",
        type: "textarea",
        required: false,
        placeholder: "Detail your peace talks support...",
      },
      {
        id: "conflictPreventionMeasures",
        label: "Describe your conflict prevention measures",
        type: "textarea",
        required: false,
        placeholder: "Detail your conflict prevention initiatives...",
      },
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    title: "Public Feedback & External Reporting",
    description: "Your public feedback and external reporting practices",
    weight: 5,
    fields: [
      {
        id: "publicComplaintsResponse",
        label: "Provide links to Glassdoor, Google Reviews, or news mentions",
        type: "textarea",
        required: false,
        placeholder: "Provide links to your public reviews and mentions...",
      },
      {
        id: "crisisManagement",
        label:
          "Share examples of how you have responded to public complaints or scandals",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your crisis management and public complaint responses...",
      },
      {
        id: "reputationManagement",
        label: "Describe your reputation management practices",
        type: "textarea",
        required: false,
        placeholder: "Detail your reputation management strategies...",
      },
      {
        id: "newsMentions",
        label: "Provide news mentions or media coverage",
        type: "textarea",
        required: false,
        placeholder: "List relevant news mentions or media coverage...",
      },
    ],
  },
  {
    id: "environmentalPeacebuilding",
    title: "Environmental Peacebuilding",
    description: "Your environmental peacebuilding initiatives (Optional)",
    weight: 0,
    fields: [
      {
        id: "sustainabilityPeaceLink",
        label:
          "Do you link sustainability with peace (e.g., water access, indigenous protection)?",
        type: "boolean",
        required: false,
      },
    ],
  },
];

// Helper function to create field mappings
export const createFieldMappings = () => {
  const fieldToQuestionMap: Record<string, string> = {};
  const fieldToSectionMap: Record<string, string> = {};

  QUESTIONNAIRE_SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      fieldToQuestionMap[field.id] = field.label;
      fieldToSectionMap[field.id] = section.title;
    });
  });

  return { fieldToQuestionMap, fieldToSectionMap };
};

export const { fieldToQuestionMap, fieldToSectionMap } = createFieldMappings();
