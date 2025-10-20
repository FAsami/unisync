# Provider Quick Reference

Quick reference card for OTP provider configuration in Unisync.

## Implementation Status

| Provider Type | Status         | Documentation                                                            |
| ------------- | -------------- | ------------------------------------------------------------------------ |
| **SMS**       | ✅ Implemented | [Full Guide](/guide/providers#sms-provider-configuration)                |
| **Email**     | ⏳ Coming Soon | [Status Info](/guide/providers#email-provider-configuration-coming-soon) |

## SMS Provider Setup (BulkSMS Bangladesh)

### 1. Environment Variables

```env
BULK_SMS_API_KEY=your_api_key_here
BULK_SMS_SECRET_KEY=your_secret_key_here
BULK_SMS_CALLER_ID=your_sender_id
```

### 2. Get Credentials

1. Visit [BulkSMSBD.net](https://bulksmsbd.net)
2. Create account
3. Purchase credits
4. Copy API credentials

### 3. Test Configuration

```bash
# Send test OTP
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

### 4. Check Logs

```bash
tail -f server/logs/combined-*.log | grep "SMS provider"
```

Expected output:

```
Initializing SMS provider: bulksmsbd
SMS sent successfully via BulkSMSBD
```

## Common Issues

| Issue                                  | Solution                     |
| -------------------------------------- | ---------------------------- |
| `SMS provider configuration not found` | Apply Hasura migrations      |
| `BULK_SMS_API_KEY is required`         | Add to `.env` file           |
| `BulkSMSBD rejected SMS`               | Check credentials & credits  |
| `Rate limit exceeded`                  | Wait 1 hour or adjust limits |

## Quick Links

- 📖 [Full Provider Guide](/guide/providers)
- 🔐 [Authentication Docs](/api/authentication)
- ⚙️ [Installation Guide](/guide/installation)
- 🔧 [API Reference](/api/)

## Configuration Architecture

```
┌─────────────────────────────────────────┐
│         OTP Send Request                │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│    identifierType === "PHONE"?          │
└───────────┬─────────────────────────────┘
            │ Yes
            ▼
┌─────────────────────────────────────────┐
│    Query settings.config table          │
│    identifier = 'OTP_PROVIDER'          │
└───────────┬─────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│    Load SMS Provider                    │
│    (bulksmsbd)                          │
└───────────┬─────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│    Read Environment Variables           │
│    BULK_SMS_API_KEY, etc.               │
└───────────┬─────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│    Send SMS via Provider API            │
└─────────────────────────────────────────┘
```

## Environment Variables Reference

### Active Variables

```env
# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6

# Rate Limits
OTP_SEND_LIMIT_PER_HOUR=3
OTP_SEND_LIMIT_PER_IP_PER_HOUR=10
OTP_VERIFY_LIMIT_PER_15MIN=5

# BulkSMS Bangladesh (Active)
BULK_SMS_API_KEY=required
BULK_SMS_SECRET_KEY=required
BULK_SMS_CALLER_ID=required
```

### Not Yet Active

```env
# Email (not implemented)
EMAIL_PROVIDER=console
RESEND_API_KEY=
SENDGRID_API_KEY=

# Future SMS providers (not implemented)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
AWS_SNS_REGION=
```

## Message Templates

### Login

```
Your UniSync login verification code is {OTP}.
Valid for 5 minutes. Do not share this code with anyone.
```

### Signup

```
Your UniSync signup verification code is {OTP}.
Valid for 5 minutes. Do not share this code with anyone.
```

### Password Reset

```
Your UniSync password reset code is {OTP}.
Valid for 5 minutes. Do not share this code with anyone.
```

## Rate Limits

| Endpoint                  | Limit       | Window     |
| ------------------------- | ----------- | ---------- |
| Send OTP (per identifier) | 3 requests  | 1 hour     |
| Send OTP (per IP)         | 10 requests | 1 hour     |
| Verify OTP                | 5 requests  | 15 minutes |

## Support

- 📝 Need help? Check [Full Documentation](/guide/providers)
- 🐛 Found a bug? Check [troubleshooting section](/guide/providers#troubleshooting)
- 💡 Want to add a provider? See [adding providers guide](/guide/providers#adding-new-sms-providers)
