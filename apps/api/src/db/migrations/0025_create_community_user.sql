-- Create the special community-user for community-listed companies
-- This user will be used as the created_by_user_id for companies added by the community

INSERT OR IGNORE INTO users (
  id, 
  email, 
  name, 
  password, 
  status, 
  role, 
  email_verified, 
  created_at, 
  updated_at, 
  notify_inapp, 
  notify_email
) VALUES (
  'community-user',
  'community@pledge4peace.org',
  'Community User',
  'placeholder-password', -- A placeholder password as this user won't log in
  'active',
  'user',
  1, -- Mark as verified
  unixepoch(),
  unixepoch(),
  0,
  0
);
