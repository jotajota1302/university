const API_URL = import.meta.env.VITE_API_URL || '';

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

export { APIError, request };

export const api = {
  baseURL: API_URL,
  health: () => request<{ status: string }>('/v1/health'),
};
