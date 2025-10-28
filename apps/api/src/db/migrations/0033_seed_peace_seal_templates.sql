-- Seed Peace Seal Template Documents
-- Migration: 0033_seed_peace_seal_templates.sql
-- Date: 2025-01-25

-- Insert all template documents from the Peace Seal Certification Questionnaire PDF

-- Peace Pledge Declaration
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_peace_pledge_declaration', 'Peace Pledge Declaration', 'CEO/Owner Peace Pledge Declaration for signing electronically', 'template', 'https://docs.google.com/document/d/1txmbhuQ09RbgnLNa17b-5XQK6K_1lvi4-rgpk4psdDk/edit?usp=sharing', 'peace_statements', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- HR/Employee Handbook Template - Small Business
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_hr_handbook_small', 'HR or Employee Handbook (Small Business)', 'Sample HR handbook with anti-discrimination and fair wage policies for small businesses', 'template', 'https://docs.google.com/document/d/1yb6cUNA2PpyKXKzReyQEvbHCFztDC5Of3caQoHX3v8w/edit?usp=sharing', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- HR/Employee Handbook Template - Medium & Large Business  
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_hr_handbook_medium_large', 'HR or Employee Handbook (Medium & Large Business)', 'Sample HR handbook with anti-discrimination and fair wage policies for medium and large businesses', 'template', 'https://docs.google.com/document/d/1txmbhuQ09RbgnLNa17b-5XQK6K_1lvi4-rgpk4psdDk/edit?usp=sharing', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Supplier Self-Declaration
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_supplier_self_declaration', 'Supplier Self-Declaration', 'Supplier declaration confirming no ties to arms/conflict industries', 'template', 'https://docs.google.com/document/d/11ke3OJIUpAdnaJEOWwuS9y78FWZzGJjpoNtl47ckH_U/edit?usp=sharing', 'supplier_codes', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Fair Wage Self-Declaration
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_fair_wage_declaration', 'Fair Wage Self-Declaration', 'Self-declaration that company complies with fair wage practices', 'template', 'https://docs.google.com/document/d/10XxZwVe0MYHtpVXAzz4lzgoVI4IOHIPuY1R8tgFcfo8/edit?usp=sharing', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Anti-Harassment and Anti-Discrimination Policy
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_anti_harassment_policy', 'Anti-Harassment and Anti-Discrimination Policy', 'Signed anti-harassment and anti-discrimination policy', 'template', 'https://docs.google.com/document/d/1sEIDE3b74JjSZkL0UFFDMG2JN_yzxlqQR9_cV1xVITA/edit?usp=sharing', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Sustainable Sourcing Statement
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_sustainable_sourcing', 'Sustainable Sourcing Statement', 'Signed statement on sustainable sourcing or waste management', 'template', 'https://docs.google.com/document/d/1DhoW2D2Zm5uzURYOO31QIIByXqY4KGO-YLMayinLrvk/edit?usp=sharing', 'compliance', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- No Arms Ties Declaration
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_no_arms_ties', 'No Arms Ties Declaration', 'Declaration of no ties with arms industries or sanctioned regimes', 'template', 'https://docs.google.com/document/d/10X4LOIAsytc71hpOEPFsooQyfhCG9cdboQZeuVJvFTg/edit?usp=sharing', 'political_guidelines', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Complaint Resolution Mediation
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_complaint_resolution', 'Complaint Resolution Process', 'Process documentation for complaint resolution with mediation', 'template', 'https://docs.google.com/document/d/1VLAd3ajfkFb_KRVD8ovnc4QfBPmUVY6cP6a_aPhC34A/edit?usp=sharing', 'compliance', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Board-Approved Peace & Human Rights Policy (Medium/Large)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_board_peace_policy', 'Board-Approved Peace & Human Rights Policy', 'Board-approved Peace and Human Rights Policy', 'template', 'https://docs.google.com/document/d/1u67JW5jBsmusJPiFKbKGnVMR4qK9wwWRcVFwy__Rcjw/edit?usp=sharing', 'peace_statements', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Beneficial Ownership Policy (Medium/Large)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_beneficial_ownership', 'Anti-corruption: Company Beneficial Ownership Policy', 'Anti-corruption policy for company beneficial ownership disclosure', 'template', 'https://docs.google.com/document/d/1OhMfTYHUABVa3Lwlto5jfKngv_tGnsbvEAJDMipwz70/edit?usp=sharing', 'compliance', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Supplier/Vendor Code of Conduct (Medium/Large)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_supplier_code_of_conduct', 'Supplier/Vendor Code of Conduct', 'Supplier and vendor code of conduct', 'template', 'https://docs.google.com/document/d/1TpsjbF9ZOcL8YU3Dkaxjt0BO6FCgfjMjal5gWh3nzfM/edit?usp=sharing', 'supplier_codes', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- No Lobbying Declaration (Medium/Large)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_no_lobbying', 'No Lobbying Declaration', 'Declaration of no lobbying for war/conflict policies', 'template', 'https://docs.google.com/document/d/1h223rqlhPfzAT1EYlge5xDWy_xDXZSSt760zC1dchk/edit?usp=sharing', 'political_guidelines', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Equal Opportunity Employment Policy (Medium/Large)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_equal_opportunity', 'Equal Opportunity Employment Policy', 'Equal Opportunity Employment (EOE) or equivalent policy', 'template', 'https://docs.google.com/document/d/1dd12-SRBwDoVIHLmp0taI6ZCme9jBbxkFWsaF4y6if8/edit?usp=sharing', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Whistleblower Protection Policy (Medium/Large)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_whistleblower_protection', 'Whistleblower Protection Policy', 'Whistleblower protection policy', 'template', 'https://docs.google.com/document/d/1FSlb3RjMTiN8YAKTz9UncoRI2P3Y214kbUTg9z_FBbY/edit?usp=sharing', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

-- Employee Satisfaction Survey (All sizes)
INSERT INTO peace_seal_center_resources (id, title, description, resource_type, file_url, category, is_public, access_level, created_at, updated_at)
VALUES ('template_employee_survey', 'Employee Satisfaction Survey', 'Employee satisfaction or feedback survey summary', 'template', 'https://docs.google.com/document/d/1WwYx6CIT-D4cPIzVIg1kd-2PIKvCX237zKUYJ_S386g/edit?tab=t.0#heading=h.fyxstpd3tbh7', 'hr_policies', 1, 'all', UNIXEPOCH('now'), UNIXEPOCH('now'));

