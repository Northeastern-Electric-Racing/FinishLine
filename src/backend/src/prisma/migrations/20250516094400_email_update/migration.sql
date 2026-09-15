BEGIN;

-- Update all email addresses that end with @husky.neu.edu to end with @northeastern.edu
UPDATE "User"
SET email = REPLACE(email, '@husky.neu.edu', '@northeastern.edu')
WHERE email LIKE '%@husky.neu.edu';

COMMIT;