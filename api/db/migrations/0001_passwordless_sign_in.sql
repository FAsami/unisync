-- Sign-in is phone + one-time code only (UX review decision 1), so accounts
-- created from a department roster have no password.
ALTER TABLE "user".account ALTER COLUMN password DROP NOT NULL;
