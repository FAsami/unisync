CREATE  INDEX "idx_otp_expires_at" on
  "user"."otp_transaction" using btree ("expires_at");
