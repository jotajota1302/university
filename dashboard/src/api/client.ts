const API_URL = 'https://openclaw-university-api.onrender.com';

function getToken() {
  return localStorage.getItem('university_token') || '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data as T;
}

export const api = {
  health: () => request<{ status: string }>('/v1/health'),

  getSubscription: () =>
    request<{ tier: string; scopes: string[]; auditCount: number; auditLimit: number; active: boolean }>(
      '/v1/billing/subscription'
    ),

  getToken: (clientId: string, secret: string) =>
    request<{ token: string; expiresAt: string }>('/v1/auth/token', {
      method: 'POST',
      body: JSON.stringify({ clientId, secret }),
      headers: { Authorization: '' },
    }),

  auditSecurity: (files: Record<string, string>) =>
    request<AuditResult>('/v1/audit/security', {
      method: 'POST',
      body: JSON.stringify({ files }),
    }),

  auditGdpr: (files: Record<string, string>) =>
    request<AuditResult>('/v1/audit/gdpr', {
      method: 'POST',
      body: JSON.stringify({ files }),
    }),

  getAudits: (limit = 10, offset = 0) =>
    request<{ audits: AuditSummary[]; total: number }>(`/v1/audits?limit=${limit}&offset=${offset}`),

  createValidation: (auditId: string, type: string) =>
    request<Validation>('/v1/validations', {
      method: 'POST',
      body: JSON.stringify({ auditId, type }),
    }),

  getValidation: (id: string) => request<Validation>(`/v1/validations/${id}`),

  getBadgeUrl: (id: string) => `${API_URL}/v1/validations/${id}/badge`,
  getVerifyUrl: (id: string) => `${API_URL}/v1/validations/${id}/verify`,

  checkout: (plan: 'pro' | 'enterprise') =>
    request<{ url: string; plan: string; price: string }>('/v1/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),
};

export interface Check {
  id: string;
  status: 'PASS' | 'FAIL' | 'N/A';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  fix: string | null;
}

export interface AuditResult {
  auditId: string;
  score: number;
  grade: string;
  certifiable: boolean;
  validationBlockers: string[];
  checks: Check[];
  recommendations: string[];
}

export interface AuditSummary {
  id: string;
  score: number;
  grade: string;
  createdAt: string;
  result: AuditResult;
}

export interface Validation {
  id: string;
  auditId: string;
  type: string;
  grade: string;
  score: number;
  issuedAt: string;
  validUntil: string;
  revoked: boolean;
}
