import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/server';

let validToken: string;

beforeAll(async () => {
  const app = buildApp();
  const res = await app.inject({
    method: 'POST',
    url: '/v1/auth/token',
    payload: { clientId: 'billing-test-client', secret: 'billing-secret' },
  });
  validToken = res.json().token;
});

describe('GET /v1/billing/subscription', () => {
  it('returns 401 without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/billing/subscription' });
    expect(res.statusCode).toBe(401);
  });

  it('returns subscription info with valid token', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/v1/billing/subscription',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('tier');
    expect(body).toHaveProperty('scopes');
    expect(body).toHaveProperty('auditCount');
    expect(body).toHaveProperty('auditLimit');
    expect(Array.isArray(body.scopes)).toBe(true);
  });

  it('returns free tier for new token', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/v1/billing/subscription',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const body = res.json();
    expect(body.tier).toBe('free');
    expect(body.auditLimit).toBe(1);
  });
});

describe('POST /v1/billing/checkout', () => {
  it('returns 401 without token', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/billing/checkout',
      payload: { plan: 'pro' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 for invalid plan', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/billing/checkout',
      headers: { Authorization: `Bearer ${validToken}` },
      payload: { plan: 'invalid' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns checkout URL for pro plan (mock mode)', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/billing/checkout',
      headers: { Authorization: `Bearer ${validToken}` },
      payload: { plan: 'pro' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('url');
    expect(body.url).toContain('checkout.stripe.com');
    expect(body.plan).toBe('pro');
  });

  it('returns checkout URL for enterprise plan (mock mode)', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/billing/checkout',
      headers: { Authorization: `Bearer ${validToken}` },
      payload: { plan: 'enterprise' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.plan).toBe('enterprise');
  });
});

describe('GET /v1/audits', () => {
  it('returns 401 without token', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/audits' });
    expect(res.statusCode).toBe(401);
  });

  it('returns audit history with valid token', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/v1/audits',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('audits');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('limit');
    expect(body).toHaveProperty('offset');
    expect(Array.isArray(body.audits)).toBe(true);
  });

  it('supports pagination params', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/v1/audits?limit=5&offset=0',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.limit).toBe(5);
    expect(body.offset).toBe(0);
  });
});
