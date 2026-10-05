ALTER TABLE Users
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN email_verification_token_hash CHAR(64) NULL,
  ADD COLUMN email_verification_expires_at DATETIME NULL,
  ADD UNIQUE INDEX uq_users_email (email),
  ADD INDEX idx_users_email_verification_token_hash (email_verification_token_hash);