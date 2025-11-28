/**
 * Agreement template texts for backend use
 * These match the frontend templates to ensure consistency
 *
 * IMPORTANT: When adding new agreement templates:
 * 1. Add the template here with the same templateId used in frontend configs
 * 2. Ensure the templateId matches what's referenced in:
 *    - apps/web/config/questionnaire-configs.ts (field.templateId)
 *    - apps/web/config/templates/*-business-agreements.ts
 * 3. The templateId must exist here for agreement acceptance to work
 *
 * Template IDs used:
 * - template_board_peace_policy: Used for "Board-Approved Peace & Human Rights Policy" (medium/large companies)
 * - template_beneficial_ownership: Used for beneficial ownership policy
 * - template_peace_pledge_declaration: Used for Peace Pledge Declaration
 * - template_supplier_code_of_conduct: Used for "Supplier & Vendor Code of Conduct" (medium/large companies)
 * - template_no_lobbying: Used for "Declaration of No Lobbying for War or Conflict Policies" (medium/large companies)
 * - template_equal_opportunity: Used for "Equal Opportunity Employment (EOE) Policy" (medium/large companies)
 * - template_whistleblower_protection: Used for "Whistleblower Protection Policy" (medium/large companies)
 * - And others...
 */

export interface AgreementText {
  title: string;
  body: string;
}

