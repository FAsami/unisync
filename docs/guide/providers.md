# OTP Provider Configuration

This guide explains how to configure email and SMS providers for sending One-Time Password (OTP) codes in Unisync.

:::tip Quick Reference
Looking for a quick setup? Check the [Provider Quick Reference](/guide/provider-quick-reference) for condensed instructions.
:::

## Overview

Unisync supports OTP delivery via:

- **SMS Providers**: For phone number verification
- **Email Providers**: For email verification _(Coming Soon)_

## Current Implementation Status

### SMS Providers ✅

SMS OTP delivery is **fully implemented** and configured through the database (`settings_config` table). Currently supported:

- **BulkSMS Bangladesh** (`bulksmsbd`)

### Email Providers ⏳

Email OTP delivery is **planned but not yet implemented**. The configuration exists in environment variables, but the actual email sending functionality needs to be implemented.

## SMS Provider Configuration

### Architecture

SMS providers are configured through the database rather than environment variables. This provides:

- Dynamic configuration without server restart
- Support for multiple providers
- Template customization
- Runtime provider switching

### BulkSMS Bangladesh Setup

#### Step 1: Set Environment Variables

Add the following to your `server/.env` file:

```env
# BulkSMS Bangladesh Configuration
BULK_SMS_API_KEY=your_api_key_here
BULK_SMS_SECRET_KEY=your_secret_key_here
BULK_SMS_CALLER_ID=your_sender_id
```

To obtain these credentials:

