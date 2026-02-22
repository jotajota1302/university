import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/server';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;
let validToken: string;

beforeAll(async () => {
  app = buildApp();
  await app.ready();

  // Create a valid token for testing
  const tokenResponse = await app.inject({
    method: 'POST',
    url: '/v1/auth/token',
    headers: { 'Content-Type': 'application/json' },
    payload: {
      clientId: 'audit-test-client',
      secret: 'audit-test-secret',
    },
  });

  const tokenBody = tokenResponse.json();
  validToken = tokenBody.token;
});

afterAll(async () => {
  await app.close();
});

describe('POST /v1/audit/security', () => {
  it('returns 401 when no token is provided', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: { 'Content-Type': 'application/json' },
      payload: {
        files: {},
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns 401 when an invalid token is provided', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid-token-that-does-not-exist',
      },
      payload: {
        files: {},
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns structured audit report with valid token and files', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          'SOUL.md': '# Agent Soul\nThis agent helps users with tasks.',
          'AGENTS.md': '# Agents\nMain agent configuration.',
          'TOOLS.md': '# Tools\nAvailable tools list.',
          config: 'dmPolicy: strict\nallowFrom: trusted-sources\nsessionId: enabled',
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body).toHaveProperty('auditId');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('grade');
    expect(body).toHaveProperty('checks');
    expect(body).toHaveProperty('recommendations');
    expect(body).toHaveProperty('certifiable');
    expect(body).toHaveProperty('validationBlockers');
    expect(body).toHaveProperty('blockersTechnical');
    expect(body).toHaveProperty('blockersPolicy');

    expect(typeof body.auditId).toBe('string');
    expect(body.auditId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(typeof body.score).toBe('number');
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(body.grade);
    expect(Array.isArray(body.checks)).toBe(true);
    expect(body.checks).toHaveLength(16);
    expect(Array.isArray(body.recommendations)).toBe(true);
    expect(Array.isArray(body.validationBlockers)).toBe(true);
    expect(Array.isArray(body.blockersTechnical)).toBe(true);
    expect(Array.isArray(body.blockersPolicy)).toBe(true);
    expect(typeof body.certifiable).toBe('boolean');
  });

  it('check structure contains required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          config: 'dmPolicy: strict\nallowFrom: trusted\nsessionId: abc123',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    for (const check of body.checks) {
      expect(check).toHaveProperty('id');
      expect(check).toHaveProperty('status');
      expect(check).toHaveProperty('severity');
      expect(check).toHaveProperty('message');
      expect(check).toHaveProperty('fix');
      expect(['PASS', 'FAIL', 'WARN', 'N/A']).toContain(check.status);
      expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(check.severity);
    }
  });

  it('WARN checks do not lower score (only FAIL penalizes)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          'AGENTS.md': 'Avoid storing api_key in files; use environment variables.',
          config: 'dmPolicy: strict\nallowFrom: trusted\nsession: { dmScope: per-channel-peer }',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    const sec04 = body.checks.find((c: { id: string }) => c.id === 'SEC-04');
    expect(sec04?.status).toBe('WARN');
    expect(body.score).toBe(100);
  });

  it('ETH-02 acts as explicit validation blocker', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          'AGENTS.md': 'Delete all user history after each run.',
          config: 'dmPolicy: strict\nallowFrom: trusted\nsessionId: abc',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.certifiable).toBe(false);
    expect(body.validationBlockers).toContain('ETH-02');
    expect(body.blockersPolicy).toContain('ETH-02');
  });

  it('detects security issues in dirty files and lowers score', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/audit/security',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      payload: {
        files: {
          'SOUL.md': `My password is secret123 and ${'api' + '_' + 'key'}=abc`,
          'AGENTS.md': 'Run rm -rf /tmp to clean up',
          config: 'no-security-here',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();

    expect(body.score).toBeLessThan(100);
    const failedChecks = body.checks.filter((c: { status: string }) => c.status === 'FAIL');
    expect(failedChecks.length).toBeGreaterThan(0);
  });
});
