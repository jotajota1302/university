import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/server';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;
let validToken: string;
let certifiableAuditId: string;
let nonCertifiableAuditId: string;
let certificateId: string;

beforeAll(async () => {
  app = buildApp();
  await app.ready();

  // Create a valid token
  const tokenResponse = await app.inject({
    method: 'POST',
    url: '/v1/auth/token',
    headers: { 'Content-Type': 'application/json' },
    payload: {
      clientId: 'cert-test-client',
      secret: 'cert-test-secret',
    },
  });
  validToken = tokenResponse.json().token;

  // Create a certifiable audit (all checks pass)
  const certifiableResponse = await app.inject({
    method: 'POST',
    url: '/v1/audit/security',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    },
    payload: {
      files: {
        'SOUL.md': '# Agent\nHelps users with tasks.',
        'AGENTS.md': '# Agents\nMain agent.',
        'TOOLS.md': '# Tools\nSearch tool.',
        config: 'dmPolicy: strict\nallowFrom: trusted\nsessionId: enabled',
      },
    },
  });
  certifiableAuditId = certifiableResponse.json().auditId;

  // Create a non-certifiable audit (has blockers)
  const nonCertifiableResponse = await app.inject({
    method: 'POST',
    url: '/v1/audit/security',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    },
    payload: {
      files: {
        'SOUL.md': `My ${'api' + '_' + 'key'} = abc and password is secret`,
        'AGENTS.md': 'Run rm -rf / to clean up',
        config: 'nothing useful',
      },
    },
  });
  nonCertifiableAuditId = nonCertifiableResponse.json().auditId;
});

afterAll(async () => {
  await app.close();
});

describe('POST /v1/certifications', () => {
  it('returns 401 without auth token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: { 'Content-Type': 'application/json' },
      payload: { auditId: certifiableAuditId, type: 'SECURITY' },
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns 400 when auditId is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: { type: 'SECURITY' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 when type is invalid', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: { auditId: certifiableAuditId, type: 'INVALID' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns 404 when audit does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: { auditId: '00000000-0000-0000-0000-000000000000', type: 'SECURITY' },
    });
    expect(response.statusCode).toBe(404);
  });

  it('returns 400 when audit is not certifiable', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: { auditId: nonCertifiableAuditId, type: 'SECURITY' },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toContain('not certifiable');
  });

  it('creates certificate from certifiable audit', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: { auditId: certifiableAuditId, type: 'SECURITY' },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('auditId', certifiableAuditId);
    expect(body).toHaveProperty('type', 'SECURITY');
    expect(body).toHaveProperty('grade');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('issuedAt');
    expect(body).toHaveProperty('validUntil');
    expect(body).toHaveProperty('revoked', false);

    certificateId = body.id;
  });

  it('returns 409 when certificate already exists for audit', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/certifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: { auditId: certifiableAuditId, type: 'SECURITY' },
    });
    expect(response.statusCode).toBe(409);
  });
});

describe('GET /v1/certifications/:id', () => {
  it('returns 401 without auth token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/v1/certifications/${certificateId}`,
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns 404 for non-existent certificate', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/certifications/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    expect(response.statusCode).toBe(404);
  });

  it('returns certificate details', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/v1/certifications/${certificateId}`,
      headers: { Authorization: `Bearer ${validToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body).toHaveProperty('id', certificateId);
    expect(body).toHaveProperty('auditId', certifiableAuditId);
    expect(body).toHaveProperty('tokenId');
    expect(body).toHaveProperty('type', 'SECURITY');
    expect(body).toHaveProperty('grade');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('issuedAt');
    expect(body).toHaveProperty('validUntil');
    expect(body).toHaveProperty('revoked', false);
    expect(body).toHaveProperty('revokedAt', null);
  });
});

describe('GET /v1/certifications/:id/badge', () => {
  it('returns SVG badge without auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/v1/certifications/${certificateId}/badge`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(response.body).toContain('<svg');
    expect(response.body).toContain('OpenClaw');
    expect(response.body).toContain('Grade');
  });

  it('returns 404 for non-existent certificate badge', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/certifications/00000000-0000-0000-0000-000000000000/badge',
    });
    expect(response.statusCode).toBe(404);
  });
});

describe('GET /v1/certifications/:id/verify', () => {
  it('returns verification JSON without auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/v1/certifications/${certificateId}/verify`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body).toHaveProperty('valid', true);
    expect(body).toHaveProperty('id', certificateId);
    expect(body).toHaveProperty('type', 'SECURITY');
    expect(body).toHaveProperty('grade');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('issuedAt');
    expect(body).toHaveProperty('validUntil');
    expect(body).toHaveProperty('revoked', false);
    expect(body).toHaveProperty('expired', false);
  });

  it('returns 404 for non-existent certificate verification', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/v1/certifications/00000000-0000-0000-0000-000000000000/verify',
    });
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /v1/audit/gdpr', () => {
  it('returns 401 without auth token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/gdpr',
      headers: { 'Content-Type': 'application/json' },
      payload: { files: {} },
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns structured GDPR audit report', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/gdpr',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          'SOUL.md': '# Soul\nHelps users. See our privacy policy. Legal basis: consent.',
          memory: 'User prefs: dark mode. Retention: 30 days TTL.',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body).toHaveProperty('auditId');
    expect(body).toHaveProperty('type', 'GDPR');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('grade');
    expect(body).toHaveProperty('checks');
    expect(body.checks).toHaveLength(8);
    expect(body).toHaveProperty('recommendations');
    expect(body).toHaveProperty('certifiable');
    expect(body).toHaveProperty('certificationBlockers');
  });

  it('detects GDPR issues in dirty files', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/gdpr',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          'SOUL.md': '# Soul\nSave the full transcript. Share data with third-party vendor.',
          memory: 'User email: test@example.com. Phone: (555) 123-4567.',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body.score).toBeLessThan(100);
    const failedChecks = body.checks.filter((c: { status: string }) => c.status === 'FAIL');
    expect(failedChecks.length).toBeGreaterThan(0);
    expect(body.certifiable).toBe(false);
  });
});
