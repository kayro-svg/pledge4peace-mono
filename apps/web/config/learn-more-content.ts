/**
 * Learn More Content for Peace Seal Questionnaire Fields
 *
 * This file contains Q&A content and full PDF content extracted from PDFs
 * to help users understand each questionnaire field requirement.
 *
 * Content is the same across all business sizes (small, medium, large).
 *
 * TO ADD PDF CONTENT:
 * 1. Extract text content from each PDF using a PDF reader or online tool
 * 2. Add the extracted content to the `fullContent` field of each topic
 * 3. The component will automatically display `fullContent` if available,
 *    otherwise it will fall back to showing Q&A format
 */

export interface LearnMoreQnA {
  question: string;
  answer: string;
}

export interface LearnMoreTopic {
  topicId: string;
  title: string;
  description?: string;
  qnas: LearnMoreQnA[];
  fullContent?: string; // Full extracted content from PDF
  sourcePdfUrls: string[];
}

export type LearnMoreTopicsMap = Record<string, LearnMoreTopic>;

/**
 * Mapping of field IDs to Learn More topics
 * Each topic contains Q&A pairs extracted from PDFs
 */
export const LEARN_MORE_TOPICS: LearnMoreTopicsMap = {
  peacePledgeDeclaration: {
    topicId: "peacePledgeDeclaration",
    title: "CEO/Owner Peace Pledge Declaration",
    description: "Understanding the Peace Pledge Declaration requirement",
    qnas: [
      {
        question: "What is the Peace Pledge Declaration?",
        answer:
          "The Peace Pledge Declaration is the cornerstone of your Peace Seal journey. By checking the box and signing this declaration, your organization's top leadership — whether the CEO, Owner, or an authorized delegate — affirms its official commitment to the principles that define a peace-driven business. This isn't a legal contract; it's a moral and operational commitment to lead with values that make workplaces safer, fairer, and more human-centered. It shows that your organization recognizes peace as more than the absence of conflict — it's a culture built on dignity, justice, and cooperation.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "To fulfill this requirement in your Peace Seal questionnaire: 1) Click 'Sign Now →' beside the Peace Pledge Declaration, 2) A pop-up will open showing the full text of the declaration, 3) Read through each section carefully, 4) In the provided fields, enter: Authorized Signatory Name, Role/Title, and On behalf of (CEO/Owner Name), 5) Check the box confirming your agreement, 6) Click Submit to complete your signature electronically. Once submitted, this step will be automatically recorded in your Peace Seal evaluation.",
      },
      {
        question: "How do I implement it in the workplace?",
        answer:
          "Accepting the declaration is just the beginning — the next step is living it through everyday actions. Communicate the commitment by announcing internally that your leadership has signed the Peace Pledge, include it in onboarding materials, company meetings, or your internal newsletter. Integrate the values into daily operations by reviewing existing policies and ensuring they reflect values of dignity, fairness, and non-violence. Lead by example, educate and engage staff, and review and reaffirm regularly (once a year) as part of your internal ethics or CSR review.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Peace starts with leadership. When executives take responsibility for how their organization impacts people and society, they set the tone for change that ripples outward. This declaration helps transform peace from an idea into a measurable, visible practice that improves workplace culture, strengthens trust, and enhances your organization's reputation.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/CEO_Owner%20Peace%20Pledge%20Declaration.pdf",
    ],
  },
  hrHandbook: {
    topicId: "hrHandbook",
    title: "HR or Employee Handbook",
    description: "Requirements for HR policies and employee handbook",
    qnas: [
      {
        question: "What is an Employee Handbook and why is it important?",
        answer:
          "An Employee Handbook is the foundation of a peaceful, ethical, and inclusive workplace. It defines how your organization treats its employees — setting clear expectations for behavior, fairness, and respect. By uploading your handbook or adopting the Peace Seal sample, you're confirming that your organization has — or will — implement written policies that protect every employee's dignity and rights. This includes anti-discrimination policies that ensure equal opportunity for all, fair wage practices that promote financial dignity and worker well-being, and safety, integrity, and inclusion standards that reflect your commitment to peace in daily operations.",
      },
      {
        question: "What should be included in the HR Handbook?",
        answer:
          "Your Employee Handbook should include: anti-discrimination and equal opportunity policies, fair wage and benefits commitments, a code of conduct and workplace safety section, and a process for reporting or resolving complaints. It should reflect Peace Seal values: respect, non-violence, integrity, equal opportunity, and community responsibility.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "You can: 1) Upload your existing Employee Handbook (PDF or document) ensuring it includes the required elements, OR 2) Click 'Implement Ours →' to instantly adopt the Peace Seal's ready-to-use template. Then confirm your commitment by checking the box affirming that you agree to implement this handbook and uphold its principles. Once submitted, your confirmation will automatically be recorded in your Peace Seal evaluation.",
      },
      {
        question: "How do I implement it in the workplace?",
        answer:
          "Share it with all employees by distributing the handbook during onboarding and making it easily accessible online or in print. Train and engage staff by holding short orientation sessions on inclusion, conflict resolution, and fair pay standards. Review annually by updating your handbook as laws and best practices evolve, and encourage staff feedback to ensure it reflects real workplace needs. Most importantly, live the values by ensuring leadership models the principles outlined — fairness, non-violence, inclusion, and integrity.",
      },
      {
        question: "Why does it matter?",
        answer:
          "An Employee Handbook isn't just a document — it's your organization's moral compass. It creates clarity, trust, and accountability between leadership and staff. When every employee feels protected, valued, and fairly compensated, your workplace becomes a space where peace thrives — and productivity follows naturally. Implementing this step shows that your organization doesn't just talk about peace — it practices it every day.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Employee%20Handbook.pdf",
    ],
  },
  supplierSelfDeclaration: {
    topicId: "supplierSelfDeclaration",
    title: "Supplier Self-Declaration",
    description: "Requirements for supplier ethical standards declaration",
    qnas: [
      {
        question: "What is a Supplier Self-Declaration?",
        answer:
          "The Supplier Self-Declaration ensures your organization's supply chain aligns with the Peace Seal's core principle of non-violence and ethical responsibility. By uploading your supplier declaration — or signing ours — you confirm that your organization and its partners are not involved in any activities that contribute to armed conflict, including: the manufacture or sale of weapons or arms components, business with sanctioned regimes or conflict-linked entities, and sourcing from exploitative or violent industries (e.g., conflict minerals, forced labor). This step demonstrates your organization's active commitment to peace-driven procurement — ensuring every business relationship reflects integrity, dignity, and accountability.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "To fulfill this requirement: 1) Upload your organization's existing Supplier Self-Declaration (PDF or document) that confirms no ties to arms or conflict industries (it should include clear language on non-involvement in weapons, sanctioned partnerships, or unethical sourcing), OR 2) Click 'Sign This Declaration →' in your questionnaire to use the Peace Seal's pre-approved Supplier Self-Declaration Form - the pop-up will guide you through filling in your organization details, then check the confirmation box and click Submit. Once submitted, this document becomes part of your Peace Seal evaluation record.",
      },
      {
        question: "How do I implement it in my business?",
        answer:
          "Communicate the standard to your suppliers by sharing your declaration and requiring every supplier or vendor to review and sign it (make this a standard part of supplier onboarding and renewals). Conduct a quick supply chain review to ensure none of your vendors or partners are connected to arms manufacturing, sanctioned regimes, or high-risk industries. Integrate into your procurement policy by adding a clause to contracts stating all suppliers must comply with your ethical sourcing and non-conflict commitments. Encourage supplier awareness by educating your partners on why peace-aligned sourcing matters.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Peaceful commerce begins with ethical sourcing. Every supplier decision has a ripple effect — supporting stability, protecting human rights, and preventing profit from violence. By ensuring your supply chain is conflict-free, you're helping make peace a measurable business practice — not just a moral statement. This action strengthens your credibility, supports transparency, and aligns your organization with global peace and sustainability standards (UNGC, OECD, and SDG 16).",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Supplier%20Self-Declaration.pdf",
    ],
  },
  companyValuesStatement: {
    topicId: "companyValuesStatement",
    title: "Public Statement of Company Values",
    description: "Requirements for public values statement",
    qnas: [
      {
        question: "What should the public statement of values include?",
        answer:
          "A public statement of company values shows your organization's moral compass, how you commit to acting with integrity, inclusion, and peace in everything you do. This can be shared on your website, brochure, or press release, and it should communicate your organization's dedication to: ethical business conduct, respect for human dignity and equality, non-violence and peaceful collaboration, and environmental and social responsibility. By publishing your values, you help customers, employees, and partners understand that your business is not only profit-driven but purpose-driven, grounded in respect, justice, and peace.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "To fulfill this requirement: 1) Add your organization's existing values statement directly in the text field (you can copy and paste it from your website or company materials), OR 2) Click 'Upload File' to share a brochure, PDF, or press release that outlines your company's values, OR 3) If you don't yet have one, you can use a sample template as a starting point to publish your own statement on your website or in your communications.",
      },
      {
        question: "What if we don't have a formal values statement?",
        answer:
          "You can create one or extract relevant content from existing materials like your website's About page, mission statement, or corporate social responsibility communications. A sample statement typically includes commitments to: Human Dignity (treating every individual with respect, equality, and fairness), Non-Violence (conducting work in ways that promote understanding, safety, and peace), Integrity (holding yourself accountable to the highest ethical standards), Inclusion (building a workplace that celebrates diversity), and Sustainability (protecting the environment).",
      },
      {
        question: "How do I implement it?",
        answer:
          "Publish it publicly by adding your values statement to your website's 'About' or 'Mission' section, and include it in marketing brochures, press releases, or your employee handbook. Make it actionable by referring to these values in company meetings, hiring decisions, and partnerships. Ensure every department reflects these principles in its day-to-day work. Revisit regularly by reviewing your values yearly to ensure they still represent your evolving mission.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Your values define your identity — they tell the world who you are and what you stand for. By sharing them publicly, you build trust and credibility with your stakeholders, inspire employees and customers who align with your mission, and contribute to a global culture of transparency, peace, and responsibility. Publishing your company values is one of the simplest yet most powerful steps you can take toward earning and embodying the Peace Seal.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Public%20Statement%20of%20Company%20Values.pdf",
    ],
  },
  antiHarassmentPolicy: {
    topicId: "antiHarassmentPolicy",
    title: "Anti-Harassment & Anti-Discrimination Policy",
    description: "Requirements for anti-harassment and anti-discrimination policy",
    qnas: [
      {
        question: "What is an Anti-Harassment & Anti-Discrimination Policy?",
        answer:
          "A signed anti-harassment and anti-discrimination policy is one of the most essential steps toward building a peaceful, inclusive workplace. By signing or uploading this policy, your organization confirms that it upholds zero tolerance for harassment and discrimination, and that it protects the dignity and rights of every employee. This aligns directly with the Peace Seal's core values of non-violence, justice, equality, and human dignity — ensuring that every workplace is a space where all individuals can thrive safely and respectfully.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "You can fulfill this requirement in two ways: 1) Upload your organization's existing policy (accepted formats: PDF, DOCX, or company policy manual excerpt) - the document should include commitments to equality, non-retaliation, and safe reporting channels, OR 2) Sign the Peace Seal version using the pop-up format by clicking 'Don't have one? Sign These Policies →' to review and agree to the Peace Seal's Anti-Harassment & Anti-Discrimination Policy, then fill in the electronic signature fields and check the confirmation box.",
      },
      {
        question: "What should the policy include?",
        answer:
          "A sample policy should include commitments to: Equal Opportunity (employment decisions based on merit, not personal characteristics), Zero Tolerance (any form of intimidation, bullying, or inappropriate behavior is strictly prohibited), Safe Reporting (employees can report concerns confidentially without fear of retaliation), Accountability (all reports will be investigated promptly and fairly), and Awareness & Training (regular education on diversity, inclusion, and respectful conduct).",
      },
      {
        question: "How do I implement it in my organization?",
        answer:
          "Communicate the policy clearly by distributing it to all employees and including it in onboarding materials or your employee handbook. Create safe reporting channels by offering confidential ways for employees to report harassment or discrimination (e.g., HR contact, anonymous form, or hotline). Train and reinforce awareness by conducting short training sessions or reminders at least once a year. Hold leadership accountable by ensuring leaders model respectful behavior and take immediate action on violations, keeping records of all reports and responses to ensure transparency.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Workplaces that uphold equality and respect aren't just safer — they're more productive, innovative, and peaceful. By implementing this policy, your organization protects employees from harm and discrimination, builds trust and transparency within your team, and strengthens your reputation as a peace-driven, ethical business. This is not just a compliance step — it's a declaration of your company's values in action.",
      },
    ],
    sourcePdfUrls: [],
  },
  diversityBreakdown: {
    topicId: "diversityBreakdown",
    title: "Simple Diversity Breakdown",
    description: "Guidelines for providing diversity information",
    qnas: [
      {
        question: "What is a diversity breakdown?",
        answer:
          "A diversity breakdown helps your organization understand and communicate how inclusive your workplace is. This information isn't about personal identifiers — it's about overall representation within your team. Providing a brief summary of your workforce by gender, age group, or other relevant categories demonstrates your commitment to transparency, inclusion, and equal opportunity — key pillars of the Peace Seal's evaluation for fairness and human-centered practices.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "You can complete this section in two ways: 1) Describe it directly in the text field by providing general percentages or simple ranges (exact numbers aren't required), focusing on representation (e.g., gender balance, generational diversity, leadership inclusion), OR 2) Upload a short report or chart if you already publish a diversity summary in an annual or CSR report (acceptable file formats: PDF, DOCX, or image of a visual chart).",
      },
      {
        question: "What should I include in the breakdown?",
        answer:
          "A sample breakdown might include: Gender Representation (e.g., 55% women, 43% men, 2% nonbinary/other), Age Groups (e.g., 18–29: 25%, 30–44: 45%, 45–60: 25%, 60+: 5%), Leadership Diversity (percentage of management positions held by women and underrepresented groups), and Cultural/Ethnic Backgrounds (percentage of multicultural or international employees). You may format your report in percentages, ranges, or brief descriptions — whichever best represents your organization's structure.",
      },
      {
        question: "How do I implement it in my organization?",
        answer:
          "Gather basic data by reviewing your HR or payroll records to identify overall workforce composition (include voluntary demographic information only; do not collect sensitive or personal identifiers). Summarize transparently by keeping it simple — show gender, age, or other relevant diversity dimensions (you can use ranges if precise data is not available). Use it as a tool for progress by sharing your findings internally to identify areas for improvement, and revisit this data annually to measure your inclusion progress.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Diversity strengthens peace in the workplace. When employees of all backgrounds feel represented and valued, collaboration and creativity thrive. By reporting your diversity breakdown, you demonstrate transparency and accountability, show a measurable commitment to equality and inclusion, and help advance global standards for workplace fairness and social justice. Your openness about diversity contributes directly to the Peace Seal's mission, creating workplaces that model dignity, respect, and shared humanity.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Simple%20Diversity%20Breakdown.pdf",
    ],
  },
  employeeSatisfactionSurvey: {
    topicId: "employeeSatisfactionSurvey",
    title: "Basic Employee Satisfaction or Feedback Survey",
    description: "Guidelines for employee satisfaction and feedback surveys",
    qnas: [
      {
        question: "What is an employee satisfaction survey?",
        answer:
          "This optional survey lets employees share anonymous, honest feedback about their workplace experience — covering satisfaction, fairness, inclusion, and peace culture. It contributes to your Peace Seal evaluation and strengthens internal trust.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Use the invitation form in the questionnaire to enter employees' email addresses. They'll receive a secure link to complete the Peace Seal Employee Rating form. You can also upload internal survey summaries if already conducted.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Workplace peace begins with listening. Anonymous surveys reveal gaps in equity, morale, or communication before they escalate into conflict. This helps you identify areas for improvement and demonstrates your commitment to creating a peaceful, inclusive workplace.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Ensure participation is voluntary. Communicate results transparently and outline follow-up actions. This shows employees that their feedback is valued and that you're committed to making improvements based on their input.",
      },
    ],
    sourcePdfUrls: [],
  },
  sustainableSourcingStatement: {
    topicId: "sustainableSourcingStatement",
    title: "Sustainable Sourcing & Waste Management Policy",
    description: "Requirements for environmental sourcing and waste management",
    qnas: [
      {
        question: "What is a Sustainable Sourcing & Waste Management Policy?",
        answer:
          "This confirms your commitment to eco-friendly sourcing and waste practices that minimize harm and align with peace and justice for future generations. Your statement should commit to sourcing materials responsibly and managing waste sustainably. This includes using ethical, conflict-free suppliers, reducing single-use items, promoting recycling, and minimizing environmental harm.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Upload your existing sustainability policy or click 'Sign our Policy →' to adopt the Peace Seal template. Ensure leadership endorsement. You can provide a combined statement covering both areas, or separate statements. The key is demonstrating commitment to responsible sourcing and sustainable waste management practices.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Include measurable goals (energy use ↓ %, waste ↓ %). Review annually. Common mistakes to avoid include generic statements with no procedures or data.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Environmental stability underpins peaceful societies. Ethical resource use prevents conflict over scarcity. By committing to sustainable sourcing and waste management, you demonstrate your organization's dedication to protecting the environment and contributing to a more peaceful future.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Signed%20Sustainable%20Sourcing%20%26%20Waste%20Management%20Policy.pdf",
    ],
  },
  recyclingRenewableInitiatives: {
    topicId: "recyclingRenewableInitiatives",
    title: "Local Recycling or Renewable Initiatives",
    description: "Information about recycling and renewable energy programs",
    qnas: [
      {
        question: "What qualifies as a recycling or renewable initiative?",
        answer:
          "This shows active involvement in community or sectoral environmental programs. Any program your organization participates in locally qualifies, such as community clean-ups, renewable energy partnerships, recycling programs, waste reduction efforts, or other environmental initiatives that demonstrate commitment to sustainability.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Describe your initiative (partnerships, events, facilities used) and provide evidence (photos, certificates, news mentions). You can describe your participation in text format - while certifications are valuable, they're not required. The focus is on demonstrating active engagement with environmental initiatives. If you're just starting these initiatives, you can describe planned or recently started initiatives - the key is showing commitment to environmental responsibility.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Quantify impact (waste diverted, CO₂ saved). Renew commitments yearly. Common mistakes to avoid include listing one-day events without follow-up or proof.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Local environmental peacebuilding builds shared stewardship across communities. By participating in recycling and renewable initiatives, your organization demonstrates commitment to environmental responsibility and contributes to building a more sustainable and peaceful future.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Participation%20in%20Local%20Recycling%20or%20Renewable%20Initiatives.pdf",
    ],
  },
  noArmsTiesDeclaration: {
    topicId: "noArmsTiesDeclaration",
    title: "Declaration of No Ties with Arms Industries or Sanctioned Regimes",
    description:
      "Requirements for arms industry and sanctioned regime declaration",
    qnas: [
      {
        question: "What does 'no ties with arms industries' mean?",
        answer:
          "This confirms your company has no direct or indirect involvement with arms production, military trade, or sanctioned entities. Your organization confirms it does not engage in or support the arms industry, conflict-related trade, or any partnerships with sanctioned regimes involved in human rights violations. This includes direct business relationships, investments, or any form of support.",
      },
      {
        question: "What are 'sanctioned regimes'?",
        answer:
          "Sanctioned regimes are governments or entities subject to international sanctions due to human rights violations, conflict involvement, or other serious violations of international law. Your organization should not have partnerships or business relationships with such entities.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Upload your own declaration or click 'Sign the Declaration →' to adopt our verified template. Ensure CEO/Owner signature. You should have policies and processes in place to ensure suppliers and partners also avoid ties to arms industries and sanctioned regimes - this demonstrates due diligence in your business relationships.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Audit supply chains and investments yearly. Document verification sources (sanction lists). This ensures ongoing compliance and demonstrates your commitment to peace-driven business practices.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Transparency in avoiding conflict-linked industries upholds international law and peace economy ethics. By declaring no ties to arms industries or sanctioned regimes, your organization demonstrates its commitment to ethical business practices and contributes to global peace and stability.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Declaration%20of%20No%20Ties%20with%20Arms%20Industries%20or%20Sanctioned%20Regimes.pdf",
    ],
  },
  peaceInitiativesSupport: {
    topicId: "peaceInitiativesSupport",
    title: "Evidence of Support for Peace Initiatives",
    description: "Documentation requirements for peace initiative support",
    qnas: [
      {
        question: "What qualifies as support for peace initiatives?",
        answer:
          "This demonstrates tangible action — financial or participatory — in local or global peace efforts. Any local or international peace initiatives your organization has supported qualify, such as donations, partnerships, sponsorships, or participation in campaigns promoting dialogue, reconciliation, or humanitarian aid.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Describe projects, events, or campaigns supported and attach documents, images, or links to media coverage. You can describe your support in text format or provide documentation. Examples include descriptions of partnerships, summaries of donations, links to campaign participation, or documentation of humanitarian aid contributions. Recent initiatives (within the past few years) are preferred, but historical support also demonstrates ongoing commitment to peace.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Verify NGO legitimacy before partnership. Keep receipts and partnership letters. Common mistakes to avoid include listing generic CSR work unrelated to peace or dialogue.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Active peace support differentiates value-driven organizations and contributes directly to global stability. By supporting peace initiatives, your organization demonstrates its commitment to making a positive impact beyond profit and contributes to building a more peaceful world.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Evidence%20of%20Support%20for%20Peace%20Initiatives.pdf",
    ],
  },
  googleWebsiteReviews: {
    topicId: "googleWebsiteReviews",
    title: "Google/Website Reviews Link",
    description: "Requirements for public feedback and review links",
    qnas: [
      {
        question: "Why do I need to provide a reviews link?",
        answer:
          "A public feedback channel allows clients, partners, or employees to share open experiences. Providing a link to your organization's public feedback or review page (such as Google Reviews, a feedback form, or website comment portal) demonstrates transparency and allows the public or customers to share their experiences and hold the organization accountable.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Paste your official Google Reviews, Trustpilot, or feedback displayed on your website. For Google Reviews: Method 1) Perform a Google search for your business name and city, locate your business and click on it to open your Business Profile, then copy the URL from your browser's address bar or click the 'Share' button. Method 2) Sign in to your Google Business Profile account, go to Settings > Website tab, and copy the link displayed. For Trustpilot: Log in to your Trustpilot Business account, navigate to Settings > Public profile settings > Profile page, and copy the URL displayed. If you don't have Google Reviews yet, you can provide a link to any public feedback mechanism on your website.",
      },
      {
        question: "Do reviews need to be positive?",
        answer:
          "No, the requirement is about transparency and accountability, not about having only positive reviews. Having a public feedback channel shows commitment to listening and responding to stakeholder concerns.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Monitor feedback respectfully and respond without defensiveness. Encourage balanced, authentic reviews. This demonstrates your commitment to transparency and continuous improvement.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Public reviews promote accountability and transparency, core to trust in peaceful enterprise. By providing a public feedback channel, your organization demonstrates its commitment to transparency and willingness to be held accountable by stakeholders.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Provide%20Google_Website%20Reviews%20Link.pdf",
    ],
  },
  complaintResolutionProcess: {
    topicId: "complaintResolutionProcess",
    title: "Process Documentation for Complaint Resolution",
    description: "Requirements for complaint handling procedures",
    qnas: [
      {
        question: "What is a complaint resolution process?",
        answer:
          "This outlines your formal procedure for handling grievances — ensuring fairness, transparency, and peace-based resolution. Your documentation should describe how complaints from employees, customers, or partners are received, reviewed, and resolved. Include steps for documentation, timelines, escalation procedures, and how outcomes are communicated.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Upload your complaint-resolution policy or sign the Peace Seal default policy provided in the questionnaire. Include workflow: submission → review → resolution → closure. You can also opt in to use our mediation service or upload your own process documentation. Either approach demonstrates commitment to fair complaint resolution.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Train supervisors on mediation and non-retaliation. Keep records confidential but auditable. Common mistakes to avoid include having a policy but no clear timeline or responsible contact.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Fair complaint handling builds internal trust and reduces legal or reputational risk. Having a clear, documented process ensures that grievances are handled consistently and fairly, contributing to a peaceful workplace culture.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Process%20Documentation%20of%20How%20Complaints%20Are%20Resolved.pdf",
    ],
  },
  employeeVolunteerPrograms: {
    topicId: "employeeVolunteerPrograms",
    title: "Employee Volunteer Programs",
    description: "Guidelines for employee volunteer initiatives",
    qnas: [
      {
        question: "What is an employee volunteer program?",
        answer:
          "This shows how your organization encourages staff to contribute to community or peace-building projects. Describe your organization's employee volunteer program, including any required service hours or community initiatives staff participate in. This highlights how your company fosters civic responsibility, teamwork, and social impact through organized volunteer engagement.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Describe your program or policy and note whether participation is voluntary or mandatory and average hours contributed. Volunteer programs can be optional or mandatory - the key is demonstrating active engagement in community service and social impact initiatives through employee participation. A sample example might be: 'Our staff dedicate 8 paid hours per quarter to local volunteering; 2025 total = 480 hours across 6 organizations.'",
      },
      {
        question: "What types of volunteer activities qualify?",
        answer:
          "Any community service, volunteering, or social impact initiatives where employees participate count. Examples include local clean-ups, mentoring programs, food drives, educational support, or partnerships with community organizations.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Track hours annually. Offer flexibility for different causes. This ensures you can measure and report on your organization's community impact and demonstrates ongoing commitment to volunteer engagement.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Volunteer engagement fosters empathy, teamwork, and civic responsibility — cornerstones of peace culture. By encouraging employee volunteer programs, your organization demonstrates its commitment to community engagement and building a more peaceful, connected society.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Employee%20Volunteer%20Hours%20or%20Program%20Initiatives.pdf",
    ],
  },
  communityContribution: {
    topicId: "communityContribution",
    title: "Evidence of Community Contribution",
    description: "Requirements for demonstrating community engagement",
    qnas: [
      {
        question: "What qualifies as a community contribution?",
        answer:
          "This is proof that your business actively contributes to social good, through donations, volunteering, partnerships, or in-kind services. Provide proof of at least one community contribution, such as a local donation, volunteering initiative, or partnership that supports social good. This can be a description with links to your initiatives or images that serve as proof.",
      },
      {
        question: "How do I complete this step?",
        answer:
          "Describe one concrete initiative in the text field and upload any proof (photos, receipts, thank-you letters, press releases). A sample example might be: 'In June 2025 we partnered with Pledge4Peace to fund tree-planting. 10 employees volunteered 120 hours; 350 trees were planted.'",
      },
      {
        question: "Do contributions need to be financial?",
        answer:
          "No, contributions can be financial donations, in-kind support, volunteer time, partnerships with community organizations, or other forms of social impact that benefit the community. The key is demonstrating meaningful community engagement.",
      },
      {
        question: "What are compliance tips?",
        answer:
          "Choose measurable activities (hours, people reached). Maintain consent before using partner logos/photos. This ensures you can demonstrate concrete impact and respect the privacy and consent of partners.",
      },
      {
        question: "Why does it matter?",
        answer:
          "Community engagement translates values into action and demonstrates social responsibility beyond profit. By providing evidence of community contributions, your organization shows its commitment to making a positive impact in the communities where you operate.",
      },
    ],
    sourcePdfUrls: [
      "https://pub-316825d26d3340318682365567a5b814.r2.dev/learn-more-infos/Evidence%20of%20at%20Least%20One%20Community%20Contribution.pdf",
    ],
  },
};

/**
 * Get a Learn More topic by ID
 */
export function getLearnMoreTopic(topicId: string): LearnMoreTopic | undefined {
  return LEARN_MORE_TOPICS[topicId];
}

/**
 * Check if a topic exists
 */
export function hasLearnMoreTopic(topicId: string): boolean {
  return topicId in LEARN_MORE_TOPICS;
}
