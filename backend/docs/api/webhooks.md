# Webhooks API Documentation

Webhook handlers.

## 4dd Endpoints

### Clerk webhooks
**POST** `/api/webhooks/clerk`

Consumes raw JSON for signature verification.

## 6a8 Common failure modes

- **400** invalid signature
- **500** misconfiguration (missing `CLERK_WEBHOOK_SECRET`) or internal processing failure
