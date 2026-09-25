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

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}

export interface SpecialtyOption {
  id: number;
  name: string;
  durationMinutes: 30 | 60;
  appointmentType: 'GENERAL' | 'SPECIALIZED';
}

export interface ProfessionalOption {
  id: number;
  firstName: string;
  lastName: string;
}

export interface VenueOption {
  id: number;
  code: string;
  name: string;
  address: string;
}

export interface MyAppointment {
  id: number;
  professionalId: number;
  professionalName: string;
  specialtyId: number;
  specialtyName: string;
  durationMinutes: number;
  venueId: number | null;
  venueName: string | null;
  venueAddress: string | null;
  startsAt: string;
  appointmentType: 'GENERAL' | 'SPECIALIZED';
  status: 'APPROVED' | 'REQUESTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  rejectionReason: string | null;
}

export interface AdminAppointment {
  appointment: MyAppointment;
  patientName: string;
}

export interface AppointmentHistoryEntry {
  id: number;
  status: MyAppointment['status'];
  actorId: number | null;
  source: 'SYSTEM' | 'USER' | 'ADMIN' | 'PROFESSIONAL';
  changedAt: string;
  reason: string | null;
}

export interface ProfessionalAppointment {
  id: number;
  patientName: string;
  specialtyName: string;
  venueName: string | null;
  startsAt: string;
  durationMinutes: number;
  status: 'APPROVED';
}

export type AppointmentOutcome = 'COMPLETED' | 'NO_SHOW';

export interface CreateAppointmentRequest {
  professionalId: number;
  specialtyId: number;
  venueId: number;
  startsAt: string;
  appointmentType: 'GENERAL' | 'SPECIALIZED';
}

export interface CreatedAppointment {
  id: number;
  status: 'APPROVED' | 'REQUESTED';
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
  let accessToken: string | null = null;
  let pendingRefresh: Promise<AuthSession> | null = null;

  const request = async (path: string, init?: RequestInit): Promise<Response> => {
    const response = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      credentials: 'include',
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

  const authorizedRequest = async (path: string, init?: RequestInit): Promise<Response> => {
    if (!accessToken) await api.refresh();
    try {
      return await request(path, {
        ...init,
        headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
      await api.refresh();
      return request(path, {
        ...init,
        headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
      });
    }
  };

  const api = {
    getAccessToken(): string | null {
      return accessToken;
    },

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

    async login(email: string, password: string): Promise<AuthSession> {
      const response = await request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'X-Requested-With': 'citas-web' },
        body: JSON.stringify({ email, password }),
      });
      const session = await response.json() as AuthSession;
      accessToken = session.accessToken;
      return session;
    },

    async refresh(): Promise<AuthSession> {
      if (pendingRefresh) return pendingRefresh;
      pendingRefresh = (async () => {
        const response = await request('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'X-Requested-With': 'citas-web' },
        });
        const session = await response.json() as AuthSession;
        accessToken = session.accessToken;
        return session;
      })();
      try {
        return await pendingRefresh;
      } finally {
        pendingRefresh = null;
      }
    },

    async logout(): Promise<void> {
      accessToken = null;
      await request('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'X-Requested-With': 'citas-web' },
      });
    },

    async getSpecialties(): Promise<SpecialtyOption[]> {
      return (await authorizedRequest('/api/v1/specialties/active')).json() as Promise<SpecialtyOption[]>;
    },

    async getVenues(): Promise<VenueOption[]> {
      return (await authorizedRequest('/api/v1/venues')).json() as Promise<VenueOption[]>;
    },

    async getProfessionals(specialtyId: number): Promise<ProfessionalOption[]> {
      const query = new URLSearchParams({ specialtyId: String(specialtyId) });
      return (await authorizedRequest(`/api/v1/professionals?${query}`)).json() as Promise<ProfessionalOption[]>;
    },

    async getAvailability(specialtyId: number, professionalId: number, venueId: number, from: string, to: string): Promise<string[]> {
      const query = new URLSearchParams({ specialtyId: String(specialtyId), professionalId: String(professionalId), venueId: String(venueId), from, to });
      return (await authorizedRequest(`/api/v1/availability?${query}`)).json() as Promise<string[]>;
    },

    async getMyAppointments(): Promise<MyAppointment[]> {
      return (await authorizedRequest('/api/v1/appointments/mine')).json() as Promise<MyAppointment[]>;
    },

    async createAppointment(booking: CreateAppointmentRequest): Promise<CreatedAppointment> {
      return (await authorizedRequest('/api/v1/appointments', {
        method: 'POST',
        body: JSON.stringify(booking),
      })).json() as Promise<CreatedAppointment>;
    },

    async cancelAppointment(id: number): Promise<void> {
      await authorizedRequest(`/api/v1/appointments/${id}/cancel`, { method: 'POST' });
    },

    async getAppointmentHistory(id: number): Promise<AppointmentHistoryEntry[]> {
      return (await authorizedRequest(`/api/v1/appointments/${id}/history`)).json() as Promise<AppointmentHistoryEntry[]>;
    },

    async getPendingAppointments(): Promise<AdminAppointment[]> {
      return (await authorizedRequest('/api/v1/admin/appointments/pending')).json() as Promise<AdminAppointment[]>;
    },

    async decideAppointment(id: number, approve: boolean, reason?: string): Promise<void> {
      await authorizedRequest(`/api/v1/admin/appointments/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ approve, ...(reason ? { reason } : {}) }),
      });
    },

    async getProfessionalAppointments(from: string, to: string, venueId?: number): Promise<ProfessionalAppointment[]> {
      const query = new URLSearchParams({ from, to });
      if (venueId != null) query.set('venueId', String(venueId));
      return (await authorizedRequest(`/api/v1/professional/appointments?${query}`)).json() as Promise<ProfessionalAppointment[]>;
    },

    async closeProfessionalAppointment(id: number, outcome: AppointmentOutcome): Promise<void> {
      await authorizedRequest(`/api/v1/professional/appointments/${id}/outcome`, {
        method: 'POST',
        body: JSON.stringify({ outcome }),
      });
    },
  };
  return api;
}

const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const citasApi = createCitasApi(configuredApiBaseUrl);
