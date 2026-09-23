export interface ActivePlan {
  id: number;
  name: string;
  epsName: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  password: string;
  planId?: number | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    message: string,
    status: number,
    code: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type Fetcher = typeof fetch;

export function createCitasApi(baseUrl: string, fetcher: Fetcher = fetch) {
  const request = async (path: string, init?: RequestInit): Promise<Response> => {
    const response = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      let body: { code?: string; message?: string } = {};
      try {
        body = await response.json() as { code?: string; message?: string };
      } catch {
        // Keep a stable client error even when a proxy returns a non-JSON response.
      }
      throw new ApiError(
        body.message ?? 'No fue posible completar la solicitud.',
        response.status,
        body.code ?? 'HTTP_ERROR',
      );
    }

    return response;
  };

  return {
    async getActivePlans(): Promise<ActivePlan[]> {
      const response = await request('/api/v1/plans/active');
      return response.json() as Promise<ActivePlan[]>;
    },

    async registerUser(user: RegisterUserRequest): Promise<void> {
      const { planId, ...requiredFields } = user;
      const body = planId == null ? requiredFields : { ...requiredFields, planId };
      await request('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  };
}

const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const citasApi = createCitasApi(configuredApiBaseUrl);