1. Visit [BulkSMSBD.net](https://bulksmsbd.net)
2. Create an account
3. Purchase SMS credits
4. Get your API credentials from the dashboard

#### Step 2: Database Configuration

The SMS provider configuration is stored in the `settings.config` table with identifier `OTP_PROVIDER`. This is automatically set up during database migrations.

**Default Configuration:**

```json
{
  "provider": {
    "identifier": "bulksmsbd",
    "website": "https://bulksmsbd.net",
    "endpoint": {
      "url": "http://118.67.213.114:3775/sendtext",
      "method": "GET",
      "query": [
        {
          "key": "apikey",
          "value": { "name": "BULK_SMS_API_KEY", "type": "ENV_VARIABLE" }
        },
        {
          "key": "secretkey",
          "value": { "name": "BULK_SMS_SECRET_KEY", "type": "ENV_VARIABLE" }
        },
        {
          "key": "callerID",
          "value": { "name": "BULK_SMS_CALLER_ID", "type": "ENV_VARIABLE" }
        },
        {
          "key": "toUser",
          "value": { "type": "TEMPLATE_VARIABLE", "value": "{{number}}" }
        },
        {
          "key": "messageContent",
          "value": { "type": "TEMPLATE_VARIABLE", "value": "{{message}}" }
        }
      ],
      "headers": {
        "Content-Type": "application/json"
      },
      "variables": {
        "env": [
          "BULK_SMS_API_KEY",
          "BULK_SMS_SECRET_KEY",
          "BULK_SMS_CALLER_ID"
        ],
        "template": ["number", "message"]
      }
    }
  },
  "template": {
    "otp": {
      "message": "Your OTP is {{otp}}",
      "variables": ["otp"]
    }
  },
  "providerToUse": "bulksmsbd"
}
```

#### Step 3: Verify Configuration

To verify your SMS provider is configured correctly:

1. Start your server:

   ```bash
   cd server
   yarn dev
   ```

2. Send a test OTP:

   ```bash
   curl -X POST http://localhost:9201/api/v1/otp/send \
     -H "Content-Type: application/json" \
     -d '{
       "input": {
         "identifier": "+8801712345678",
         "identifierType": "PHONE",
         "purpose": "LOGIN"
       }
     }'
   ```

3. Check the server logs for:
   ```
   Initializing SMS provider: bulksmsbd
   SMS sent successfully via BulkSMSBD
   ```

### Message Templates

The default SMS messages for different purposes are:

- **Login**: `Your UniSync login verification code is {OTP}. Valid for 5 minutes. Do not share this code with anyone.`
- **Signup**: `Your UniSync signup verification code is {OTP}. Valid for 5 minutes. Do not share this code with anyone.`
- **Password Reset**: `Your UniSync password reset code is {OTP}. Valid for 5 minutes. Do not share this code with anyone.`

These templates are defined in the provider implementation and can be customized by modifying:

```
server/src/lib/providers/sms/bulksmsbd.ts
```

## Email Provider Configuration (Coming Soon)

### Planned Support

Email OTP delivery is planned with support for:

- **Console** (`console`): Log to console (development only)
- **Resend** (`resend`): Resend email service
- **SendGrid** (`sendgrid`): SendGrid email service
- **AWS SES** (`ses`): Amazon Simple Email Service

### Environment Variables (Not Yet Active)

The following environment variables are defined but not yet used:

```env
# Email Provider (console, resend, sendgrid, ses)
EMAIL_PROVIDER=console
RESEND_API_KEY=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
AWS_SES_REGION=
AWS_SES_FROM_EMAIL=
```

### Current Email OTP Behavior

When you send an OTP with `identifierType: "EMAIL"`, the system will:

1. Create the OTP record in the database ✅
2. Hash and store the OTP securely ✅
3. **Skip sending the email** ⚠️

The OTP verification will work, but users won't receive the email. This is suitable for testing but requires implementation for production use.

## Adding New SMS Providers

### Step 1: Create Provider Implementation

Create a new file in `server/src/lib/providers/sms/`:

```typescript
// server/src/lib/providers/sms/twilio.ts
import { SMSProvider } from "../interface";
import { config } from "../../../config/environment";
import logger from "../../../config/logger";
import twilio from "twilio";

interface ProviderConfig {
  provider: {
    identifier: string;
    endpoint: {
      variables?: {
        env?: string[];
      };
    };
  };
  template: Record<string, any>;
  providerToUse: string;
}

export const createTwilioProvider = (
  providerConfig: ProviderConfig
): SMSProvider => {
  // Validate environment variables
  const requiredEnvVars = providerConfig.provider.endpoint.variables?.env || [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is required for Twilio provider`);
    }
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const getSMSMessage = (
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): string => {
    const expiryMinutes = config.OTP_EXPIRY_MINUTES;
    switch (purpose) {
      case "LOGIN":
        return `Your verification code is ${otp}. Valid for ${expiryMinutes} minutes.`;
      case "SIGNUP":
        return `Welcome! Your verification code is ${otp}. Valid for ${expiryMinutes} minutes.`;
      case "PASSWORD_RESET":
        return `Your password reset code is ${otp}. Valid for ${expiryMinutes} minutes.`;
    }
  };

  const sendSMS = async (to: string, message: string): Promise<void> => {
    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_FROM_NUMBER,
        to: to,
      });

      logger.info(`SMS sent successfully via Twilio`, {
        to,
        messageId: result.sid,
        status: result.status,
      });
    } catch (error) {
      logger.error(`Failed to send SMS via Twilio`, { error, to });
      throw new Error("Failed to send SMS");
    }
  };

  return {
    send: async (
      to: string,
      otp: string,
      purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
    ): Promise<void> => {
      const message = getSMSMessage(otp, purpose);
      await sendSMS(to, message);
    },
    sendSMS,
  };
};
```

### Step 2: Register Provider

Update `server/src/lib/providers/sms/index.ts`:

```typescript
import { SMSProvider } from "../interface";
import { createBulkSMSBDProvider } from "./bulksmsbd";
import { createTwilioProvider } from "./twilio"; // Add this
import logger from "../../../config/logger";
import { gqlClient } from "../../graphqlClient";
import { GET_SETTING } from "../../../controllers/otp/gql";

