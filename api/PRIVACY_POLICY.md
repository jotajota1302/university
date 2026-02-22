# Privacy Policy — OpenClaw University

**Effective date:** 2026-02-18  
**Last updated:** 2026-02-18  
**Service:** OpenClaw University API (https://openclaw-university-api.onrender.com)  
**Dashboard:** https://openclaw-university-dashboard.vercel.app  
**Contact:** josejuan.jimenez83@gmail.com

---

## 1. Who We Are

OpenClaw University ("we", "us", "our") is a service that allows users to audit AI agents for security and GDPR compliance, issue certifications, and manage audit history. The service is operated by Jose Juan Jiménez, based in Spain (EU).

---

## 2. What Data We Collect

### 2.1 Account / Authentication Data
- **API token** (UUID, hashed reference) — used to authenticate your requests
- **Client identifier** (clientId string you provide when generating a token) — used for reference only
- **Token metadata**: creation date, expiry date, tier (free/pro/enterprise), usage counters

We do **not** collect your name, email address, or any personal profile information during standard API usage.

### 2.2 Audit Data (Content You Submit)
When you submit an audit, we receive the agent configuration content you paste or upload (e.g., SOUL.md, AGENTS.md, config files). 

**Important:**
- ✅ This content is **analyzed in-memory** to generate the audit report
- ✅ The **results** (pass/fail checks, grade, summary) are stored in our database linked to your token
- ❌ The **raw content** you submitted (the actual file text) is **NOT stored** after analysis completes
- ❌ We do **not** train any AI models with your data

### 2.3 Certification Data
When a certification is issued:
- Certification ID (UUID)
- Agent identifier you provide
- Audit reference (which audit it was based on)
- Issue date and expiry date
- Grade and passing checks

Certification data is stored to enable the public badge endpoint (`/v1/certifications/:id/badge`) and public verification (`/v1/certifications/:id/verify`).

**Note:** If you request a public badge, the certification grade and agent identifier become publicly accessible via that URL.

### 2.4 Technical / Usage Data
- API request logs (endpoint called, timestamp, HTTP status code) — retained for 30 days for debugging
- Audit count per token — used for tier enforcement (rate limiting)

---

## 3. What We Do NOT Collect

- ❌ Your personal identity (no name, email, or address required)
- ❌ The raw text of your agent configuration files (not persisted after analysis)
- ❌ Browser cookies or tracking pixels
- ❌ IP addresses linked to personal profiles
- ❌ Third-party analytics or advertising trackers

---

## 4. Legal Basis for Processing (GDPR, Art. 6)

| Data | Legal Basis |
|------|-------------|
| Token and authentication data | **Contract performance** (Art. 6.1.b) — necessary to provide the service |
| Audit results and certifications | **Contract performance** (Art. 6.1.b) — the purpose of the service |
| Technical logs | **Legitimate interests** (Art. 6.1.f) — security, debugging, abuse prevention |

---

## 5. GDPR Consent for Audits

Before submitting agent configuration content for analysis, you are shown a consent notice confirming:
- What content will be analyzed
- That raw content will not be stored
- That results will be linked to your API token

Proceeding with the audit constitutes consent under Art. 6.1.a GDPR for the temporary processing of that content.

---

## 6. Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| API tokens | Until expiry date (default 30 days); deleted on expiry |
| Audit results | 12 months from audit date, then automatically deleted |
| Certifications | 24 months from issue date (or until explicitly revoked) |
| Technical logs | 30 days rolling window |
| Submitted content (files) | **Not retained** — discarded after in-memory analysis |

---

## 7. Data Sharing

We do **not** sell, rent, or share your data with third parties for commercial purposes.

We use the following sub-processors:

| Provider | Purpose | Location |
|----------|---------|----------|
| **Supabase** (PostgreSQL) | Database storage of audit results, certifications, tokens | EU (Frankfurt) |
| **Render.com** | API hosting | US (Oregon) — [Render GDPR](https://render.com/privacy) |
| **Vercel** | Dashboard hosting (static) | US — [Vercel Privacy](https://vercel.com/legal/privacy-policy) |

All sub-processors are contractually bound to process data only as instructed and maintain appropriate security measures.

---

## 8. International Transfers

Some data may be processed in the United States (Render, Vercel). These transfers are covered by:
- **Standard Contractual Clauses (SCCs)** as adopted by the European Commission
- The sub-processors' adherence to applicable data protection frameworks

---

## 9. Your Rights (GDPR, Art. 15-22)

As a data subject in the EU, you have the following rights:

| Right | What It Means |
|-------|--------------|
| **Access** | Request a copy of data we hold about your token |
| **Rectification** | Correct inaccurate data |
| **Erasure** | Request deletion of all data linked to your token |
| **Restriction** | Ask us to stop processing while a dispute is resolved |
| **Portability** | Receive your audit history in a structured format (JSON) |
| **Objection** | Object to processing based on legitimate interests |

To exercise any right: **email josejuan.jimenez83@gmail.com** with subject "GDPR Request — [Right Name]". We will respond within **30 days**.

---

## 10. Security

We implement the following measures to protect your data:
- **Bearer token authentication** on all non-public API endpoints
- **HTTPS** enforced on all connections
- **Token scopes** — tokens only access features their tier permits
- **No plaintext secrets** stored (tokens are UUIDs stored as references)
- Regular security audits using our own University API (dogfooding)

If you discover a security vulnerability, please disclose responsibly to josejuan.jimenez83@gmail.com.

---

## 11. Public Badge URLs

If a certification is issued, the following URLs are **publicly accessible without authentication**:
- `GET /v1/certifications/:id/badge` — SVG badge image
- `GET /v1/certifications/:id/verify` — Certification status

This is by design — badges are meant to be shared publicly. If you want to revoke a certification's public visibility, contact us.

---

## 12. Children's Privacy

OpenClaw University is not directed at persons under 16. We do not knowingly collect data from minors. If you believe a minor has submitted data, contact us for immediate deletion.

---

## 13. Changes to This Policy

We may update this policy to reflect changes in our service or legal requirements. When we do:
- The "Last updated" date at the top will change
- If changes are material, we will post a notice in the dashboard
- Continued use of the service after changes constitutes acceptance

---

## 14. Contact

**Data Controller:**  
Jose Juan Jiménez  
Spain (EU)  
Email: josejuan.jimenez83@gmail.com  

**Supervisory Authority:**  
If you believe your rights have been violated, you may lodge a complaint with the Spanish Data Protection Agency (AEPD): [https://www.aepd.es](https://www.aepd.es)

---

*This document was written with GDPR compliance in mind for an EU-based service. It is not a substitute for legal advice.*
