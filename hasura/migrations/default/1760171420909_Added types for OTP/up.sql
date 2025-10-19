CREATE TYPE "user"."identifier_type_enum" AS ENUM('EMAIL', 'PHONE'); 
CREATE TYPE "user"."otp_purpose_enum" AS ENUM('LOGIN', 'SIGNUP', 'PASSWORD_RESET');
CREATE TYPE "user"."otp_action_type_enum" AS ENUM('SEND', 'RESEND', 'VERIFY');
