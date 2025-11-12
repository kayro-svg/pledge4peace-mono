/**
 * Agreement template texts for backend use
 * These match the frontend templates to ensure consistency
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
