import { QuestionnaireSection } from "@/types/questionnaire";

export const QUESTIONNAIRE_SECTIONS: QuestionnaireSection[] = [
  {
    id: "companyInformation",
    title: "Company Information",
    description: "Basic information about your organization",
    weight: 0, // Not scored
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
        options: [
          "United States",
          "Canada",
          "United Kingdom",
          "Germany",
          "France",
          "Spain",
          "Italy",
          "Australia",
          "Japan",
          "Other",
        ],
      },
      {
        id: "countryOfOperations",
        label: "Countries of Operations",
        type: "multiselect",
        required: true,
        options: [
          "United States",
          "Canada",
          "United Kingdom",
          "Germany",
          "France",
          "Spain",
          "Italy",
          "Australia",
          "Japan",
          "Other",
        ],
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
        label: "Annual Revenue Range (optional)",
        type: "select",
        required: false,
        options: [
          "Under $1M",
          "$1M - $10M",
          "$10M - $100M",
          "$100M - $1B",
          "Over $1B",
          "Prefer not to disclose",
        ],
      },
    ],
  },
  {
    id: "ethicalPracticesGovernance",
    title: "Ethical Practices & Governance",
    description: "Your governance structure and ethical policies",
    weight: 30,
    fields: [
      {
        id: "ownershipGovernanceStructure",
        label: "Describe your ownership and governance structure",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your organizational structure, board composition, and decision-making processes...",
        helpText:
          "Include information about ownership, leadership structure, board diversity, and governance policies",
      },
      {
        id: "hasEthicsCode",
        label: "Do you have an ethics code or anti-corruption policy?",
        type: "boolean",
        required: true,
      },
      {
        id: "ethicsCodeFile",
        label: "Upload Ethics Code/Anti-Corruption Policy",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your ethics code or anti-corruption policy document",
      },
      {
        id: "supplierTreatmentDescription",
        label:
          "How do you ensure fair and equitable treatment of suppliers and contractors?",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your supplier relations policies, payment terms, and fairness practices...",
        helpText:
          "Include information about supplier diversity, payment terms, and conflict resolution",
      },
      {
        id: "engagesInLobbying",
        label: "Do you engage in lobbying or political donations?",
        type: "boolean",
        required: true,
      },
      {
        id: "lobbyingDetails",
        label: "Lobbying Details",
        type: "textarea",
        required: false,
        placeholder: "Provide details about your lobbying activities...",
        helpText: 'Required if you answered "Yes" to lobbying question',
      },
      {
        id: "politicalDonationsDetails",
        label: "Political Donations Details",
        type: "textarea",
        required: false,
        placeholder: "Provide details about political donations...",
        helpText: 'Required if you answered "Yes" to lobbying question',
      },
    ],
  },
  {
    id: "peaceAlignedFinancialPractices",
    title: "Peace-Aligned Financial Practices",
    description: "Your investment policies and financial transparency",
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
        label: "Defense Investment Details",
        type: "textarea",
        required: false,
        placeholder: "Provide details about any defense-related investments...",
        helpText:
          'Required if you answered "Yes" to defense investments question',
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
        maxFileSize: 20 * 1024 * 1024, // 20MB
        helpText: "Upload your ESG investment disclosure documents",
      },
      {
        id: "auditedFinancialsFile",
        label: "Upload Recent Audited Financials",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 50 * 1024 * 1024, // 50MB
        helpText:
          "Sensitive data may be redacted. Upload your most recent audited financial statements",
      },
    ],
  },
  {
    id: "supplyChainEthics",
    title: "Supply Chain Ethics",
    description: "Your supplier relationships and due diligence processes",
    weight: 10,
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
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your supplier code of conduct document",
      },
      {
        id: "vendorDueDiligenceProcess",
        label: "Describe your vendor due diligence process",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your process for vetting and monitoring suppliers...",
        helpText:
          "Include information about screening processes, ongoing monitoring, and compliance requirements",
      },
      {
        id: "topSuppliersFile",
        label: "Upload List of Top 10-20 Suppliers",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText:
          "Provide a list of your top suppliers with company names and general nature of services",
      },
      {
        id: "conflictResourcesPolicy",
        label: "Describe your policy regarding conflict resources and minerals",
        type: "textarea",
        required: true,
        placeholder:
          "Explain how you ensure your supply chain is free from conflict minerals...",
      },
    ],
  },
  {
    id: "internalPeaceInclusionPolicies",
    title: "Internal Peace & Inclusion Policies",
    description: "Your internal policies promoting peace and inclusion",
    weight: 8,
    fields: [
      {
        id: "hrHandbookFile",
        label: "Upload HR/Employee Handbook with DEI Policies",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024, // 20MB
        helpText:
          "Upload your employee handbook highlighting diversity, equity, and inclusion policies",
      },
      {
        id: "deiPoliciesDescription",
        label: "Describe your Diversity, Equity, and Inclusion policies",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your DEI initiatives, programs, and commitments...",
      },
      {
        id: "conflictResolutionPrograms",
        label: "What conflict resolution programs exist for staff?",
        type: "textarea",
        required: true,
        placeholder: "Describe your internal conflict resolution mechanisms...",
        helpText:
          "Include mediation services, grievance procedures, and dispute resolution processes",
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
          'Required if you answered "Yes" to vulnerable populations question',
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
        maxFileSize: 10 * 1024 * 1024, // 10MB
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
        label: "Conflict Zone Operations Details",
        type: "textarea",
        required: false,
        placeholder: "Provide details about operations in conflict zones...",
        helpText: 'Required if you answered "Yes" to conflict zone operations',
      },
      {
        id: "humanitarianExceptions",
        label:
          "Describe any humanitarian exceptions to conflict zone operations",
        type: "textarea",
        required: false,
        placeholder: "Detail any humanitarian work in conflict zones...",
      },
    ],
  },
  {
    id: "humanitarianContribution",
    title: "Humanitarian Contribution & Engagement",
    description: "Your contributions to humanitarian and peacebuilding efforts",
    weight: 8,
    fields: [
      {
        id: "ngoPartnershipsFile",
        label:
          "Upload documentation of donations/partnerships with peacebuilding or humanitarian NGOs",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 15 * 1024 * 1024, // 15MB
        helpText:
          "Upload documentation of your humanitarian partnerships and donations",
      },
      {
        id: "peacebuildingDonations",
        label:
          "Describe your donations and partnerships with peacebuilding organizations",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your financial contributions and partnerships with peace organizations...",
      },
      {
        id: "csrInitiativesDescription",
        label: "Describe your CSR initiatives tied to peace and justice",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your corporate social responsibility programs focused on peace...",
      },
      {
        id: "employeeVolunteerPrograms",
        label:
          "Describe employee volunteer initiatives tied to peace and justice",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your employee volunteer programs supporting peace causes...",
      },
      {
        id: "impactMeasurement",
        label:
          "How do you measure the impact of your humanitarian contributions?",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your methods for measuring humanitarian impact...",
      },
    ],
  },
  {
    id: "transparencyReporting",
    title: "Transparency & Reporting",
    description: "Your transparency practices and reporting mechanisms",
    weight: 5,
    fields: [
      {
        id: "annualReportsFile",
        label: "Upload Annual Reports",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 30 * 1024 * 1024, // 30MB
        helpText: "Upload your most recent annual reports",
      },
      {
        id: "impactStatementsFile",
        label: "Upload Impact Statements",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024, // 20MB
        helpText: "Upload your impact or sustainability statements",
      },
      {
        id: "grievanceSystem",
        label:
          "Describe your grievance redressal system for employees, suppliers, and customers",
        type: "textarea",
        required: true,
        placeholder: "Detail your grievance handling processes and systems...",
      },
      {
        id: "publicComplaintsProcess",
        label: "Describe your process for handling public complaints",
        type: "textarea",
        required: true,
        placeholder:
          "Detail how you handle and respond to public complaints...",
      },
      {
        id: "transparencyCommitment",
        label: "Describe your overall commitment to transparency",
        type: "textarea",
        required: true,
        placeholder: "Detail your transparency policies and practices...",
      },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    title: "Employee Rights & Workplace Culture",
    description: "Your employee rights and workplace culture policies",
    weight: 20,
    fields: [
      {
        id: "wageStandardsBenefits",
        label: "Describe wage standards and benefits",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your compensation philosophy, wage standards, and benefits package...",
      },
      {
        id: "deiProgramsFile",
        label: "Upload records of DEI programs",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 15 * 1024 * 1024, // 15MB
        helpText:
          "Upload documentation of your diversity, equity, and inclusion programs",
      },
      {
        id: "deiAuditResults",
        label: "Upload DEI audit results",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText:
          "Upload results of any diversity, equity, and inclusion audits",
      },
      {
        id: "whistleblowerProtections",
        label: "How do you ensure whistleblower protections?",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your whistleblower protection policies and procedures...",
      },
      {
        id: "workplaceCultureDescription",
        label: "Describe your workplace culture and employee rights policies",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your workplace culture, employee rights, and related policies...",
      },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    title: "Social Impact & Community Engagement",
    description: "Your community engagement and social impact initiatives",
    weight: 15,
    fields: [
      {
        id: "communityPartnerships",
        label: "Detail your community partnerships and volunteer programs",
        type: "textarea",
        required: true,
        placeholder:
          "Describe your community partnerships and volunteer initiatives...",
      },
      {
        id: "volunteerPrograms",
        label: "Describe your employee volunteer programs",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your employee volunteer programs and community service...",
      },
      {
        id: "conflictSensitivePractices",
        label: "Describe your practices in conflict-sensitive regions",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your conflict-sensitive approaches and practices...",
      },
      {
        id: "highRiskRegionOperations",
        label: "Describe your practices in high-risk regions",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your risk management and operational practices in high-risk areas...",
      },
      {
        id: "communityFeedbackMechanisms",
        label: "Describe your community feedback mechanisms",
        type: "textarea",
        required: true,
        placeholder:
          "Detail how you collect and respond to community feedback...",
      },
    ],
  },
  {
    id: "environmentalResponsibility",
    title: "Environmental Responsibility",
    description: "Your environmental policies and sustainability practices",
    weight: 10,
    fields: [
      {
        id: "carbonFootprintFile",
        label: "Upload carbon footprint reports",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024, // 20MB
        helpText: "Upload your carbon footprint or emissions reports",
      },
      {
        id: "sustainabilityCertificationsFile",
        label: "Upload sustainability certifications",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 15 * 1024 * 1024, // 15MB
        helpText: "Upload any sustainability certifications you hold",
      },
      {
        id: "renewableEnergyUsage",
        label: "Provide renewable energy usage data",
        type: "textarea",
        required: true,
        placeholder: "Detail your renewable energy usage and commitments...",
      },
      {
        id: "environmentalPolicies",
        label: "Describe your environmental policies",
        type: "textarea",
        required: true,
        placeholder: "Detail your environmental policies and practices...",
      },
      {
        id: "climateCommitments",
        label: "Describe your climate commitments and goals",
        type: "textarea",
        required: true,
        placeholder: "Detail your climate goals and commitments...",
      },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    title: "Global Peace Commitment & Conflict Avoidance",
    description: "Your commitment to global peace and conflict avoidance",
    weight: 10,
    fields: [
      {
        id: "oppressiveRegimePolicy",
        label:
          "Do you have policies to avoid partnering with oppressive regimes or conflict-linked entities?",
        type: "boolean",
        required: true,
      },
      {
        id: "oppressiveRegimePolicyFile",
        label: "Upload policy evidence",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText:
          "Upload documentation of your policies regarding oppressive regimes",
      },
      {
        id: "conflictResolutionAdvocacy",
        label: "Share any advocacy for conflict resolution",
        type: "textarea",
        required: true,
        placeholder: "Detail your advocacy efforts for conflict resolution...",
      },
      {
        id: "peaceTalksSupport",
        label: "Share any support for peace talks",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your support for peace talks and diplomatic solutions...",
      },
      {
        id: "conflictPreventionMeasures",
        label: "Describe your conflict prevention measures",
        type: "textarea",
        required: true,
        placeholder: "Detail your measures to prevent and avoid conflicts...",
      },
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    title: "Public Feedback & External Reporting",
    description: "Your public reputation and feedback management",
    weight: 5,
    fields: [
      {
        id: "glassdoorLink",
        label: "Glassdoor Link",
        type: "url",
        required: false,
        placeholder: "https://glassdoor.com/yourcompany",
        helpText: "Provide link to your Glassdoor profile",
      },
      {
        id: "googleReviewsLink",
        label: "Google Reviews Link",
        type: "url",
        required: false,
        placeholder: "https://google.com/maps/yourcompany",
        helpText: "Provide link to your Google Reviews",
      },
      {
        id: "newsMentions",
        label: "News Mentions",
        type: "array",
        required: false,
        placeholder: "https://news-site.com/article",
        helpText: "Provide links to recent news mentions",
      },
      {
        id: "publicComplaintsResponse",
        label:
          "Share examples of how you have responded to public complaints or scandals",
        type: "textarea",
        required: true,
        placeholder:
          "Detail how you have handled public complaints or reputation issues...",
      },
      {
        id: "crisisManagement",
        label: "Describe your crisis management approach",
        type: "textarea",
        required: true,
        placeholder:
          "Detail your approach to managing crises and public relations issues...",
      },
      {
        id: "reputationManagement",
        label: "Describe your reputation management practices",
        type: "textarea",
        required: true,
        placeholder:
          "Detail how you monitor and manage your public reputation...",
      },
    ],
  },
  {
    id: "environmentalPeacebuilding",
    title: "Optional – Environmental Peacebuilding",
    description:
      "The intersection of environmental sustainability and peacebuilding",
    weight: 5,
    isOptional: true,
    fields: [
      {
        id: "sustainabilityPeaceLink",
        label: "Do you link sustainability with peace?",
        type: "boolean",
        required: false,
      },
      {
        id: "waterAccessInitiatives",
        label: "Water access initiatives",
        type: "textarea",
        required: false,
        placeholder: "Detail your water access and conservation initiatives...",
      },
      {
        id: "indigenousProtection",
        label: "Indigenous protection initiatives",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your indigenous rights and protection initiatives...",
      },
      {
        id: "resourceConflictPrevention",
        label: "Resource conflict prevention measures",
        type: "textarea",
        required: false,
        placeholder:
          "Detail your measures to prevent resource-based conflicts...",
      },
      {
        id: "environmentalJustice",
        label: "Environmental justice initiatives",
        type: "textarea",
        required: false,
        placeholder: "Detail your environmental justice initiatives...",
      },
    ],
  },
];

// Helper functions
export const getTotalSections = () => QUESTIONNAIRE_SECTIONS.length;
export const getRequiredSections = () =>
  QUESTIONNAIRE_SECTIONS.filter((s) => !s.isOptional);
export const getSectionById = (id: string) =>
  QUESTIONNAIRE_SECTIONS.find((s) => s.id === id);
export const getTotalWeight = () =>
  QUESTIONNAIRE_SECTIONS.reduce((sum, s) => sum + s.weight, 0);

// Document types mapping
export const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  ethicsCodeFile: "ethics_code",
  esgDisclosuresFile: "esg_disclosures",
  auditedFinancialsFile: "financial_audit",
  supplierCodeFile: "supplier_code",
  hrHandbookFile: "hr_handbook",
  topSuppliersFile: "supplier_list",
  politicalDonationsDisclosure: "political_donations",
  ngoPartnershipsFile: "ngo_partnerships",
  annualReportsFile: "annual_report",
  impactStatementsFile: "impact_statement",
  deiProgramsFile: "dei_programs",
  deiAuditResults: "dei_audit",
  carbonFootprintFile: "carbon_footprint",
  sustainabilityCertificationsFile: "sustainability_certifications",
  oppressiveRegimePolicyFile: "oppressive_regime_policy",
};
