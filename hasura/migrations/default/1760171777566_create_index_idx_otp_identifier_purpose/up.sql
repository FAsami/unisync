CREATE UNIQUE INDEX "idx_otp_identifier_purpose" on
  "user"."otp_transaction" using btree ("identifier", "purpose", "verified", "expires_at");
