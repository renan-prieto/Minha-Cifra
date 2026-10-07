ALTER TABLE Users
  ADD COLUMN password_reset_token_hash CHAR(64) NULL,
  ADD COLUMN password_reset_expires_at DATETIME NULL,
  ADD INDEX idx_users_password_reset_token_hash (password_reset_token_hash);