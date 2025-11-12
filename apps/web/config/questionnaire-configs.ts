import { QuestionnaireSection } from "@/types/questionnaire";
import { COUNTRIES } from "@/lib/utils/peace-seal-utils";

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
      id: "contactName",
      label: "Contact Name",
      type: "text",
      required: true,
      placeholder: "Full name of person in charge",
      helpText:
        "Name of the person responsible for this Peace Seal application",
    },
    {
      id: "headquartersCountry",
      label: "Headquarters Country",
      type: "select",
      required: true,
      options: COUNTRIES,
    },
    {
      id: "countriesOfOperations",
      label: "Countries of Operations (Optional)",
      type: "textarea",
      required: false,
      placeholder: "e.g., United States, Canada, Mexico, United Kingdom",
      helpText:
        "List all countries where your organization operates (comma-separated)",
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
        hasTemplate: true,
        templateId: "template_peace_pledge_declaration",
        templateType: "simple",
        tooltipText:
          "By checking this box, you confirm that you are an authorized representative (CEO, Owner, or approved delegate) and that your organization formally commits to the Peace Seal values, including non-violence, justice, equality, ethical integrity, and human-centered practices. This declaration is a moral and operational commitment to lead responsibly and will guide your Peace Seal evaluation.",
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
        hasTemplate: true,
        templateId: "template_hr_handbook_small",
        templateType: "simple",
        tooltipText:
          "By checking this box or providing this information, you confirm that your organization has implemented, or will implement, an Employee Handbook that promotes fairness, safety, and inclusion. This handbook should reflect the Peace Seal values: respect, non-violence, integrity, equal opportunity, and community responsibility.",
      },
      {
        id: "ownershipStructure",
        label: "Ownership Structure",
        type: "select",
        required: true,
        options: [
          "Sole Proprietorship (single owner)",
          "Partnership (two or more owners)",
          "Limited Partnership (LP)",
          "Limited Liability Partnership (LLP)",
          "Corporation (owners are shareholders with limited liability)",
          "Limited Liability Company (LLC) (blend of partnership and corporate features)",
          "Nonprofit Corporation",
          "Cooperative",
          "Other",
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
        hasTemplate: true,
        templateId: "template_supplier_self_declaration",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm that your organization requires all suppliers to follow ethical, non-violent, and transparent business practices. This includes avoiding any ties to arms manufacturing, conflict-linked industries, sanctioned entities, or unethical sourcing.",
      },
      {
        id: "companyValuesStatement",
        label: "Public Statement of Company Values",
        type: "file", // Keep for backward compatibility
        required: true,
        fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
        hasTemplate: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your public statement of values or provide text",
        tooltipText:
          "Upload or link to your organization's public statement of values showing your commitment to ethics, inclusion, peace, and social responsibility.",
        inputModes: [
          {
            kind: "textarea",
            label: "Text",
            placeholder: "Provide your public statement of company values...",
            helpText: "From website, brochure, or press release",
          },
          {
            kind: "file",
            label: "Upload",
            fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
            maxFileSize: 10 * 1024 * 1024,
            helpText: "Upload your public statement of values",
          },
          {
            kind: "url",
            label: "Link",
            placeholder: "https://example.com/values",
            helpText: "Link to your public statement of values",
          },
        ],
        completionMode: "any",
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
        tooltipText:
          "Provide a brief overview of your team’s diversity — such as gender, age, or other relevant representation data. This helps assess inclusion and equity within your organization while supporting transparency in workplace diversity. Only general, non-personal data is required. ",
      },
      {
        id: "diversityBreakdown",
        label: "Simple Diversity Breakdown (Optional)",
        type: "file", // Keep for backward compatibility
        required: false,
        fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your diversity breakdown or describe it",
        tooltipText:
          "Provide a brief overview of your team's diversity — such as gender, age, or other relevant representation data. This helps assess inclusion and equity within your organization while supporting transparency in workplace diversity. Only general, non-personal data is required. ",
        tooltipLink: "https://www.pledge4peace.org/diversity-breakdown",
        inputModes: [
          {
            kind: "textarea",
            label: "Text",
            placeholder: "Describe your team's diversity breakdown...",
            helpText:
              "Provide a brief overview of your team's diversity — such as gender, age, or other relevant representation data",
          },
          {
            kind: "file",
            label: "Upload",
            fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
            maxFileSize: 10 * 1024 * 1024,
            helpText: "Upload your diversity breakdown",
          },
        ],
        completionMode: "any",
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
        hasTemplate: true,
        templateId: "template_fair_wage_declaration",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm your organization’s commitment to fair and ethical pay. This includes a living wage, ensuring equal pay for equal work, maintaining transparency in compensation, offering fair benefits, and rejecting all forms of labor exploitation. This declaration supports dignity, justice, and peace in the workplace.",
      },
      {
        id: "antiHarassmentPolicy",
        label: "Signed Anti-Harassment and Anti-Discrimination Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your policy or sign our template",
        hasTemplate: true,
        templateId: "template_anti_harassment_policy",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm that your organization upholds a zero-tolerance policy for harassment and discrimination. This includes providing equal opportunity for all, ensuring a safe and respectful work environment, protecting employees who report misconduct, and taking prompt action to prevent and address violations.",
      },
      // Optional fields (+5%)
      {
        id: "employeeSatisfactionSurvey",
        label: "Employee Satisfaction Survey Summary (Optional)",
        type: "file",
        required: false,
        helpText:
          "Upload survey summary or send survey invitations to employees",
        tooltipText:
          "This survey helps your employees share honest, anonymous feedback about their workplace experience. It measures satisfaction, fairness, and culture, and sends them a secure link to rate your organization's Peace Seal profile.",
        inputModes: [
          {
            kind: "file",
            label: "Upload File",
            fileTypes: [".pdf", ".doc", ".docx"],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            helpText: "Upload a survey summary document",
          },
          {
            kind: "survey",
            label: "Send Survey Invitations",
            helpText:
              "Send email invitations to employees to complete the survey",
          },
        ],
        completionMode: "any",
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
        tooltipText:
          "Provide proof of at least one community contribution, such as a local donation, volunteering initiative, or partnership that supports social good. This can be a description with links to your initiatives or images that serve as proof.",
        inputModes: [
          {
            kind: "textarea",
            label: "Text",
            placeholder: "Describe your community contribution...",
            helpText: "Describe your community contribution...",
          },
          {
            kind: "file",
            label: "Upload",
            fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
            maxFileSize: 10 * 1024 * 1024,
            helpText: "Upload your community contribution proof",
          },
        ],
        completionMode: "any",
      },
      // Optional fields (+5%)
      {
        id: "employeeVolunteerPrograms",
        label: "Employee Volunteer Programs (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe volunteer hours and program initiatives...",
        helpText: "Employee volunteer mandatory hours or programs",
        tooltipText:
          "Describe your organization’s employee volunteer program, including any required service hours or community initiatives staff participate in. This highlights how your company fosters civic responsibility, teamwork, and social impact through organized volunteer engagement.",
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
        hasTemplate: true,
        templateId: "template_sustainable_sourcing",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization commits to sourcing materials responsibly and managing waste sustainably. This includes using ethical, conflict-free suppliers, reducing single-use items, promoting recycling, and minimizing environmental harm.",
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
        tooltipText:
          "Describe any recycling, renewable energy, or environmental initiatives your organization participates in locally, such as community clean-ups, renewable energy partnerships, or recycling programs.",
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
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "respectLifeNonViolence",
        label: "Respect for Life and Non-Violence",
        type: "textarea",
        required: true,
        placeholder: "Our pledge to respect life and non-violence is...",
        helpText:
          "Describe how your company ensures respect for life and promotes non-violence in operations, policies, and workplace culture",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "justStableSocieties",
        label: "Promoting Just and Stable Societies",
        type: "textarea",
        required: true,
        placeholder: "Our role in fostering just and stable societies is...",
        helpText:
          "Explain how your business contributes to fairness, trust, and stability through just laws, equitable structures, and practices",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "educationForPeace",
        label: "Education for Peace",
        type: "textarea",
        required: true,
        placeholder: "Our efforts in education for peace are...",
        helpText:
          "Detail how your company invests in education, training, or awareness that promotes tolerance, cross-cultural understanding, and sustainable development",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "ethicalConductInAction",
        label: "Ethical Conduct in Action",
        type: "textarea",
        required: true,
        placeholder: "Our ethical conduct in practice is...",
        helpText:
          "Provide examples of how your organization upholds ethical standards in everyday operations",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "rejectionViolenceHate",
        label: "Rejection of Violence and Hate",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to reject violence and hate is...",
        helpText:
          "Confirm that your business explicitly rejects violence, terrorism, and hate speech",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "internationalCooperationLaw",
        label: "International Cooperation and Law",
        type: "textarea",
        required: true,
        placeholder: "Our approach to international cooperation and law is...",
        helpText:
          "Explain how your company respects international law and engages in cooperation to resolve disputes peacefully",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "humanCenteredDevelopment",
        label: "Human-Centered Development",
        type: "textarea",
        required: true,
        placeholder: "Our focus on human-centered development is...",
        helpText:
          "Share how your business prioritizes people's well-being, opportunities, and inclusion over profit alone",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      // Optional fields (+5%)
      {
        id: "externalReviewAgreement",
        label: "Agree to External Review by Pledge4Peace on Request",
        type: "select",
        required: true,
        options: ["Yes", "No"],
        helpText: "Agreement to external review",
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
        hasTemplate: true,
        templateId: "template_no_arms_ties",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization confirms it does not engage in or support the arms industry, conflict-related trade, or any partnerships with sanctioned regimes involved in human rights violations.",
      },
      // Optional fields (+5%)
      {
        id: "peaceInitiativesSupport",
        label: "Evidence of Support for Peace Initiatives (Optional)",
        type: "file",
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        required: false,
        helpText: "Local or international peace initiatives",
        tooltipText:
          "Describe any local or international peace initiatives your organization has supported, such as donations, partnerships, sponsorships, or participation in campaigns promoting dialogue, reconciliation, or humanitarian aid.",
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
        tooltipText:
          "Provide a link to your organization’s public feedback or review page, such as Google Reviews, a feedback form, or a website comment portal.",
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
        hasTemplate: true,
        templateId: "template_complaint_resolution",
        templateType: "simple",
        tooltipText:
          "Provide documentation that your organization has a clear and fair process for handling complaints from employees, customers, or partners. Describe how complaints are received, reviewed, and resolved, including steps for documentation, timelines, and escalation. ",
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
        hasTemplate: true,
        templateId: "template_peace_pledge_declaration",
        templateType: "simple",
        tooltipText:
          "By checking this box, you confirm that you are an authorized representative (CEO, Owner, or approved delegate) and that your organization formally commits to the Peace Seal values, including non-violence, justice, equality, ethical integrity, and human-centered practices. This declaration is a moral and operational commitment to lead responsibly and will guide your Peace Seal evaluation.",
      },
      {
        id: "boardApprovedPeacePolicy",
        label: "Board-Approved Peace & Human Rights Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our sample template",
        hasTemplate: true,
        templateId: "template_board_peace_policy",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization commits to protect human rights, promote nonviolence, and uphold ethical business practices. Upload the policies describing how your company integrates peace, justice, and community engagement into its operations and governance.",
      },
      {
        id: "beneficialOwnershipPolicy",
        label: "Anti-corruption: Company Beneficial Ownership Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our template",
        hasTemplate: true,
        templateId: "template_beneficial_ownership",
        templateType: "beneficial-ownership",
        tooltipText:
          "Upload your company’s policy outlining transparency in ownership and anti-corruption practices. This confirms that your organization discloses who owns or controls it, ensuring ethical governance and accountability. Or use our template by completing the pop-up form with ownership details. All listed individuals must review and agree to the policy before submission.",
      },
      {
        id: "supplierVendorCodeOfConduct",
        label: "Supplier/Vendor Code of Conduct",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your code of conduct or sign our template",
        hasTemplate: true,
        templateId: "template_supplier_code_of_conduct",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm that your organization requires all suppliers to follow ethical, non-violent, and transparent business practices. This includes avoiding any ties to arms manufacturing, conflict-linked industries, sanctioned entities, or unethical sourcing.",
      },
      {
        id: "companyValuesStatement",
        label: "Public Statement of Company Values",
        type: "file", // Keep for backward compatibility
        required: true,
        fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
        hasTemplate: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your public statement of values or provide text",
        tooltipText:
          "Upload or link to your organization's public statement of values showing your commitment to ethics, inclusion, peace, and social responsibility.",
        inputModes: [
          {
            kind: "textarea",
            label: "Text",
            placeholder: "Provide your public statement of company values...",
            helpText: "From website, brochure, or press release",
          },
          {
            kind: "file",
            label: "Upload",
            fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
            maxFileSize: 10 * 1024 * 1024,
            helpText: "Upload your public statement of values",
          },
          {
            kind: "url",
            label: "Link",
            placeholder: "https://example.com/values",
            helpText: "Link to your public statement of values",
          },
        ],
        completionMode: "any",
      },
      {
        id: "noLobbyingDeclaration",
        label: "Declaration of No Lobbying for War/Conflict Policies",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your declaration or sign our template",
        hasTemplate: true,
        templateId: "template_no_lobbying",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm that your organization requires all suppliers to follow ethical, non-violent, and transparent business practices. This includes avoiding any ties to arms manufacturing, conflict-linked industries, sanctioned entities, or unethical sourcing. ",
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
        tooltipText:
          "Upload your organization’s ESG (Environmental, Social, and Governance) report or a corporate ethics statement. This document should outline your company’s commitments to sustainability, ethical conduct, human rights, and transparent governance.",
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
        hasTemplate: true,
        templateId: "template_equal_opportunity",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm your organization’s commitment to fair and ethical pay. This includes a living wage, ensuring equal pay for equal work, maintaining transparency in compensation, offering fair benefits, and rejecting all forms of labor exploitation. This declaration supports dignity, justice, and peace in the workplace.",
      },
      {
        id: "whistleblowerProtectionPolicy",
        label: "Whistleblower Protection Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or sign our template",
        hasTemplate: true,
        templateId: "template_whistleblower_protection",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization ensures that it protects anyone who reports misconduct, corruption, or unethical behavior from retaliation. It guarantees confidentiality, fair investigation, and accountability while fostering a transparent, peace-centered work culture.",
      },
      {
        id: "fairWagePractices",
        label: "Proof of Fair Wage Practices",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Payroll summary or self-declaration",
        tooltipText:
          "This declaration should confirm your organization’s commitment to pay all employees fairly and ethically. It ensures wages meet or exceed living standards, promotes equal pay for equal work, and prohibits exploitation or wage discrimination.",
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
        tooltipText:
          "Describe any programs your organization offers to support employees’ mental health or train them in peaceful conflict resolution. This can include workshops, counseling services, mindfulness sessions, mediation training, or partnerships with mental health professionals. ",
      },
      {
        id: "employeeSatisfactionSurvey",
        label: "Employee Satisfaction Survey Summary (Optional)",
        type: "file",
        required: false,
        helpText:
          "Upload survey summary or send survey invitations to employees",
        tooltipText:
          "This survey helps your employees share honest, anonymous feedback about their workplace experience. It measures satisfaction, fairness, and culture, and sends them a secure link to rate your organization's Peace Seal profile.",
        inputModes: [
          {
            kind: "file",
            label: "Upload File",
            fileTypes: [".pdf", ".doc", ".docx"],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            helpText: "Upload a survey summary document",
          },
          {
            kind: "survey",
            label: "Send Survey Invitations",
            helpText:
              "Send email invitations to employees to complete the survey",
          },
        ],
        completionMode: "any",
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
        tooltipText:
          "Provide proof of at least one community contribution, such as a local donation, volunteering initiative, or partnership that supports social good. This can be a description with links to your initiatives or images that serve as proof. ",
      },
      {
        id: "employeeVolunteerPrograms",
        label: "Employee Volunteer Programs",
        type: "textarea",
        required: true,
        placeholder: "Describe volunteer hours and program initiatives...",
        helpText: "Employee volunteer mandatory hours or programs",
        tooltipText:
          "Describe your organization’s employee volunteer program, including any required service hours or community initiatives staff participate in. This highlights how your company fosters civic responsibility, teamwork, and social impact through organized volunteer engagement.",
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
        tooltipText:
          "Upload your organization’s Corporate Social Responsibility (CSR) report or any document summarizing your community, environmental, or ethical initiatives. A basic version can include information on sustainability actions, donations, employee welfare, or volunteer programs.",
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
        hasTemplate: true,
        templateId: "template_sustainable_sourcing",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization commits to sourcing materials responsibly and managing waste sustainably. This includes using ethical, conflict-free suppliers, reducing single-use items, promoting recycling, and minimizing environmental harm.",
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
        tooltipText:
          "Upload any environmental or ethical certification your organization has earned, such as Green Business, B Corp, Fair Trade, LEED, or similar programs.",
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
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "respectLifeNonViolence",
        label: "Respect for Life and Non-Violence",
        type: "textarea",
        required: true,
        placeholder: "Our pledge to respect life and non-violence is...",
        helpText:
          "Describe how your company ensures respect for life and promotes non-violence in operations, policies, and workplace culture",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "justStableSocieties",
        label: "Promoting Just and Stable Societies",
        type: "textarea",
        required: true,
        placeholder: "Our role in fostering just and stable societies is...",
        helpText:
          "Explain how your business contributes to fairness, trust, and stability through just laws, equitable structures, and practices",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "educationForPeace",
        label: "Education for Peace",
        type: "textarea",
        required: true,
        placeholder: "Our efforts in education for peace are...",
        helpText:
          "Detail how your company invests in education, training, or awareness that promotes tolerance, cross-cultural understanding, and sustainable development",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "ethicalConductInAction",
        label: "Ethical Conduct in Action",
        type: "textarea",
        required: true,
        placeholder: "Our ethical conduct in practice is...",
        helpText:
          "Provide examples of how your organization upholds ethical standards in everyday operations",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "rejectionViolenceHate",
        label: "Rejection of Violence and Hate",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to reject violence and hate is...",
        helpText:
          "Confirm that your business explicitly rejects violence, terrorism, and hate speech",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "internationalCooperationLaw",
        label: "International Cooperation and Law",
        type: "textarea",
        required: true,
        placeholder: "Our approach to international cooperation and law is...",
        helpText:
          "Explain how your company respects international law and engages in cooperation to resolve disputes peacefully",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "humanCenteredDevelopment",
        label: "Human-Centered Development",
        type: "textarea",
        required: true,
        placeholder: "Our focus on human-centered development is...",
        helpText:
          "Share how your business prioritizes people's well-being, opportunities, and inclusion over profit alone",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "externalReviewAgreement",
        label: "Agree to External Review by Pledge4Peace on Request",
        type: "select",
        required: true,
        options: ["Yes", "No"],
        helpText: "Agreement to external review",
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
        hasTemplate: true,
        templateId: "template_no_arms_ties",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization confirms it does not engage in or support the arms industry, conflict-related trade, or any partnerships with sanctioned regimes involved in human rights violations.",
      },
      {
        id: "peaceInitiativesSupport",
        label: "Evidence of Support for Peace Initiatives",
        type: "textarea",
        required: true,
        placeholder: "Describe your support for peace initiatives...",
        helpText: "Local or international peace initiatives",
        tooltipText:
          "Describe any local or international peace initiatives your organization has supported, such as donations, partnerships, sponsorships, or participation in campaigns promoting dialogue, reconciliation, or humanitarian aid.",
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
        tooltipText:
          "Describe or upload evidence of your organization’s public advocacy for peacebuilding or mediation efforts. This can include articles, press releases, social media campaigns, public statements, or partnerships promoting dialogue, reconciliation, or conflict prevention.",
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
        hasTemplate: true,
        templateId: "template_complaint_resolution",
        templateType: "simple",
        tooltipText:
          "Provide documentation that your organization has a clear and fair process for handling complaints from employees, customers, or partners. Describe how complaints are received, reviewed, and resolved, including steps for documentation, timelines, and escalation.",
      },
      {
        id: "resolutionChannels",
        label:
          "Resolution Channels Available for Everyone and Publicly Accessible",
        type: "textarea",
        required: true,
        placeholder: "Provide links to your resolution channels...",
        helpText: "Add any link where you display your resolution channels",
        tooltipText:
          "Provide links or details about your organization’s public resolution channels, where employees, customers, or community members can raise concerns, file complaints, or seek mediation. This may include online forms, contact pages, grievance portals, or published procedures outlining how conflicts or complaints are handled transparently.",
      },
      // Optional fields (+5%)
      {
        id: "googleWebsiteReviews",
        label: "Google/Website Reviews Link (Optional)",
        type: "url",
        required: false,
        placeholder: "https://google.com/maps/yourcompany",
        helpText: "Provide link to your Google Reviews or website reviews",
        tooltipText:
          "Provide a link to your organization’s public feedback or review page, such as Google Reviews, a feedback form, or a website comment portal. This demonstrates transparency and allows the public or customers to share their experiences and hold the organization accountable.",
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
        hasTemplate: true,
        templateId: "template_peace_pledge_declaration",
        templateType: "simple",
        tooltipText:
          "By checking this box, you confirm that you are an authorized representative (CEO, Owner, or approved delegate) and that your organization formally commits to the Peace Seal values, including non-violence, justice, equality, ethical integrity, and human-centered practices. This declaration is a moral and operational commitment to lead responsibly and will guide your Peace Seal evaluation.",
      },
      {
        id: "boardApprovedPeacePolicy",
        label: "Board-Approved Peace & Human Rights Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our sample template",
        hasTemplate: true,
        templateId: "template_board_peace_policy",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization commits to protect human rights, promote nonviolence, and uphold ethical business practices. Upload the policies describing how your company integrates peace, justice, and community engagement into its operations and governance.",
      },
      {
        id: "beneficialOwnershipPolicy",
        label: "Anti-corruption: Company Beneficial Ownership Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or use our template",
        hasTemplate: true,
        templateId: "template_beneficial_ownership",
        templateType: "beneficial-ownership",
        tooltipText:
          "Upload your company’s policy outlining transparency in ownership and anti-corruption practices. This confirms that your organization discloses who owns or controls it, ensuring ethical governance and accountability. Or use our template by completing the pop-up form with ownership details. All listed individuals must review and agree to the policy before submission.",
      },
      {
        id: "supplierVendorCodeOfConduct",
        label: "Supplier/Vendor Code of Conduct",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your code of conduct or sign our template",
        hasTemplate: true,
        templateId: "template_supplier_code_of_conduct",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm that your organization requires all suppliers to follow ethical, non-violent, and transparent business practices. This includes avoiding any ties to arms manufacturing, conflict-linked industries, sanctioned entities, or unethical sourcing.",
      },
      {
        id: "companyValuesStatement",
        label: "Public Statement of Company Values",
        type: "file", // Keep for backward compatibility
        required: true,
        fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
        hasTemplate: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your public statement of values or provide text",
        tooltipText:
          "Upload or link to your organization's public statement of values showing your commitment to ethics, inclusion, peace, and social responsibility.",
        inputModes: [
          {
            kind: "textarea",
            label: "Text",
            placeholder: "Provide your public statement of company values...",
            helpText: "From website, brochure, or press release",
          },
          {
            kind: "file",
            label: "Upload",
            fileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
            maxFileSize: 10 * 1024 * 1024,
            helpText: "Upload your public statement of values",
          },
          {
            kind: "url",
            label: "Link",
            placeholder: "https://example.com/values",
            helpText: "Link to your public statement of values",
          },
        ],
        completionMode: "any",
      },
      {
        id: "noLobbyingDeclaration",
        label: "Declaration of No Lobbying for War/Conflict Policies",
        type: "file",
        required: true,
        fileTypes: [".pdf"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        helpText: "Upload your declaration or sign our template",
        hasTemplate: true,
        templateId: "template_no_lobbying",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm that your organization requires all suppliers to follow ethical, non-violent, and transparent business practices. This includes avoiding any ties to arms manufacturing, conflict-linked industries, sanctioned entities, or unethical sourcing.",
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
        tooltipText:
          "Upload your organization’s ESG (Environmental, Social, and Governance) report or a corporate ethics statement. This document should outline your company’s commitments to sustainability, ethical conduct, human rights, and transparent governance.",
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
        hasTemplate: true,
        templateId: "template_equal_opportunity",
        templateType: "simple",
        tooltipText:
          "By providing this information, you confirm your organization’s commitment to fair and ethical pay. This includes a living wage, ensuring equal pay for equal work, maintaining transparency in compensation, offering fair benefits, and rejecting all forms of labor exploitation. This declaration supports dignity, justice, and peace in the workplace.",
      },
      {
        id: "fairWagePractices",
        label: "Proof of Fair Wage Practices",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Payroll summary or self-declaration",
        hasTemplate: true,
        templateId: "template_fair_wage_declaration",
        templateType: "simple",
        tooltipText:
          "This declaration should confirm your organization’s commitment to pay all employees fairly and ethically. It ensures wages meet or exceed living standards, promotes equal pay for equal work, and prohibits exploitation or wage discrimination.",
      },
      {
        id: "mentalHealthPrograms",
        label: "Mental Health Program or Conflict Resolution Training",
        type: "textarea",
        required: true,
        placeholder: "Describe your mental health programs...",
        helpText: "Mental health program or conflict resolution training",
        tooltipText:
          "By providing this information, your organization ensures that it protects anyone who reports misconduct, corruption, or unethical behavior from retaliation. It guarantees confidentiality, fair investigation, and accountability while fostering a transparent, peace-centered work culture.",
      },
      {
        id: "whistleblowerProtectionPolicy",
        label: "Whistleblower Protection Policy",
        type: "file",
        required: true,
        fileTypes: [".pdf", ".doc", ".docx"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your policy or sign our template",
        hasTemplate: true,
        templateId: "template_whistleblower_protection",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization ensures that it protects anyone who reports misconduct, corruption, or unethical behavior from retaliation. It guarantees confidentiality, fair investigation, and accountability while fostering a transparent, peace-centered work culture.",
      },
      // Optional fields (+5%)
      {
        id: "internalMediationProgram",
        label: "Internal Mediation or Peace Education Program (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your internal mediation programs...",
        helpText: "Internal mediation or peace education program",
        tooltipText:
          "Describe your organization’s internal mediation or peace education program, initiatives that help employees resolve conflicts peacefully or learn about communication, empathy, and nonviolent problem-solving. Include details such as training sessions, workshops, peer mediation systems, or educational activities that promote a culture of peace within your workplace.",
      },
      {
        id: "employeeSatisfactionSurvey",
        label: "Employee Satisfaction Survey Summary (Optional)",
        type: "file",
        required: false,
        helpText:
          "Upload survey summary or send survey invitations to employees",
        tooltipText:
          "This survey helps your employees share honest, anonymous feedback about their workplace experience. It measures satisfaction, fairness, and culture, and sends them a secure link to rate your organization's Peace Seal profile.",
        inputModes: [
          {
            kind: "file",
            label: "Upload File",
            fileTypes: [".pdf", ".doc", ".docx"],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            helpText: "Upload a survey summary document",
          },
          {
            kind: "survey",
            label: "Send Survey Invitations",
            helpText:
              "Send email invitations to employees to complete the survey",
          },
        ],
        completionMode: "any",
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
        tooltipText:
          "Upload your organization’s annual social impact or community engagement report. This document should summarize your initiatives, partnerships, and measurable outcomes that positively impact society, such as volunteering, donations, sustainability projects, or inclusion programs. If no formal report exists, you may upload a summary outlining your key community contributions for the year.",
      },
      {
        id: "humanitarianDonations",
        label: "Records of Donations to Humanitarian/Peace Initiatives",
        type: "textarea",
        required: true,
        placeholder: "Describe your humanitarian donations and initiatives...",
        helpText: "Records of donations to humanitarian/peace initiatives",
        tooltipText:
          "Provide proof of at least one community contribution, such as a local donation, volunteering initiative, or partnership that supports social good. This can be a description with links to your initiatives or images that serve as proof.",
      },
      {
        id: "employeeVolunteerPrograms",
        label: "Employee Volunteer Programs",
        type: "textarea",
        required: true,
        placeholder: "Describe volunteer hours and program initiatives...",
        helpText: "Employee volunteer mandatory hours or programs",
        tooltipText:
          "Describe your organization’s employee volunteer program, including any required service hours or community initiatives staff participate in. This highlights how your company fosters civic responsibility, teamwork, and social impact through organized volunteer engagement.",
      },
      // Optional fields (+5%)
      {
        id: "peacebuildingNgoPartnerships",
        label: "Partnerships with Peacebuilding NGOs (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your peacebuilding NGO partnerships...",
        helpText: "Partnerships with peacebuilding NGOs",
        tooltipText:
          "Describe any partnerships or collaborations your organization has with peacebuilding, humanitarian, or social justice NGOs. This may include joint initiatives, donations, awareness campaigns, employee volunteer projects, or long-term cooperation agreements that promote dialogue, inclusion, or conflict resolution. You may also upload supporting documents or partnership proofs.",
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
        hasTemplate: true,
        templateId: "template_sustainable_sourcing",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization commits to sourcing materials responsibly and managing waste sustainably. This includes using ethical, conflict-free suppliers, reducing single-use items, promoting recycling, and minimizing environmental harm.",
      },
      // Optional fields (+5%)
      {
        id: "peaceLinkedEnvironmentalInitiatives",
        label: "Peace-Linked Environmental Initiatives (Optional)",
        type: "textarea",
        required: false,
        placeholder: "Describe your peace-linked environmental initiatives...",
        helpText: "e.g., indigenous land protection",
        tooltipText:
          "Describe your organization’s environmental initiatives that contribute to peace and social stability, such as protecting indigenous lands, supporting climate justice, conserving natural resources, or promoting sustainable practices that reduce conflict over the environment. Explain how these efforts foster harmony between communities and nature.",
      },
      {
        id: "greenBusinessCertification",
        label: "Green Business or Equivalent Certification (Optional)",
        type: "file",
        required: false,
        fileTypes: [".pdf", ".jpg", ".png"],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: "Upload your green business certification",
        tooltipText:
          "Upload any environmental or ethical certification your organization has earned, such as Green Business, B Corp, Fair Trade, LEED, or similar programs.",
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
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "respectLifeNonViolence",
        label: "Respect for Life and Non-Violence",
        type: "textarea",
        required: true,
        placeholder: "Our pledge to respect life and non-violence is...",
        helpText:
          "Describe how your company ensures respect for life and promotes non-violence in operations, policies, and workplace culture",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "justStableSocieties",
        label: "Promoting Just and Stable Societies",
        type: "textarea",
        required: true,
        placeholder: "Our role in fostering just and stable societies is...",
        helpText:
          "Explain how your business contributes to fairness, trust, and stability through just laws, equitable structures, and practices",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "educationForPeace",
        label: "Education for Peace",
        type: "textarea",
        required: true,
        placeholder: "Our efforts in education for peace are...",
        helpText:
          "Detail how your company invests in education, training, or awareness that promotes tolerance, cross-cultural understanding, and sustainable development",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "ethicalConductInAction",
        label: "Ethical Conduct in Action",
        type: "textarea",
        required: true,
        placeholder: "Our ethical conduct in practice is...",
        helpText:
          "Provide examples of how your organization upholds ethical standards in everyday operations",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "rejectionViolenceHate",
        label: "Rejection of Violence and Hate",
        type: "textarea",
        required: true,
        placeholder: "Our commitment to reject violence and hate is...",
        helpText:
          "Confirm that your business explicitly rejects violence, terrorism, and hate speech",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "internationalCooperationLaw",
        label: "International Cooperation and Law",
        type: "textarea",
        required: true,
        placeholder: "Our approach to international cooperation and law is...",
        helpText:
          "Explain how your company respects international law and engages in cooperation to resolve disputes peacefully",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "humanCenteredDevelopment",
        label: "Human-Centered Development",
        type: "textarea",
        required: true,
        placeholder: "Our focus on human-centered development is...",
        helpText:
          "Share how your business prioritizes people's well-being, opportunities, and inclusion over profit alone",
        tooltipText:
          "Complete all this eight short text fields (values, non-violence, justice, education, ethics, rejection of hate, cooperation, human-centered development). Each response 2–3 sentences, concrete examples preferred.",
      },
      {
        id: "transparentFundingDisclosures",
        label: "Transparent Funding Disclosures",
        type: "textarea",
        required: true,
        placeholder: "Describe your transparent funding disclosures...",
        helpText: "Transparent funding disclosures",
        tooltipText:
          "Explain how your organization ensures financial transparency, including how funding sources, donors, or sponsors are disclosed to the public. You can mention whether this information is available in annual reports, websites, or official filings, and how you guarantee that funds are used ethically and responsibly.",
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
        tooltipText:
          "Provide details about any independent financial or operational audits conducted by accredited third parties and made available to the public. Include links or references to published audit reports, summaries, or websites where stakeholders can review the findings.",
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
        hasTemplate: true,
        templateId: "template_no_arms_ties",
        templateType: "simple",
        tooltipText:
          "By providing this information, your organization confirms it does not engage in or support the arms industry, conflict-related trade, or any partnerships with sanctioned regimes involved in human rights violations.",
      },
      {
        id: "peaceInitiativesSupport",
        label: "Evidence of Support for Peace Initiatives",
        type: "textarea",
        required: true,
        placeholder: "Describe your support for peace initiatives...",
        helpText: "Local or international peace initiatives",
        tooltipText:
          "Describe any local or international peace initiatives your organization has supported, such as donations, partnerships, sponsorships, or participation in campaigns promoting dialogue, reconciliation, or humanitarian aid.",
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
        tooltipText:
          "Describe or upload evidence of your organization’s public advocacy for peacebuilding or mediation efforts. This can include articles, press releases, social media campaigns, public statements, or partnerships promoting dialogue, reconciliation, or conflict prevention.",
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
        hasTemplate: true,
        templateId: "template_complaint_resolution",
        templateType: "simple",
        tooltipText:
          "Provide documentation that your organization has a clear and fair process for handling complaints from employees, customers, or partners. Describe how complaints are received, reviewed, and resolved, including steps for documentation, timelines, and escalation.",
      },
      {
        id: "resolutionChannels",
        label:
          "Resolution Channels Available for Everyone and Publicly Accessible",
        type: "textarea",
        required: true,
        placeholder: "Provide links to your resolution channels...",
        helpText: "Add any link where you display your resolution channels",
        tooltipText:
          "Provide links or details about your organization’s public resolution channels, where employees, customers, or community members can raise concerns, file complaints, or seek mediation. This may include online forms, contact pages, grievance portals, or published procedures outlining how conflicts or complaints are handled transparently.",
      },
      // Optional fields (+5%)
      {
        id: "googleWebsiteReviews",
        label: "Google/Website Reviews Link (Optional)",
        type: "url",
        required: false,
        placeholder: "https://google.com/maps/yourcompany",
        helpText: "Provide link to your Google Reviews or website reviews",
        tooltipText:
          "Provide a link to your organization’s public feedback or review page, such as Google Reviews, a feedback form, or a website comment portal. This demonstrates transparency and allows the public or customers to share their experiences and hold the organization accountable.",
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
