export const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export const PEACE_SEAL_INDUSTRIES = [
  "Agriculture",
  "Forestry",
  "Fishing",
  "Manufacturing",
  "Construction",
  "Retail",
  "Wholesale trade",
  "Transportation and warehousing",
  "Information and communication",
  "Financial",
  "Insurance activities",
  "Real estate",
  "Professional activities",
  "Scientific activities",
  "Technical activities",
  "Education",
  "Healthcare",
  "Social work",
  "Arts",
  "Entertainment",
  "Hospitality",
  "Food",
  "Public administration",
  "Nonprofit",
  "Mining",
  "Research",
  "Others",
];

// Business size types and utilities
export type BusinessSize = "small" | "medium" | "large";

export const BUSINESS_SIZE_OPTIONS = [
  { value: "small", label: "Small Business (1 - 20 employees)" },
  { value: "medium", label: "Medium Business (21 - 50 employees)" },
  { value: "large", label: "Large Business (+50 employees)" },
] as const;

/**
 * Convert business size string to numeric range (returns representative number)
 * - small: 10 (1-20)
 * - medium: 35 (21-50)
 * - large: 100 (50+)
 */
export function businessSizeToNumber(
  businessSize: BusinessSize | string | null | undefined
): number | null {
  if (!businessSize) return null;

  switch (businessSize) {
    case "small":
      return 10; // Representative of 1-20 range
    case "medium":
      return 35; // Representative of 21-50 range
    case "large":
      return 100; // Representative of 50+ range
    default:
      return null;
  }
}

/**
 * Convert numeric employee count to business size string
 */
export function numberToBusinessSize(
  employeeCount: number | null | undefined
): BusinessSize | null {
  if (!employeeCount || employeeCount <= 0) return null;

  if (employeeCount <= 20) return "small";
  if (employeeCount <= 50) return "medium";
  return "large";
}

/**
 * Get the maximum employee count for a business size
 */
export function getMaxEmployeesForSize(
  businessSize: BusinessSize | string | null | undefined
): number | null {
  if (!businessSize) return null;

  switch (businessSize) {
    case "small":
      return 20;
    case "medium":
      return 50;
    case "large":
      return null; // No max for large
    default:
      return null;
  }
}

/**
 * Check if business size requires RFQ (Request for Quote)
 */
export function requiresRFQ(
  businessSize: BusinessSize | string | null | undefined
): boolean {
  return businessSize === "large";
}

// Helper function to convert timestamp from seconds to milliseconds
export function convertTimestampToMs(
  timestamp: string | number | null | undefined
): number | null {
  if (!timestamp) return null;

  let timestampNum: number;
  if (typeof timestamp === "number") {
    timestampNum = timestamp;
  } else if (typeof timestamp === "string") {
    const parsed = parseInt(timestamp, 10);
    if (isNaN(parsed)) return null;
    timestampNum = parsed;
  } else {
    return null;
  }

  // Detect if timestamp is already in milliseconds
  // Timestamps in seconds are typically < 13 digits (max ~2147483647 for 32-bit)
  // Timestamps in milliseconds are typically >= 13 digits
  // If timestamp is less than year 2000 in milliseconds (946684800000), it's likely in seconds
  const threshold = 946684800000; // Jan 1, 2000 in milliseconds

  // If the timestamp is less than the threshold, it's likely in seconds
  if (timestampNum < threshold) {
    return timestampNum * 1000;
  }

  // Otherwise, assume it's already in milliseconds
  return timestampNum;
}

// Helper function to format timestamp (seconds to date string)
export function formatTimestampDate(
  timestamp: string | number | null | undefined
): string {
  const timestampMs = convertTimestampToMs(timestamp);
  if (timestampMs === null) return "—";
  return new Date(timestampMs).toLocaleDateString();
}

// Helper function to format timestamp with date and time
export function formatTimestampDateTime(
  timestamp: string | number | null | undefined
): string {
  const timestampMs = convertTimestampToMs(timestamp);
  if (timestampMs === null) return "—";
  return new Date(timestampMs).toLocaleString();
}