export const AGREEMENT_TEXTS: Record<string, AgreementText> = {
  template_beneficial_ownership: {
    title: "Anti-Corruption: Company Beneficial Ownership Policy",
    body: `# Anti-Corruption: Company Beneficial Ownership Policy

## Purpose

This policy affirms our organization's commitment to transparency, ethical governance, and the fight against corruption. By clearly declaring and disclosing beneficial ownership, we aim to prevent hidden interests, promote accountability, and align our business practices with international standards of integrity.

## Scope

This policy applies to the organization's leadership, board members, shareholders, subsidiaries, and any related entities with ownership stakes. It also informs our partners, investors, suppliers, and customers of our transparency commitments.

## Our Commitments

1. Full Transparency of Ownership
We pledge to disclose the names and percentage interests of all ultimate beneficial owners (UBOs) of the organization. UBOs are individuals who directly or indirectly own or control a percentage of the company's shares, voting rights, or decision-making power.

2. Anti-Corruption Standards
We strictly prohibit concealed ownership structures or the use of anonymous shell companies to obscure ownership. Any attempt to hide ownership for purposes of corruption, tax evasion, or conflict of interest is against our values and practices.

3. Public Access to Information
We commit to making our beneficial ownership information accessible to regulators, auditors, and stakeholders. Where legally permissible, we will publish key ownership details on our website or annual reports.

4. Regular Updates and Verification
Beneficial ownership information will be reviewed and updated at least annually, and immediately upon changes in ownership or control. This ensures accuracy and reliability in all public and internal disclosures.

5. Compliance with Laws and International Standards
We will comply with all relevant national laws and global standards regarding beneficial ownership transparency, anti-money laundering (AML), and anti-corruption (UNCAC, OECD guidelines).

6. Accountability and Oversight
The Board of Directors will oversee compliance with this policy. Any violations or discrepancies will be investigated, and corrective measures taken, including termination of relationships with non-compliant shareholders or partners.

## Implementation

- This policy is reviewed and approved by our Board of Directors.
- Disclosures will be filed with appropriate government or regulatory authorities as required.
- All business partners and stakeholders may request verification of our ownership records at any time.

By accepting this policy, I, as the CEO or an authorized representative of this organization, confirm that our Board has approved this Anti-Corruption: Beneficial Ownership Policy and agree to its implementation across our operations.`,
  },
  template_peace_pledge_declaration: {
    title: "Peace Pledge Declaration",
    body: `# Peace Pledge Declaration
I, as the CEO, Owner, or an authorized representative of this organization (with permission from leadership), hereby solemnly pledge the following commitments. By checking this box, I affirm that we will uphold and strive to embody these values - not as optional ideals, but as guiding principles in how our organization operates, treats people, and engages with the world.

## Foundational Values
I commit this organization to a foundation rooted in dignity, justice, equality, and respect for every human life, regardless of creed or origin.
## Non-Violence & Respect for Life
I pledge that our organization will prioritize non-violent methods in conflict resolution, reject violence in all its forms, and ensure our operations protect life rather than endanger it.
## Justice & Stability
I commit to practices that promote fairness, trust, transparency, and stable social systems within our organization and broader community - not just avoiding harm, but contributing positively to social well-being.
## Education for Peace
I pledge to support education, training, dialogue, and awareness efforts within the organization and beyond to cultivate empathy, mutual understanding, and long-term peace-minded perspectives.
## Ethical Integrity in Action
I promise that our decisions - in hiring, procurement, partnerships, and operations - will reflect impartiality, integrity, transparency, and respect for all stakeholders.
## Rejection of Hate & Extremism
I unequivocally reject hate, violence, terrorism, and the spread of dehumanizing rhetoric. We will actively resist narratives of division and despair, including online.
## International Law & Cooperation
Where our operations or partnerships cross borders, I commit to abiding by international conventions, treaties, and collaborative diplomacy rather than unilateral force.
## Human-Centered Development
I commit to placing people at the center of our mission - supporting the health, dignity, opportunity, and well-being of employees, communities, and the environment, rather than pursuing profits at any human cost.

By checking this box and submitting this pledge, I affirm that these statements reflect the convictions of this organization's leadership. I understand that the Peace Seal evaluation process will hold us to these commitments, encourage accountability, and offer guidance for continuous improvement.`,
  },
  template_board_peace_policy: {
    title: "Peace & Human Rights Policy",
    body: `# Peace & Human Rights Policy

## Purpose

This Peace & Human Rights Policy affirms our organization's commitment to uphold the dignity, equality, and rights of all people. As a business, we recognize that sustainable growth and long-term success can only exist when rooted in respect for human rights, nonviolence, ethical governance, and peaceful coexistence.

## Scope

This policy applies to all employees, contractors, suppliers, and partners of our organization, across all locations and operations.

## Our Commitments

1. Respect for Life and Nonviolence
We pledge to respect and protect human life in all its forms. Our organization rejects all forms of violence, hate, or discrimination, whether in our operations, supply chains, or communities.

2. Equality and Non-Discrimination
We are committed to creating an inclusive workplace and business environment free from discrimination on the basis of race, religion, ethnicity, gender, sexual orientation, age, disability, or political belief.

3. Fair Treatment of Workers
We uphold the right to fair wages, safe working conditions, freedom of association, and access to grievance mechanisms. We will not tolerate forced labor, child labor, or exploitative practices.

4. No Ties to Arms or Conflict Industries
Our organization affirms it has no financial or business ties with arms manufacturing, sanctioned regimes, or conflict-related industries. We commit to reviewing our investments and supply chains regularly to uphold this standard.

5. Ethical Business Practices
We commit to transparency, anti-corruption measures, and accountability in all governance practices. Our values and ethics code will remain publicly accessible.

6. Peace and Community Engagement
We support peacebuilding and community-strengthening efforts where we operate. This includes encouraging dialogue, supporting humanitarian initiatives, and participating in programs that promote justice and reconciliation.

## Implementation

- This policy is reviewed and approved by our Board of Directors.
- All staff and suppliers are required to comply with these commitments.
- Regular audits and grievance channels will be maintained to ensure accountability.

By accepting this policy, I, as the CEO or an authorized representative of this organization, confirm that our Board has approved this Peace & Human Rights Policy and agree to its implementation across our operations.`,
  },
  template_supplier_code_of_conduct: {
    title: "Supplier & Vendor Code of Conduct",
    body: `# Supplier & Vendor Code of Conduct

## Purpose

Our organization is committed to conducting business in a manner that promotes peace, integrity, and sustainability. This Supplier & Vendor Code of Conduct sets out the minimum standards we require from all suppliers and vendors to ensure that business practices across our supply chain reflect ethical, responsible, and peace-driven values.

## Scope

This Code applies to all suppliers, contractors, subcontractors, and vendors who provide goods or services to our organization.

## Our Expectations of Suppliers/Vendors

1. Ethical Business Practices
- Conduct business honestly, free from bribery, corruption, extortion, or embezzlement.
- Avoid conflicts of interest and ensure transparent dealings at all times.

2. Human Rights & Fair Labor
- Respect the dignity, rights, and freedoms of all employees.
- Prohibit forced labor, child labor, human trafficking, or any form of exploitation.
- Ensure fair wages, benefits, and working hours in compliance with local laws and international standards.
- Guarantee a workplace free of harassment, discrimination, or abuse.

3. Health, Safety, and Well-Being
- Provide safe and healthy working conditions.
- Implement systems to prevent workplace injuries, hazards, or unsafe practices.

4. Environmental Responsibility
- Minimize environmental impact by reducing waste, emissions, and resource consumption.
- Support sustainable sourcing and environmental peacebuilding initiatives.

5. Conflict-Free Operations
- Avoid sourcing materials or services linked to armed conflicts, sanctioned regimes, or arms-related industries.
- Maintain a supply chain free of "conflict resources" such as blood diamonds or war metals.

6. Accountability & Transparency
- Maintain accurate business records and allow audits or assessments when requested.
- Report any violations of this Code or unethical practices immediately.

7. Commitment to Peace & Community Engagement
- Support inclusive communities, fair treatment, and peace-driven practices.
- Engage in initiatives that uplift workers, communities, and society at large.

## Implementation & Monitoring

- Suppliers/vendors must communicate this Code to their employees and subcontractors.
- Our organization reserves the right to monitor compliance and terminate relationships if serious violations occur.

By accepting this code of conduct, I, as the CEO or an authorized representative of this organization, confirm that our Board has approved this Supplier & Vendor Code of Conduct and agree to its implementation across our supply chain.`,
  },
  template_supplier_self_declaration: {
    title: "Supplier Self-Declaration Form",
    body: `# Supplier Self-Declaration Form

Our organization is committed to conducting business ethically, transparently, and in alignment with the principles of peace and non-violence. As part of this commitment, we require all suppliers to confirm that their operations and business practices are free from any involvement in arms manufacturing, arms trade, or activities that fuel conflict.
This self-declaration ensures that all suppliers share in our mission to promote peace, human dignity, and sustainable development.
## Section 1: Supplier Information
Please provide the following information in the form below:
- Company/Organization Name
- Business Address
- Contact Person & Title
- Email & Phone
- Nature of Business/Industry
## Section 2: Declaration of Compliance
By signing this declaration, the supplier confirms that:
1. No Ties to Arms or Conflict Industries
The supplier does not directly or indirectly engage in the production, sale, or distribution of weapons, arms components, or military technologies.
The supplier does not provide goods or services intended for use in active conflict zones, except for verified humanitarian purposes.
2. No Partnership with Sanctioned or Conflict-Linked Entities
The supplier does not partner with, fund, or conduct business with companies, organizations, or governments sanctioned for war crimes, human rights abuses, or conflict profiteering.
3. Commitment to Ethical Sourcing
The supplier ensures that its own supply chain avoids conflict resources (e.g., conflict minerals, blood diamonds, or goods produced through forced labor).
4. Promotion of Peaceful and Ethical Practices
The supplier pledges to operate in a manner consistent with universal values of peace, fairness, non-discrimination, and respect for human dignity.

## Section 3: Verification
Please answer the following (Answer Yes or No in the boxes below):
 1. Do you or your affiliates produce or sell arms, weapons, or related technologies?
 2. Do you conduct business with organizations or governments sanctioned for war or human rights abuses?
 3. Do you have a supplier/vendor code of conduct or equivalent policy in place to ensure ethical sourcing?

## Section 4: Authorized Confirmation
I, the undersigned, as the CEO/Owner or authorized representative of this supplier organization, confirm that the above statements are accurate and true. I understand that providing false information may result in termination of our business relationship.
I, the CEO/Owner or authorized representative, agree to implement this Supplier Self-Declaration in our organization moving forward.

Please complete the signature information in the form below.`,
  },
  template_fair_wage_declaration: {
    title: "Declaration of Fair Wage Practices",
    body: `# Declaration of Fair Wage Practices
As an organization, we recognize that fair wages are essential to dignity, equality, and peace in the workplace. By adopting this declaration, we commit to ensuring that our employees are compensated fairly and treated with respect, regardless of role, background, or location.
## Our Commitment
We commit to:
1. Living Wage Standards: Ensuring all employees receive wages that meet or exceed local living wage standards, enabling them to support themselves and their families with dignity.
2. Equal Pay for Equal Work: Maintaining pay equity across gender, race, ethnicity, and other protected characteristics for equivalent roles and responsibilities.
3. Transparency in Compensation: Providing clear information about pay scales, benefits, and advancement opportunities to all employees.
4. Fair Benefits: Offering comprehensive benefits including health insurance, paid time off, and professional development opportunities.
5. No Tolerance for Exploitation: We will not engage in wage theft, exploitative labor practices, or any form of unfair compensation.

I, the CEO/Owner or authorized representative of this organization, confirm that we will implement this Declaration of Fair Wage Practices into our business moving forward.`,
  },
  template_anti_harassment_policy: {
    title: "Anti-Harassment and Anti-Discrimination Policy",
    body: `# Anti-Harassment and Anti-Discrimination Policy
## Our Commitment
Our organization is committed to providing a workplace free from harassment, discrimination, and intimidation. We uphold the principles of dignity, respect, and equal opportunity for all employees, regardless of race, color, religion, sex, national origin, age, disability, sexual orientation, gender identity, or any other protected characteristic.
## Policy Scope
This policy applies to all employees, contractors, vendors, and visitors to our workplace. We maintain a zero-tolerance policy for:
- Harassment of any kind, including sexual harassment
- Discrimination based on protected characteristics
- Retaliation against individuals who report violations
- Creating a hostile work environment
## Reporting and Resolution
We provide clear, accessible channels for reporting violations and ensure prompt, fair investigation of all complaints. Employees who report violations in good faith are protected from retaliation.

By accepting this policy, I acknowledge that I have read, understood, and agree to comply with these standards.`,
  },
  template_sustainable_sourcing: {
    title: "Sustainable Sourcing & Waste Management Policy",
    body: `# Sustainable Sourcing & Waste Management Policy
## Our Commitment
We commit to sourcing materials responsibly and managing waste sustainably. This includes using ethical, conflict-free suppliers, reducing single-use items, promoting recycling, and minimizing environmental harm.
## Key Principles
1. Ethical Sourcing: We prioritize suppliers who follow ethical labor practices and avoid conflict resources.
2. Environmental Responsibility: We commit to reducing our environmental footprint through sustainable sourcing, waste reduction, and responsible disposal practices.
3. Transparency: We maintain transparency about our sourcing practices and environmental impact.
4. Continuous Improvement: We regularly review and improve our sustainability practices to minimize harm to people and the planet.

By accepting this policy, I acknowledge our organization's commitment to sustainable sourcing and waste management practices.`,
  },
  template_no_arms_ties: {
    title: "Declaration of No Ties with Arms Industries or Sanctioned Regimes",
    body: `# Declaration of No Ties with Arms Industries or Sanctioned Regimes
## Our Commitment
We hereby declare that our organization does not engage in or support the arms industry, conflict-related trade, or any partnerships with sanctioned regimes involved in human rights violations.
## Specific Commitments
1. No Arms Industry Involvement: We do not produce, sell, distribute, or finance weapons, arms components, or military technologies.
2. No Sanctioned Regime Partnerships: We do not conduct business with governments, organizations, or entities sanctioned for war crimes, human rights abuses, or conflict profiteering.
3. Supply Chain Integrity: We ensure our supply chain is free from arms industry connections and unethical sourcing.
4. Transparency: We maintain transparency about our business partners and supply chain to ensure compliance with this declaration.

By accepting this declaration, I confirm that our organization meets these standards and will continue to operate in alignment with peace and human rights principles.`,
  },
  template_complaint_resolution: {
    title: "Complaint Resolution Policy & Documentation",
    body: `# Complaint Resolution Policy & Documentation
## Our Commitment
We are committed to providing clear, fair, and transparent processes for handling complaints from employees, customers, partners, and community members. This policy ensures that all concerns are addressed promptly, fairly, and with respect for all parties involved.
## Complaint Process
1. Receipt: Complaints can be submitted through multiple channels including email, online forms, or direct contact with designated personnel.
2. Review: All complaints are reviewed promptly by qualified personnel who assess the nature and severity of the issue.
3. Investigation: Where necessary, a thorough investigation is conducted with confidentiality and respect for all parties.
4. Resolution: We work to resolve complaints fairly and promptly, providing clear communication about outcomes and any corrective actions taken.
5. Documentation: All complaints and resolutions are documented appropriately to ensure accountability and continuous improvement.
## Public Access
Our complaint resolution channels are publicly accessible, ensuring transparency and accountability. We commit to handling all complaints with integrity and fairness.

By accepting this policy, I acknowledge our organization's commitment to transparent and fair complaint resolution processes.`,
  },
  template_no_lobbying: {
    title: "Declaration of No Lobbying for War or Conflict Policies",
    body: `# Declaration of No Lobbying for War or Conflict Policies

## Purpose

Our organization believes that business has a responsibility to foster peace, stability, and ethical governance. This declaration affirms that we will not engage in, support, or finance lobbying activities that promote war, militarization, or conflict-driven policies.

## Scope

This declaration applies to:
- The organization, its board, executives, and employees.
- Any agents, consultants, or representatives acting on behalf of the organization.

## Commitments

1. No Lobbying for War or Conflict
We will not participate in lobbying efforts that advocate for military interventions, arms escalation, or policies that contribute to war and armed conflict.

2. Peace-Driven Advocacy
Our advocacy efforts will align with principles of peace, diplomacy, nonviolence, and the protection of human rights.

3. Transparency in Public Policy Engagement
- We will ensure all lobbying, public policy, or advocacy activities are disclosed transparently and comply with legal requirements.
- We will not channel resources (direct or indirect) toward organizations, lobbyists, or policymakers that promote war-related agendas.

4. Accountability
- We commit to periodic internal reviews of our lobbying and advocacy activities to ensure compliance with this declaration.
- Violations of this policy may result in disciplinary action internally and termination of partnerships externally.

By accepting this declaration, I, as the CEO or an authorized representative of this organization, confirm that our Board has approved this Declaration of No Lobbying for War or Conflict Policies and agree to implement it across all operations and engagements.`,
  },
  template_equal_opportunity: {
    title: "Equal Opportunity Employment (EOE) Policy",
    body: `# Equal Opportunity Employment (EOE) Policy

## Purpose

Our organization is committed to fostering a workplace built on dignity, respect, and fairness. This declaration affirms that we will provide equal opportunity in all aspects of employment and will actively work to eliminate discrimination, bias, and inequity in our practices.

## Scope

This policy applies to all employees, job applicants, contractors, and representatives of the organization, across all levels and functions.

## Commitments

1. Non-Discrimination
We do not and will not discriminate against any individual based on race, color, religion, gender, sexual orientation, gender identity, marital status, age, disability, national origin, veteran status, or any other status protected by law.

2. Fair Hiring & Advancement
All hiring, promotion, compensation, and training decisions will be based on merit, qualifications, and performance, ensuring fairness in every process.

3. Inclusive Workplace
We are dedicated to creating a safe and inclusive workplace where all employees feel valued, respected, and able to thrive.

4. Workplace Harassment
We strictly prohibit harassment, intimidation, or retaliation in any form. Clear channels for reporting grievances will be maintained and acted upon fairly.

5. Ongoing Accountability
We will conduct regular reviews of our employment practices to ensure compliance with this policy and uphold the principles of equality and inclusion.

By accepting this policy, I, as the CEO or an authorized representative of this organization, confirm that our Board has approved this Equal Opportunity Employment Policy and agree to implement it across all employment and workplace practices.`,
  },
  template_whistleblower_protection: {
    title: "Whistleblower Protection Policy",
    body: `# Whistleblower Protection Policy

## Purpose

Our organization is committed to integrity, accountability, and peace-driven practices. To achieve this, we must empower employees, contractors, and stakeholders to raise concerns about misconduct without fear of retaliation. This Whistleblower Protection Policy ensures a safe, transparent, and fair process for reporting concerns.

## Scope

This policy applies to all employees, officers, contractors, vendors, and representatives of the organization.

## Commitments

1. Protected Reporting
- Individuals may report concerns related to violations of law, company policy, corruption, harassment, discrimination, unethical conduct, or threats to public safety.
- Reports may be made anonymously, where permitted, and will be treated with confidentiality to the fullest extent possible.

2. Non-Retaliation Guarantee
- Retaliation of any kind (including demotion, dismissal, harassment, intimidation, or discrimination) against whistleblowers is strictly prohibited.
- Any attempt at retaliation will be grounds for disciplinary action, up to and including termination.

3. Reporting Channels
Concerns may be reported through established internal channels such as:
- HR or compliance officer
- Anonymous reporting system (if applicable)
- Designated email or hotline monitored by the organization's board or compliance team

4. Fair & Timely Investigation
- All reports will be promptly reviewed and investigated with impartiality.
- Findings will be documented, and corrective action will be taken where necessary.

5. Awareness & Training
- Employees will be informed of their rights under this policy.
- Periodic training will ensure all staff understand how to identify, report, and escalate concerns safely.

6. Accountability & Oversight
- The board or an appointed ethics committee will oversee whistleblower cases and ensure adherence to this policy.

By signing this declaration, we affirm our organization's commitment to protecting whistleblowers, upholding transparency, and ensuring accountability, consistent with human rights and peace-centered values.

By accepting this policy, I, as the CEO or an authorized representative of this organization, confirm that our Board has approved this Whistleblower Protection Policy and agree to implement it across all levels of the organization.`,
  },
  template_hr_handbook_small: {
    title: "Employee Handbook",
    body: `# Employee Handbook

## Introduction
This Employee Handbook provides comprehensive guidelines and policies to ensure a fair, safe, and inclusive workplace. It reflects our organization's commitment to Peace Seal values: respect, non-violence, integrity, equal opportunity, and community responsibility.
This handbook applies to all employees, contractors, and temporary workers. We encourage you to read it carefully and refer to it whenever you have questions about our policies or your rights and responsibilities.
## Equal Opportunity Employment
We are committed to providing equal employment opportunities to all qualified individuals regardless of race, color, religion, sex, national origin, age, disability, sexual orientation, gender identity, veteran status, or any other protected characteristic under applicable law.
## Equal Pay Policy
We maintain pay equity across gender, race, ethnicity, and other protected characteristics for equivalent roles and responsibilities. All employees performing substantially similar work receive equal compensation.
## Fair Hiring Practices
Our hiring process is based solely on job-related qualifications, skills, and abilities. We do not discriminate in recruitment, hiring, promotion, training, or any other employment decisions.

## Anti-Discrimination & Anti-Harassment Policy
## Zero Tolerance
We maintain a zero-tolerance policy for discrimination, harassment, and retaliation. All employees are entitled to a respectful work environment free from intimidation, hostility, or offensive conduct.
## Prohibited Conduct
Prohibited conduct includes but is not limited to:
- Discriminatory treatment based on protected characteristics
- Sexual harassment or harassment of any kind
- Offensive jokes, comments, or gestures
- Inappropriate physical contact
- Retaliation against individuals who report violations
## Reporting Procedures
Employees who experience or witness discrimination or harassment should report it immediately to their supervisor, Human Resources, or through our confidential reporting channels. All reports will be investigated promptly and confidentially.
## Protection Against Retaliation
We strictly prohibit retaliation against anyone who reports discrimination or harassment in good faith or participates in an investigation. Retaliation is a serious violation of this policy and will result in disciplinary action, up to and including termination.

## Fair Wage Practices
## Living Wage Commitment
We commit to providing fair wages that meet or exceed local living wage standards, enabling all employees to support themselves and their families with dignity.
## Wage Transparency
We maintain transparency in our compensation structure. Employees have the right to discuss wages with their colleagues, and we prohibit retaliation for such discussions.
## Benefits
We offer comprehensive benefits including:
- Health insurance coverage
- Paid time off and holidays
- Sick leave
- Professional development opportunities
- Retirement savings plans (where applicable)
## No Wage Theft
We will not engage in wage theft, exploitative labor practices, or any form of unfair compensation. All employees will be paid for all hours worked, including overtime when applicable.

## Workplace Safety & Health
## Safe Work Environment
We are committed to providing a safe and healthy work environment. We comply with all applicable occupational health and safety regulations and industry standards.
## Employee Responsibilities
All employees are expected to:
- Follow safety procedures and guidelines
- Report unsafe conditions or practices immediately
- Use safety equipment as required
- Participate in safety training programs
## Workplace Violence Prevention
We maintain a zero-tolerance policy for workplace violence, threats, or intimidation. Employees should report any concerns about safety or security immediately.

## Work-Life Balance
## Reasonable Accommodations
We recognize the importance of work-life balance and provide reasonable accommodations for employees with disabilities, religious observances, or family responsibilities, as required by law.
## Flexible Work Arrangements
Where feasible, we offer flexible work arrangements to help employees balance their professional and personal responsibilities.

## Code of Conduct
## Professional Standards
All employees are expected to:
- Treat colleagues, customers, partners, and vendors with respect and dignity
- Act with integrity and honesty in all business dealings
- Maintain confidentiality of sensitive information
- Contribute to a positive, inclusive workplace culture
- Report violations of policies or code of conduct
- Avoid conflicts of interest
## Respectful Communication
We promote open, respectful communication. Disagreements should be addressed professionally and constructively, without personal attacks or disrespectful behavior.
## Non-Violence Commitment
Our organization is committed to non-violence in all interactions. We resolve conflicts through dialogue, mediation, and peaceful means.

## Employee Rights
## Right to Organize
Employees have the right to organize, join, or support labor organizations, as protected by law.
## Right to Privacy
We respect employee privacy and handle personal information in accordance with applicable privacy laws and our privacy policy.
## Right to Fair Treatment
All employees have the right to fair treatment, due process, and protection from arbitrary or discriminatory actions.
## Grievance Procedures
## Filing Complaints
Employees who have concerns or complaints about workplace policies, practices, or treatment can file a grievance through our established procedures. All complaints will be investigated fairly and promptly.
## Confidentiality
We maintain confidentiality to the extent possible while conducting necessary investigations. We protect the privacy of all parties involved.
## Continuous Improvement
## Policy Updates
This handbook may be updated periodically to reflect changes in laws, regulations, or organizational practices. Employees will be notified of significant changes.
## Feedback
We welcome feedback on our policies and practices. Suggestions for improvement can be submitted through our feedback channels.

## Acknowledgment
By accepting this handbook, I acknowledge that I have read, understood, and agree to comply with these policies and guidelines. I understand that violations of these policies may result in disciplinary action, up to and including termination of employment.
I also understand that this handbook does not create a contract of employment and that employment is at-will, meaning either the employee or the employer may terminate the employment relationship at any time, with or without cause or notice, unless otherwise required by law.`,
  },
};

