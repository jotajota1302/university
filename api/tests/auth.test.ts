import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/server';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('POST /v1/auth/token', () => {
  it('returns a token for valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/token',
      headers: { 'Content-Type': 'application/json' },
      payload: {
        clientId: 'test-client',
        secret: 'test-secret',
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('expiresAt');
    expect(typeof body.token).toBe('string');
    expect(body.token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );

    const expiresAt = new Date(body.expiresAt);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
    expect(expiresAt.getTime()).toBeLessThanOrEqual(thirtyDaysFromNow.getTime() + 1000);
  });

  it('returns 400 when clientId is empty', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/token',
      headers: { 'Content-Type': 'application/json' },
      payload: {
        clientId: '',
        secret: 'test-secret',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when secret is empty', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/token',
      headers: { 'Content-Type': 'application/json' },
      payload: {
        clientId: 'test-client',
        secret: '',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body).toHaveProperty('error');
  });

  it('returns 400 when clientId is whitespace only', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/auth/token',
      headers: { 'Content-Type': 'application/json' },
      payload: {
        clientId: '   ',
        secret: 'test-secret',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body).toHaveProperty('error');
  });
});
