const API_URL = 'https://openclaw-university-api.onrender.com';

function getToken() {
  return localStorage.getItem('university_token') || '';
}

class APIError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data;
  if (!isRecord(data)) return `La API devolvió un error (${status}).`;

  const directMessage = ['message', 'error', 'detail', 'title']
    .map((key) => data[key])
    .find((value) => typeof value === 'string' && value.trim());

  if (typeof directMessage === 'string') return directMessage;

  const errors = data.errors;
  if (Array.isArray(errors)) {
    const first = errors.find((entry) => typeof entry === 'string' || isRecord(entry));
    if (typeof first === 'string' && first.trim()) return first;
    if (isRecord(first)) {
      const nested = ['message', 'msg', 'detail']
        .map((key) => first[key])
        .find((value) => typeof value === 'string' && value.trim());
      if (typeof nested === 'string') return nested;
    }
  }

  return `La API devolvió un error (${status}).`;
}

async function parseBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await res.text();
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
        ...options.headers,
      },
    });
  } catch {
    throw new APIError('No se pudo conectar con el servidor. Revisa tu red e inténtalo de nuevo.', 0, null);
  }

  const data = await parseBody(res);
  if (!res.ok) {
    throw new APIError(getErrorMessage(data, res.status), res.status, data);
  }
  return data as T;
}

export const api = {
  baseURL: API_URL,
  
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
