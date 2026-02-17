# OpenClaw University API

API-first auditing and certification platform for OpenClaw agents.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client and push schema to SQLite
npx prisma generate && npx prisma db push

# 3. Start the development server
npm run dev
```

The server starts on `http://localhost:3000`.

## Run Tests

```bash
npm test
```

## Endpoints

### GET /v1/health

```bash
curl http://localhost:3000/v1/health
```

Response:
```json
{ "status": "ok", "version": "1.0.0", "service": "openclaw-university" }
```

---

### POST /v1/auth/token

Request a Bearer token (valid 30 days).

```bash
curl -X POST http://localhost:3000/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{ "clientId": "my-client", "secret": "my-secret" }'
```

Response:
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": "2026-03-19T12:00:00.000Z"
}
```

---

### POST /v1/audit/security

Run a security audit on agent files. Requires Bearer token.

```bash
curl -X POST http://localhost:3000/v1/audit/security \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "files": {
      "SOUL.md": "# Agent Soul\nThis agent helps users complete tasks.",
      "AGENTS.md": "# Agents\nMain orchestrator agent.",
      "TOOLS.md": "# Tools\nSearch, calculator.",
      "config": "dmPolicy: strict\nallowFrom: trusted\nsessionId: enabled"
    }
  }'
```

Response:
```json
{
  "auditId": "uuid",
  "timestamp": "2026-02-17T12:00:00.000Z",
  "score": 100,
  "grade": "A",
  "checks": [
    {
      "id": "SEC-01",
      "status": "PASS",
      "severity": "CRITICAL",
      "message": "No API keys or tokens detected in plaintext",
      "fix": null
    }
  ],
  "recommendations": ["All security checks passed. Your agent configuration is secure."],
  "certifiable": true,
  "certificationBlockers": []
}
```

## Security Checks

| Check  | Severity | Description |
|--------|----------|-------------|
| SEC-01 | CRITICAL | Detects API keys/tokens in plaintext |
| SEC-02 | HIGH     | Verifies dmPolicy is configured |
| SEC-03 | HIGH     | Verifies allowFrom is configured |
| SEC-04 | HIGH     | Detects passwords/credentials in SOUL/AGENTS |
| SEC-05 | HIGH     | Detects destructive commands |
| SEC-06 | MEDIUM   | Checks for personal data (email, phone) |
| SEC-07 | MEDIUM   | Detects data exfiltration instructions |
| SEC-08 | LOW      | Verifies session isolation configured |

## Scoring

- Start at 100 points
- CRITICAL failure: -25 points
- HIGH failure: -15 points
- MEDIUM failure: -10 points
- LOW failure: -5 points

| Grade | Score Range |
|-------|-------------|
| A     | 90-100      |
| B     | 75-89       |
| C     | 60-74       |
| D     | 40-59       |
| F     | < 40        |

Agents are **certifiable** when: score ≥ 75 and no CRITICAL/HIGH failures.
