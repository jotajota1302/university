# University Connector Skill

This skill connects your OpenClaw agent to the OpenClaw University API for security and GDPR auditing.

## What it does

- Collects your agent's configuration files (SOUL.md, AGENTS.md, TOOLS.md)
- Sends them to the University API for analysis
- Returns a detailed audit report with score, grade, and recommendations

## Available scripts

### Security Audit
Run `audit.sh` to perform a security audit of your agent configuration.

### GDPR Audit
Run `audit-gdpr.sh` to perform a GDPR compliance audit of your agent configuration.

## Required environment variables

- `UNIVERSITY_TOKEN` — Your API bearer token (obtain via POST /v1/auth/token)
- `UNIVERSITY_API_URL` — The base URL of the University API (e.g., https://university.openclaw.com)

## Usage

```bash
# Set environment variables
export UNIVERSITY_TOKEN="your-token-here"
export UNIVERSITY_API_URL="https://university.openclaw.com"

# Run security audit
./skills/university-connector/audit.sh

# Run GDPR audit
./skills/university-connector/audit-gdpr.sh
```

## Agent instructions

When a user asks for an audit, run the appropriate script from the `skills/university-connector/` directory. Parse the JSON response and present the results clearly: show the score, grade, any failing checks, and the recommendations.
