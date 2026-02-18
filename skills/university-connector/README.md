# University Connector

Scripts to connect your OpenClaw agent to the University API for security and GDPR auditing.

## Setup

1. Get an API token:
```bash
curl -X POST https://university.openclaw.com/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "your-client-id", "secret": "your-secret"}'
```

2. Set environment variables:
```bash
export UNIVERSITY_TOKEN="your-token-from-step-1"
export UNIVERSITY_API_URL="https://university.openclaw.com"
```

3. Make scripts executable:
```bash
chmod +x skills/university-connector/audit.sh
chmod +x skills/university-connector/audit-gdpr.sh
```

## Usage

### Security Audit
```bash
./skills/university-connector/audit.sh
```

Reads `SOUL.md`, `AGENTS.md`, and `TOOLS.md` from the current directory and sends them to the security audit endpoint. Returns a JSON report with score, grade, checks, and recommendations.

### GDPR Audit
```bash
./skills/university-connector/audit-gdpr.sh
```

Reads `SOUL.md`, `AGENTS.md`, `TOOLS.md`, and `MEMORY.md` from the current directory and sends them to the GDPR audit endpoint. Returns a JSON report with GDPR compliance score, checks, and recommendations.

## Requirements

- `curl` — for HTTP requests
- `jq` — for JSON payload construction

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `UNIVERSITY_TOKEN` | Yes | Bearer token for API authentication |
| `UNIVERSITY_API_URL` | Yes | Base URL of the University API |