/**
 * Convert markdown text to HTML for email formatting
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlLines: string[] = [];
  let inParagraph = false;
  let currentParagraph: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line - close current paragraph if open
    if (!line) {
      if (inParagraph && currentParagraph.length > 0) {
        htmlLines.push(
          `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
        );
        currentParagraph = [];
        inParagraph = false;
      }
      continue;
    }

    // Headers
    if (line.startsWith("# ")) {
      if (inParagraph && currentParagraph.length > 0) {
        htmlLines.push(
          `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
        );
        currentParagraph = [];
        inParagraph = false;
      }
      htmlLines.push(
        `<h1 style="font-size: 24px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #2F4858;">${line.substring(2)}</h1>`
      );
      continue;
    }
    if (line.startsWith("## ")) {
      if (inParagraph && currentParagraph.length > 0) {
        htmlLines.push(
          `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
        );
        currentParagraph = [];
        inParagraph = false;
      }
      htmlLines.push(
        `<h2 style="font-size: 20px; font-weight: bold; margin-top: 18px; margin-bottom: 8px; color: #2F4858;">${line.substring(3)}</h2>`
      );
      continue;
    }
    if (line.startsWith("### ")) {
      if (inParagraph && currentParagraph.length > 0) {
        htmlLines.push(
          `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
        );
        currentParagraph = [];
        inParagraph = false;
      }
      htmlLines.push(
        `<h3 style="font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 6px; color: #2F4858;">${line.substring(4)}</h3>`
      );
      continue;
    }

    // Numbered lists (e.g., "1. Full Transparency")
    const numberedMatch = line.match(/^(\d+)\. (.+)$/);
    if (numberedMatch) {
      if (inParagraph && currentParagraph.length > 0) {
        htmlLines.push(
          `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
        );
        currentParagraph = [];
        inParagraph = false;
      }
      htmlLines.push(
        `<p style="margin: 8px 0; padding-left: 20px; line-height: 1.6; color: #333;"><strong>${numberedMatch[1]}.</strong> ${numberedMatch[2]}</p>`
      );
      continue;
    }

    // Bullet lists (e.g., "- This policy is reviewed")
    if (line.startsWith("- ")) {
      if (inParagraph && currentParagraph.length > 0) {
        htmlLines.push(
          `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
        );
        currentParagraph = [];
        inParagraph = false;
      }
      htmlLines.push(
        `<p style="margin: 6px 0; padding-left: 20px; line-height: 1.6; color: #333;">• ${line.substring(2)}</p>`
      );
      continue;
    }

    // Regular paragraph text
    currentParagraph.push(line);
    inParagraph = true;
  }

  // Close any remaining paragraph
  if (inParagraph && currentParagraph.length > 0) {
    htmlLines.push(
      `<p style="margin: 8px 0; line-height: 1.6; color: #333;">${currentParagraph.join(" ")}</p>`
    );
  }

  return htmlLines.join("\n");
}
