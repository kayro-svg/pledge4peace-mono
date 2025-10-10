import { QuestionnaireSection } from "@/types/questionnaire";

// Helper function to determine company size
export function getCompanySize(
  employeeCount: number
): "small" | "medium" | "large" {
  if (employeeCount <= 20) return "small";
  if (employeeCount <= 50) return "medium";
  return "large";
}

// Common Section 1: Company Information (All Sizes)
const COMPANY_INFORMATION_SECTION: QuestionnaireSection = {
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
};

// SMALL BUSINESS (1-20 Employees) CONFIGURATION
export const SMALL_BUSINESS_SECTIONS: QuestionnaireSection[] = [
  COMPANY_INFORMATION_SECTION,
  {
    id: "ethicalPracticesGovernance",
    title: "Ethical Practices & Governance",
    description: "Your governance structure and ethical policies",
    weight: 15,
    fields: [
      {
        id: "peacePledgeDeclaration",
        label: "Signed CEO/Owner Peace Pledge Declaration",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Sign the Peace Pledge Declaration electronically",
      },
      {
        id: "hrHandbook",
        label:
          "HR or Employee Handbook (with anti-discrimination & fair wage policies)",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your HR handbook or use our sample template",
      },
      {
        id: "ownershipStructure",
        label: "Ownership Structure",
        type: "select",
        required: true,
        options: [
          "Sole Proprietorship (single owner)",
          "Partnership (two or more owners)",
          "Corporation (owners are shareholders with limited liability)",
          "Limited Liability Company (LLC) (blend of partnership and corporate features)",
        ],
      },
      {
        id: "supplierSelfDeclaration",
        label:
          "Supplier Self-Declaration (no ties to arms/conflict industries)",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload supplier declaration or sign our template",
      },
      {
        id: "companyValuesStatement",
        label: "Public Statement of Company Values",
        type: "textarea",
        required: true,
        placeholder: "Provide your public statement of company values...",
        helpText: "From website, brochure, or press release",
      },
      // Optional fields (+5%)
      {
        id: "donationReceipts",
        label: "Donation Receipts to Peacebuilding Organizations (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".jpg", ".png"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload up to 3 donation receipts",
      },
      {
        id: "diversityBreakdown",
        label: "Simple Diversity Breakdown (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your workforce diversity...",
        helpText: "Gender, age, etc. breakdown or upload documentation",
      },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    title: "Employee Rights & Workplace Culture",
    description: "Your employee rights and workplace culture policies",
    weight: 10,
    fields: [
      {
        id: "fairWagePractices",
        label: "Proof of Fair Wage Practices",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Payroll summary or self-declaration",
      },
      {
        id: "antiHarassmentPolicy",
        label: "Signed Anti-Harassment and Anti-Discrimination Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your policy or sign our template",
      },
      // Optional fields (+5%)
      {
        id: "employeeSatisfactionSurvey",
        label: "Employee Satisfaction Survey Summary (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload survey summary or use our survey tool",
      },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    title: "Social Impact & Community Engagement",
    description: "Your community engagement and social impact initiatives",
    weight: 10,
    fields: [
      {
        id: "communityContribution",
        label: "Evidence of Community Contribution",
        type: "textarea",
        required: true,
        placeholder: "Describe at least one community contribution...",
        helpText: "Local donation, volunteering initiative, etc.",
      },
      // Optional fields (+5%)
      {
        id: "employeeVolunteerPrograms",
        label: "Employee Volunteer Programs (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe volunteer hours and program initiatives...",
        helpText: "Employee volunteer mandatory hours or programs",
      },
    ],
  },
  {
    id: "environmentalResponsibility",
    title: "Environmental Responsibility",
    description: "Your environmental policies and sustainability practices",
    weight: 5,
    fields: [
      {
        id: "sustainableSourcingStatement",
        label: "Signed Statement on Sustainable Sourcing or Waste Management",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your statement or sign our template",
      },
      // Optional fields (+5%)
      {
        id: "recyclingRenewableInitiatives",
        label:
          "Participation in Local Recycling/Renewable Initiatives (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your recycling and renewable energy programs...",
        helpText: "Local recycling/renewable initiatives",
      },
    ],
  },
  {
    id: "transparencyPublicAccountability",
    title: "Transparency & Public Accountability",
    description: "Your transparency practices and public accountability",
    weight: 5,
    fields: [
      {
        id: "universalValuesCommitment",
        label: "Foundation in Universal Values",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to universal values is...",
        helpText:
          "Share how your organization upholds universal values such as human dignity, justice, equality, and protection of human rights",
      },
      {
        id: "respectLifeNonViolence",
        label: "Respect for Life and Non-Violence",
        type: "textarea",
        required: true,
        placeholder: "Our pledge to respect life and non-violence is...",
        helpText:
          "Describe how your company ensures respect for life and promotes non-violence in operations, policies, and workplace culture",
      },
      {
        id: "justStableSocieties",
        label: "Promoting Just and Stable Societies",
        type: "textarea",
        required: true,
        placeholder: "Our role in fostering just and stable societies is...",
        helpText:
          "Explain how your business contributes to fairness, trust, and stability through just laws, equitable structures, and practices",
      },
      {
        id: "educationForPeace",
        label: "Education for Peace",
        type: "textarea",
        required: true,
        placeholder: "Our efforts in education for peace are...",
        helpText:
          "Detail how your company invests in education, training, or awareness that promotes tolerance, cross-cultural understanding, and sustainable development",
      },
      {
        id: "ethicalConductInAction",
        label: "Ethical Conduct in Action",
        type: "textarea",
        required: true,
        placeholder: "Our ethical conduct in practice is...",
        helpText:
          "Provide examples of how your organization upholds ethical standards in everyday operations",
      },
      {
        id: "rejectionViolenceHate",
        label: "Rejection of Violence and Hate",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to reject violence and hate is...",
        helpText:
          "Confirm that your business explicitly rejects violence, terrorism, and hate speech",
      },
      {
        id: "internationalCooperationLaw",
        label: "International Cooperation and Law",
        type: "textarea",
        required: true,
        placeholder: "Our approach to international cooperation and law is...",
        helpText:
          "Explain how your company respects international law and engages in cooperation to resolve disputes peacefully",
      },
      {
        id: "humanCenteredDevelopment",
        label: "Human-Centered Development",
        type: "textarea",
        required: true,
        placeholder: "Our focus on human-centered development is...",
        helpText:
          "Share how your business prioritizes people's well-being, opportunities, and inclusion over profit alone",
      },
      // Optional fields (+5%)
      {
        id: "thirdPartyPeerReview",
        label: "Willingness to Allow Third-Party Peer Review (Optional)",
        type: "select",
        required: false,
        options: ["Yes", "No"],
        helpText: "In future audits",
      },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    title: "Global Peace Commitment & Conflict Avoidance",
    description: "Your commitment to global peace and conflict avoidance",
    weight: 5,
    fields: [
      {
        id: "noArmsTiesDeclaration",
        label:
          "Declaration of No Ties with Arms Industries or Sanctioned Regimes",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Sign the declaration",
      },
      // Optional fields (+5%)
      {
        id: "peaceInitiativesSupport",
        label: "Evidence of Support for Peace Initiatives (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your support for peace initiatives...",
        helpText: "Local or international peace initiatives",
      },
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    title: "Public Feedback & External Reporting System",
    description: "Your public reputation and feedback management",
    weight: 5,
    fields: [
      {
        id: "googleWebsiteReviews",
        label: "Google/Website Reviews Link",
        type: "url",
        required: true,
        placeholder: "https://google.com/maps/yourcompany",
        helpText: "Provide link to your Google Reviews or website reviews",
      },
      // Optional fields (+5%)
      {
        id: "complaintResolutionProcess",
        label: "Process Documentation for Complaint Resolution (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload process documentation or opt in to use our mediation",
      },
    ],
  },
];

// MEDIUM BUSINESS (21-50 Employees) CONFIGURATION
export const MEDIUM_BUSINESS_SECTIONS: QuestionnaireSection[] = [
  COMPANY_INFORMATION_SECTION,
  {
    id: "ethicalPracticesGovernance",
    title: "Ethical Practices & Governance",
    description: "Your governance structure and ethical policies",
    weight: 20,
    fields: [
      {
        id: "peacePledgeDeclaration",
        label: "Signed CEO/Owner Peace Pledge Declaration",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Sign the Peace Pledge Declaration electronically",
      },
      {
        id: "boardApprovedPeacePolicy",
        label: "Board-Approved Peace & Human Rights Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our sample template",
      },
      {
        id: "beneficialOwnershipPolicy",
        label: "Anti-corruption: Company Beneficial Ownership Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our template",
      },
      {
        id: "supplierVendorCodeOfConduct",
        label: "Supplier/Vendor Code of Conduct",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your code of conduct or sign our template",
      },
      {
        id: "companyValuesStatement",
        label: "Public Statement of Company Values",
        type: "textarea",
        required: true,
        placeholder: "Provide your public statement of company values...",
        helpText: "From website, brochure, or press release",
      },
      {
        id: "noLobbyingDeclaration",
        label: "Declaration of No Lobbying for War/Conflict Policies",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your declaration or sign our template",
      },
      // Optional fields (+5%)
      {
        id: "esgReport",
        label: "ESG Report or Corporate Ethics Statement (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024, // 20MB
        helpText: "Upload your ESG report or corporate ethics statement",
      },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    title: "Employee Rights & Workplace Culture",
    description: "Your employee rights and workplace culture policies",
    weight: 15,
    fields: [
      {
        id: "equalOpportunityPolicy",
        label: "Equal Opportunity Employment (EOE) Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or sign our template",
      },
      {
        id: "whistleblowerProtectionPolicy",
        label: "Whistleblower Protection Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or sign our template",
      },
      {
        id: "fairWagePractices",
        label: "Proof of Fair Wage Practices",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Payroll summary or self-declaration",
      },
      // Optional fields (+5%)
      {
        id: "mentalHealthPrograms",
        label:
          "Mental Health Program or Conflict Resolution Training (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your mental health programs...",
        helpText: "Mental health program or conflict resolution training",
      },
      {
        id: "employeeSatisfactionSurvey",
        label: "Employee Satisfaction Survey Summary (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload survey summary or use our survey tool",
      },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    title: "Social Impact & Community Engagement",
    description: "Your community engagement and social impact initiatives",
    weight: 10,
    fields: [
      {
        id: "ngoPartnerships",
        label:
          "Proof of Donation or Partnership with NGO/Community Organization",
        type: "textarea",
        required: true,
        placeholder: "Describe your NGO partnerships and donations...",
        helpText:
          "At least one donation or partnership with NGO/community organization",
      },
      {
        id: "employeeVolunteerPrograms",
        label: "Employee Volunteer Programs",
        type: "textarea",
        required: true,
        placeholder: "Describe volunteer hours and program initiatives...",
        helpText: "Employee volunteer mandatory hours or programs",
      },
      // Optional fields (+5%)
      {
        id: "csrReport",
        label: "CSR Report (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 20 * 1024 * 1024, // 20MB
        helpText: "Basic acceptable CSR report",
      },
    ],
  },
  {
    id: "environmentalResponsibility",
    title: "Environmental Responsibility",
    description: "Your environmental policies and sustainability practices",
    weight: 5,
    fields: [
      {
        id: "carbonFootprintDisclosure",
        label: "Carbon Footprint Disclosure or Sustainability Plan",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 15 * 1024 * 1024, // 15MB
        helpText: "Upload your disclosure or sign our sustainability plan",
      },
      // Optional fields (+5%)
      {
        id: "greenBusinessCertification",
        label: "Green Business or Equivalent Certification (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".jpg", ".png"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your green business certification",
      },
    ],
  },
  {
    id: "transparencyPublicAccountability",
    title: "Transparency & Public Accountability",
    description: "Your transparency practices and public accountability",
    weight: 5,
    fields: [
      {
        id: "universalValuesCommitment",
        label: "Foundation in Universal Values",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to universal values is...",
        helpText:
          "Share how your organization upholds universal values such as human dignity, justice, equality, and protection of human rights",
      },
      {
        id: "respectLifeNonViolence",
        label: "Respect for Life and Non-Violence",
        type: "textarea",
        required: true,
        placeholder: "Our pledge to respect life and non-violence is...",
        helpText:
          "Describe how your company ensures respect for life and promotes non-violence in operations, policies, and workplace culture",
      },
      {
        id: "justStableSocieties",
        label: "Promoting Just and Stable Societies",
        type: "textarea",
        required: true,
        placeholder: "Our role in fostering just and stable societies is...",
        helpText:
          "Explain how your business contributes to fairness, trust, and stability through just laws, equitable structures, and practices",
      },
      {
        id: "educationForPeace",
        label: "Education for Peace",
        type: "textarea",
        required: true,
        placeholder: "Our efforts in education for peace are...",
        helpText:
          "Detail how your company invests in education, training, or awareness that promotes tolerance, cross-cultural understanding, and sustainable development",
      },
      {
        id: "ethicalConductInAction",
        label: "Ethical Conduct in Action",
        type: "textarea",
        required: true,
        placeholder: "Our ethical conduct in practice is...",
        helpText:
          "Provide examples of how your organization upholds ethical standards in everyday operations",
      },
      {
        id: "rejectionViolenceHate",
        label: "Rejection of Violence and Hate",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to reject violence and hate is...",
        helpText:
          "Confirm that your business explicitly rejects violence, terrorism, and hate speech",
      },
      {
        id: "internationalCooperationLaw",
        label: "International Cooperation and Law",
        type: "textarea",
        required: true,
        placeholder: "Our approach to international cooperation and law is...",
        helpText:
          "Explain how your company respects international law and engages in cooperation to resolve disputes peacefully",
      },
      {
        id: "humanCenteredDevelopment",
        label: "Human-Centered Development",
        type: "textarea",
        required: true,
        placeholder: "Our focus on human-centered development is...",
        helpText:
          "Share how your business prioritizes people's well-being, opportunities, and inclusion over profit alone",
      },
      {
        id: "externalReviewAgreement",
        label: "Agree to External Review by Pledge4Peace on Request",
        type: "select",
        required: true,
        options: ["Yes", "No"],
        helpText: "Agreement to external review",
      },
      // Optional fields (+5%)
      {
        id: "thirdPartyPeerReview",
        label: "Willingness to Allow Third-Party Peer Review (Optional)",
        type: "select",
        required: false,
        options: ["Yes", "No"],
        helpText: "In future audits",
      },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    title: "Global Peace Commitment & Conflict Avoidance",
    description: "Your commitment to global peace and conflict avoidance",
    weight: 5,
    fields: [
      {
        id: "noArmsTiesDeclaration",
        label:
          "Declaration of No Ties with Arms Industries or Sanctioned Regimes",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Sign the declaration",
      },
      {
        id: "peaceInitiativesSupport",
        label: "Evidence of Support for Peace Initiatives",
        type: "textarea",
        required: true,
        placeholder: "Describe your support for peace initiatives...",
        helpText: "Local or international peace initiatives",
      },
      // Optional fields (+5%)
      {
        id: "peacebuildingAdvocacy",
        label:
          "Public Advocacy for Peacebuilding or Mediation Efforts (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your peacebuilding and mediation advocacy...",
        helpText: "Add links to publications",
      },
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    title: "Public Feedback & External Reporting System",
    description: "Your public reputation and feedback management",
    weight: 5,
    fields: [
      {
        id: "complaintResolutionProcess",
        label: "Process Documentation for Complaint Resolution",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload process documentation or opt in to use our mediation",
      },
      {
        id: "resolutionChannels",
        label:
          "Resolution Channels Available for Everyone and Publicly Accessible",
        type: "textarea",
        required: true,
        placeholder: "Provide links to your resolution channels...",
        helpText: "Add any link where you display your resolution channels",
      },
      // Optional fields (+5%)
      {
        id: "googleWebsiteReviews",
        label: "Google/Website Reviews Link (Optional)",
        type: "url",
        required: false,
        placeholder: "https://google.com/maps/yourcompany",
        helpText: "Provide link to your Google Reviews or website reviews",
      },
    ],
  },
];

// LARGE BUSINESS (50+ Employees) CONFIGURATION
export const LARGE_BUSINESS_SECTIONS: QuestionnaireSection[] = [
  COMPANY_INFORMATION_SECTION,
  {
    id: "ethicalPracticesGovernance",
    title: "Ethical Practices & Governance",
    description: "Your governance structure and ethical policies",
    weight: 20,
    fields: [
      {
        id: "peacePledgeDeclaration",
        label: "Signed CEO/Authorized Representative Peace Pledge Declaration",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Sign the Peace Pledge Declaration electronically",
      },
      {
        id: "boardApprovedPeacePolicy",
        label: "Board-Approved Peace & Human Rights Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our sample template",
      },
      {
        id: "beneficialOwnershipPolicy",
        label: "Anti-corruption: Company Beneficial Ownership Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our template",
      },
      {
        id: "supplierVendorCodeOfConduct",
        label: "Supplier/Vendor Code of Conduct",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your code of conduct or sign our template",
      },
      {
        id: "companyValuesStatement",
        label: "Public Statement of Company Values",
        type: "textarea",
        required: true,
        placeholder: "Provide your public statement of company values...",
        helpText: "From website, brochure, or press release",
      },
      {
        id: "noLobbyingDeclaration",
        label: "Declaration of No Lobbying for War/Conflict Policies",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your declaration or sign our template",
      },
      // Optional fields (+5%)
      {
        id: "fullEsgReport",
        label: "Full ESG or CSR Report with Third-Party Validation (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 50 * 1024 * 1024, // 50MB
        helpText:
          "Upload your full ESG or CSR report with third-party validation",
      },
    ],
  },
  {
    id: "employeeRightsWorkplaceCulture",
    title: "Employee Rights & Workplace Culture",
    description: "Your employee rights and workplace culture policies",
    weight: 15,
    fields: [
      {
        id: "equalOpportunityPolicy",
        label: "Equal Opportunity Employment (EOE) Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or sign our template",
      },
      {
        id: "fairWagePractices",
        label: "Proof of Fair Wage Practices",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Payroll summary or self-declaration",
      },
      {
        id: "mentalHealthPrograms",
        label: "Mental Health Program or Conflict Resolution Training",
        type: "textarea",
        required: true,
        placeholder: "Describe your mental health programs...",
        helpText: "Mental health program or conflict resolution training",
      },
      {
        id: "whistleblowerProtectionPolicy",
        label: "Whistleblower Protection Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or sign our template",
      },
      // Optional fields (+5%)
      {
        id: "internalMediationProgram",
        label: "Internal Mediation or Peace Education Program (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your internal mediation programs...",
        helpText: "Internal mediation or peace education program",
      },
      {
        id: "employeeSatisfactionSurvey",
        label: "Employee Satisfaction Survey Summary (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload survey summary or use our survey tool",
      },
    ],
  },
  {
    id: "socialImpactCommunityEngagement",
    title: "Social Impact & Community Engagement",
    description: "Your community engagement and social impact initiatives",
    weight: 10,
    fields: [
      {
        id: "csrImpactReport",
        label: "CSR or Impact Report (Annual)",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 30 * 1024 * 1024, // 30MB
        helpText: "Upload your annual CSR or impact report",
      },
      {
        id: "humanitarianDonations",
        label: "Records of Donations to Humanitarian/Peace Initiatives",
        type: "textarea",
        required: true,
        placeholder: "Describe your humanitarian donations and initiatives...",
        helpText: "Records of donations to humanitarian/peace initiatives",
      },
      {
        id: "employeeVolunteerPrograms",
        label: "Employee Volunteer Programs",
        type: "textarea",
        required: true,
        placeholder: "Describe volunteer hours and program initiatives...",
        helpText: "Employee volunteer mandatory hours or programs",
      },
      // Optional fields (+5%)
      {
        id: "peacebuildingNgoPartnerships",
        label: "Partnerships with Peacebuilding NGOs (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your peacebuilding NGO partnerships...",
        helpText: "Partnerships with peacebuilding NGOs",
      },
    ],
  },
  {
    id: "environmentalResponsibility",
    title: "Environmental Responsibility",
    description: "Your environmental policies and sustainability practices",
    weight: 5,
    fields: [
      {
        id: "carbonFootprintDisclosure",
        label: "Carbon Footprint Disclosure or Sustainability Plan",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 15 * 1024 * 1024, // 15MB
        helpText: "Upload your disclosure or sign our sustainability plan",
      },
      // Optional fields (+5%)
      {
        id: "peaceLinkedEnvironmentalInitiatives",
        label: "Peace-Linked Environmental Initiatives (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your peace-linked environmental initiatives...",
        helpText: "e.g., indigenous land protection",
      },
      {
        id: "greenBusinessCertification",
        label: "Green Business or Equivalent Certification (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".jpg", ".png"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your green business certification",
      },
    ],
  },
  {
    id: "transparencyPublicAccountability",
    title: "Transparency & Public Accountability",
    description: "Your transparency practices and public accountability",
    weight: 5,
    fields: [
      {
        id: "universalValuesCommitment",
        label: "Foundation in Universal Values",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to universal values is...",
        helpText:
          "Share how your organization upholds universal values such as human dignity, justice, equality, and protection of human rights",
      },
      {
        id: "respectLifeNonViolence",
        label: "Respect for Life and Non-Violence",
        type: "textarea",
        required: true,
        placeholder: "Our pledge to respect life and non-violence is...",
        helpText:
          "Describe how your company ensures respect for life and promotes non-violence in operations, policies, and workplace culture",
      },
      {
        id: "justStableSocieties",
        label: "Promoting Just and Stable Societies",
        type: "textarea",
        required: true,
        placeholder: "Our role in fostering just and stable societies is...",
        helpText:
          "Explain how your business contributes to fairness, trust, and stability through just laws, equitable structures, and practices",
      },
      {
        id: "educationForPeace",
        label: "Education for Peace",
        type: "textarea",
        required: true,
        placeholder: "Our efforts in education for peace are...",
        helpText:
          "Detail how your company invests in education, training, or awareness that promotes tolerance, cross-cultural understanding, and sustainable development",
      },
      {
        id: "ethicalConductInAction",
        label: "Ethical Conduct in Action",
        type: "textarea",
        required: true,
        placeholder: "Our ethical conduct in practice is...",
        helpText:
          "Provide examples of how your organization upholds ethical standards in everyday operations",
      },
      {
        id: "rejectionViolenceHate",
        label: "Rejection of Violence and Hate",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to reject violence and hate is...",
        helpText:
          "Confirm that your business explicitly rejects violence, terrorism, and hate speech",
      },
      {
        id: "internationalCooperationLaw",
        label: "International Cooperation and Law",
        type: "textarea",
        required: true,
        placeholder: "Our approach to international cooperation and law is...",
        helpText:
          "Explain how your company respects international law and engages in cooperation to resolve disputes peacefully",
      },
      {
        id: "humanCenteredDevelopment",
        label: "Human-Centered Development",
        type: "textarea",
        required: true,
        placeholder: "Our focus on human-centered development is...",
        helpText:
          "Share how your business prioritizes people's well-being, opportunities, and inclusion over profit alone",
      },
      {
        id: "transparentFundingDisclosures",
        label: "Transparent Funding Disclosures",
        type: "textarea",
        required: true,
        placeholder: "Describe your transparent funding disclosures...",
        helpText: "Transparent funding disclosures",
      },
      {
        id: "externalReviewAgreement",
        label: "Agree to External Review by Pledge4Peace on Request",
        type: "select",
        required: true,
        options: ["Yes", "No"],
        helpText: "Agreement to external review",
      },
      // Optional fields (+5%)
      {
        id: "independentThirdPartyAudits",
        label: "Independent Third-Party Audits Published Publicly (Optional)",
        type: "textarea",
        required: false,
        placeholder: "List your public audits...",
        helpText: "Independent third-party audits published publicly",
      },
    ],
  },
  {
    id: "globalPeaceCommitmentConflictAvoidance",
    title: "Global Peace Commitment & Conflict Avoidance",
    description: "Your commitment to global peace and conflict avoidance",
    weight: 5,
    fields: [
      {
        id: "noArmsTiesDeclaration",
        label:
          "Declaration of No Ties with Arms Industries or Sanctioned Regimes",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Sign the declaration",
      },
      {
        id: "peaceInitiativesSupport",
        label: "Evidence of Support for Peace Initiatives",
        type: "textarea",
        required: true,
        placeholder: "Describe your support for peace initiatives...",
        helpText: "Local or international peace initiatives",
      },
      // Optional fields (+5%)
      {
        id: "peacebuildingAdvocacy",
        label:
          "Public Advocacy for Peacebuilding or Mediation Efforts (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your peacebuilding and mediation advocacy...",
        helpText: "Add public links to publications",
      },
    ],
  },
  {
    id: "publicFeedbackExternalReporting",
    title: "Public Feedback & External Reporting System",
    description: "Your public reputation and feedback management",
    weight: 5,
    fields: [
      {
        id: "complaintResolutionProcess",
        label: "Process Documentation for Complaint Resolution",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload process documentation or opt in to use our mediation",
      },
      {
        id: "resolutionChannels",
        label:
          "Resolution Channels Available for Everyone and Publicly Accessible",
        type: "textarea",
        required: true,
        placeholder: "Provide links to your resolution channels...",
        helpText: "Add any link where you display your resolution channels",
      },
      // Optional fields (+5%)
      {
        id: "googleWebsiteReviews",
        label: "Google/Website Reviews Link (Optional)",
        type: "url",
        required: false,
        placeholder: "https://google.com/maps/yourcompany",
        helpText: "Provide link to your Google Reviews or website reviews",
      },
    ],
  },
];

// Main function to get questionnaire sections based on company size
export function getQuestionnaireSections(
  employeeCount: number
): QuestionnaireSection[] {
  const size = getCompanySize(employeeCount);

  switch (size) {
    case "small":
      return SMALL_BUSINESS_SECTIONS;
    case "medium":
      return MEDIUM_BUSINESS_SECTIONS;
    case "large":
      return LARGE_BUSINESS_SECTIONS;
    default:
      return SMALL_BUSINESS_SECTIONS; // Default to small business
  }
}

// Helper functions
export const getTotalSections = (employeeCount: number) =>
  getQuestionnaireSections(employeeCount).length;
export const getRequiredSections = (employeeCount: number) =>
  getQuestionnaireSections(employeeCount).filter((s) => !s.isOptional);
export const getSectionById = (id: string, employeeCount: number) =>
  getQuestionnaireSections(employeeCount).find((s) => s.id === id);
export const getTotalWeight = (employeeCount: number) =>
  getQuestionnaireSections(employeeCount).reduce((sum, s) => sum + s.weight, 0);

// Document types mapping
export const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  peacePledgeDeclaration: "peace_pledge_declaration",
  hrHandbook: "hr_handbook",
  supplierSelfDeclaration: "supplier_self_declaration",
  donationReceipts: "donation_receipts",
  diversityBreakdown: "diversity_breakdown",
  fairWagePractices: "fair_wage_practices",
  antiHarassmentPolicy: "anti_harassment_policy",
  employeeSatisfactionSurvey: "employee_satisfaction_survey",
  sustainableSourcingStatement: "sustainable_sourcing_statement",
  recyclingRenewableInitiatives: "recycling_renewable_initiatives",
  noArmsTiesDeclaration: "no_arms_ties_declaration",
  peaceInitiativesSupport: "peace_initiatives_support",
  googleWebsiteReviews: "google_website_reviews",
  complaintResolutionProcess: "complaint_resolution_process",
  boardApprovedPeacePolicy: "board_approved_peace_policy",
  beneficialOwnershipPolicy: "beneficial_ownership_policy",
  supplierVendorCodeOfConduct: "supplier_vendor_code_of_conduct",
  noLobbyingDeclaration: "no_lobbying_declaration",
  esgReport: "esg_report",
  equalOpportunityPolicy: "equal_opportunity_policy",
  whistleblowerProtectionPolicy: "whistleblower_protection_policy",
  mentalHealthPrograms: "mental_health_programs",
  ngoPartnerships: "ngo_partnerships",
  csrReport: "csr_report",
  carbonFootprintDisclosure: "carbon_footprint_disclosure",
  greenBusinessCertification: "green_business_certification",
  externalReviewAgreement: "external_review_agreement",
  thirdPartyPeerReview: "third_party_peer_review",
  peacebuildingAdvocacy: "peacebuilding_advocacy",
  resolutionChannels: "resolution_channels",
  fullEsgReport: "full_esg_report",
  internalMediationProgram: "internal_mediation_program",
  csrImpactReport: "csr_impact_report",
  humanitarianDonations: "humanitarian_donations",
  peaceLinkedEnvironmentalInitiatives: "peace_linked_environmental_initiatives",
  transparentFundingDisclosures: "transparent_funding_disclosures",
  independentThirdPartyAudits: "independent_third_party_audits",
};