export const getSMSProvider = async (): Promise<SMSProvider> => {
  const result = await gqlClient.query(GET_SETTING, {
    where: {
      identifier: { _eq: "OTP_PROVIDER" },
    },
  });

  if (!result.settings_config || result.settings_config.length === 0) {
    throw new Error("SMS provider configuration not found in settings");
  }

  const providerConfig = result.settings_config[0].value;
  const provider = providerConfig.providerToUse;

  logger.info(`Initializing SMS provider: ${provider}`);

  if (provider === "bulksmsbd") {
    return createBulkSMSBDProvider(providerConfig);
  } else if (provider === "twilio") {
    return createTwilioProvider(providerConfig); // Add this
  } else {
    throw new Error(`SMS provider "${provider}" is not supported`);
  }
};
```

### Step 3: Add Database Configuration

Update the database with your new provider configuration:

```sql
UPDATE settings.config
SET value = '{
  "provider": {
    "identifier": "twilio",
    "website": "https://www.twilio.com",
    "endpoint": {
      "variables": {
        "env": ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]
      }
    }
  },
  "template": {
    "otp": {
      "message": "Your OTP is {{otp}}",
      "variables": ["otp"]
    }
  },
  "providerToUse": "twilio"
}'::jsonb
WHERE identifier = 'OTP_PROVIDER';
```

### Step 4: Set Environment Variables

Add to `server/.env`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

## Development & Testing

### Console Provider (Development)

For development and testing without sending actual SMS/emails, you can:

1. Check the server logs to see generated OTP codes
2. Use the logged OTP codes for verification

The OTP codes are logged as:

```
OTP sent successfully via PHONE
OTP Code (development): 123456
```

### Testing Provider Integration

Create a test script:

```bash
# Send OTP for registration
curl -X POST http://localhost:9201/api/v1/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "identifier": "+8801712345678",
      "identifierType": "PHONE",
      "purpose": "SIGNUP"
    }
  }'

# Note: To verify OTP, use the appropriate auth endpoint:
# - For registration: POST /api/v1/auth/register/verify
# - For password reset: POST /api/v1/auth/reset-password/verify
# - For login: Use POST /api/v1/auth/login with phone + password

# Example: Verify registration OTP
curl -X POST http://localhost:9201/api/v1/auth/register/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+8801712345678",
    "otp": "123456"
  }'
```

## Provider Interface

All providers must implement the following interface:

```typescript
export interface OTPProvider {
  send(
    to: string,
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): Promise<void>;
}

export interface SMSProvider extends OTPProvider {
  sendSMS(to: string, message: string): Promise<void>;
}

export interface EmailProvider extends OTPProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
```

## Troubleshooting

### SMS Not Sending

1. **Check environment variables**:

   ```bash
   cd server
   grep BULK_SMS .env
   ```

2. **Verify database configuration**:

   ```sql
   SELECT * FROM settings.config WHERE identifier = 'OTP_PROVIDER';
   ```

3. **Check server logs**:

   ```bash
   tail -f server/logs/combined-*.log
   ```

4. **Common errors**:
   - `SMS provider configuration not found`: Database migration not applied
   - `BULK_SMS_API_KEY is required`: Environment variable missing
   - `BulkSMSBD rejected SMS`: Invalid credentials or insufficient credits

### Provider Not Loading

1. Restart the server after changing environment variables
2. Clear any cached connections
3. Check that the provider name in database matches the code

### Rate Limiting Issues

If you're hitting rate limits during testing:

1. Temporarily increase limits in `.env`:

   ```env
   OTP_SEND_LIMIT_PER_HOUR=10
   OTP_SEND_LIMIT_PER_IP_PER_HOUR=50
   ```

2. Clear rate limit records:
   ```sql
   DELETE FROM user.otp_rate_limit WHERE created_at < NOW() - INTERVAL '1 hour';
   ```

## Security Best Practices

1. **Never commit credentials**: Always use environment variables
2. **Use HTTPS**: Ensure your API endpoint uses HTTPS in production
3. **Monitor usage**: Track SMS sending costs and set up alerts
4. **Rotate credentials**: Regularly update API keys
5. **Test in staging**: Verify provider configuration before production
6. **Rate limiting**: Keep OTP rate limits enabled to prevent abuse
7. **Audit logs**: Monitor OTP sending patterns for suspicious activity

## Next Steps

- [Authentication Guide](/api/authentication)
- [API Reference](/api/)
- [Installation Guide](/guide/installation)

## Contributing

To add support for new providers:

1. Implement the provider in `server/src/lib/providers/sms/` or `email/`
2. Register it in the appropriate index file
3. Document the required environment variables
4. Add database migration for configuration
5. Test thoroughly before submitting PR
