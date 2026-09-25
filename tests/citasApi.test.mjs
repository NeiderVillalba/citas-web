import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, createCitasApi } from '../src/api/citasApi.ts';

test('loads active plans from the configured API', async () => {
  let requestedUrl;
  const api = createCitasApi('https://api.example.test/', async (url) => {
    requestedUrl = url;
    return Response.json([{ id: 12, name: 'Plan Azul', epsName: 'EPS Demo' }]);
  });

  const plans = await api.getActivePlans();

  assert.equal(requestedUrl, 'https://api.example.test/api/v1/plans/active');
  assert.deepEqual(plans, [{ id: 12, name: 'Plan Azul', epsName: 'EPS Demo' }]);
});

test('omits planId when registration has no selected plan', async () => {
  let request;
  const api = createCitasApi('http://localhost:8080', async (url, init) => {
    request = { url, init };
    return new Response(null, { status: 201 });
  });

  await api.registerUser({
    firstName: 'Ada',
    lastName: 'Prueba',
    documentType: 'CC',
    documentNumber: 'TEST-1',
    email: 'ada@example.test',
    phone: '3000000000',
    password: 'test-password',
  });

  assert.equal(request.url, 'http://localhost:8080/api/v1/auth/register');
  assert.equal(request.init.method, 'POST');
  assert.equal(JSON.parse(request.init.body).planId, undefined);
});

test('sends the selected active plan ID during registration', async () => {
  let body;
  const api = createCitasApi('http://localhost:8080', async (_url, init) => {
    body = JSON.parse(init.body);
    return new Response(null, { status: 201 });
  });

  await api.registerUser({
    firstName: 'Ada',
    lastName: 'Prueba',
    documentType: 'CC',
    documentNumber: 'TEST-2',
    email: 'ada2@example.test',
    phone: '3000000001',
    password: 'test-password',
    planId: 12,
  });

  assert.equal(body.planId, 12);
});

test('exposes the controlled API error for an invalid plan', async () => {
  const api = createCitasApi('http://localhost:8080', async () =>
    Response.json(
      { code: 'INVALID_PLAN', message: 'El plan seleccionado no existe o está inactivo.' },
      { status: 400 },
    ),
  );

  await assert.rejects(
    api.registerUser({
      firstName: 'Ada',
      lastName: 'Prueba',
      documentType: 'CC',
      documentNumber: 'TEST-3',
      email: 'ada3@example.test',
      phone: '3000000002',
      password: 'test-password',
      planId: 999,
    }),
    (error) => error instanceof ApiError
      && error.status === 400
      && error.code === 'INVALID_PLAN',
  );
});

test('logs in through the API with cookie transport and keeps access token in memory', async () => {
  let request;
  const user = { id: 9, firstName: 'Ada', lastName: 'Prueba', email: 'ada@example.test', roles: ['USER'] };
  const api = createCitasApi('http://localhost:8080', async (url, init) => {
    request = { url, init };
    return Response.json({ accessToken: 'synthetic-access', tokenType: 'Bearer', expiresIn: 900, user });
  });

  const session = await api.login('ada@example.test', 'synthetic-password');

  assert.equal(request.url, 'http://localhost:8080/api/v1/auth/login');
  assert.equal(request.init.method, 'POST');
  assert.equal(request.init.credentials, 'include');
  assert.equal(request.init.headers['X-Requested-With'], 'citas-web');
  assert.deepEqual(JSON.parse(request.init.body), { email: 'ada@example.test', password: 'synthetic-password' });
  assert.deepEqual(session.user, user);
  assert.equal(api.getAccessToken(), 'synthetic-access');
});

test('refresh rotates the in-memory access token and logout clears it', async () => {
  const calls = [];
  const user = { id: 9, firstName: 'Ada', lastName: 'Prueba', email: 'ada@example.test', roles: ['USER'] };
  const api = createCitasApi('http://localhost:8080', async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith('/refresh')) {
      return Response.json({ accessToken: 'renewed-access', tokenType: 'Bearer', expiresIn: 900, user });
    }
    return new Response(null, { status: 204 });
  });

  await api.refresh();
  assert.equal(api.getAccessToken(), 'renewed-access');
  await api.logout();
  assert.equal(api.getAccessToken(), null);
  assert.equal(calls[0].init.credentials, 'include');
  assert.equal(calls[0].init.headers['X-Requested-With'], 'citas-web');
  assert.equal(calls[1].init.method, 'POST');
});

test('concurrent refresh calls share one rotating-cookie request', async () => {
  let calls = 0;
  const user = { id: 9, firstName: 'Ada', lastName: 'Prueba', email: 'ada@example.test', roles: ['USER'] };
  const api = createCitasApi('http://localhost:8080', async () => {
    calls += 1;
    await Promise.resolve();
    return Response.json({ accessToken: 'renewed-access', tokenType: 'Bearer', expiresIn: 900, user });
  });

  const [first, second] = await Promise.all([api.refresh(), api.refresh()]);
  assert.equal(calls, 1);
  assert.deepEqual(first, second);
});

test('loads admin requests and submits the rejection reason with the access token', async () => {
  const calls = [];
  const user = { id: 10, firstName: 'Admin', lastName: 'Demo', email: 'admin@example.test', roles: ['ADMIN'] };
  const pending = [{ appointment: { id: 45, status: 'REQUESTED' }, patientName: 'Paciente Demo' }];
  const api = createCitasApi('http://localhost:8080', async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith('/login')) return Response.json({ accessToken: 'admin-access', tokenType: 'Bearer', expiresIn: 900, user });
    if (url.endsWith('/pending')) return Response.json(pending);
    return Response.json({ id: 45, status: 'REJECTED' });
  });

  await api.login('admin@example.test', 'synthetic-password');
  assert.deepEqual(await api.getPendingAppointments(), pending);
  await api.decideAppointment(45, false, 'Horario no disponible');

  assert.equal(calls[1].url, 'http://localhost:8080/api/v1/admin/appointments/pending');
  assert.equal(calls[1].init.headers.Authorization, 'Bearer admin-access');
  assert.equal(calls[2].url, 'http://localhost:8080/api/v1/admin/appointments/45/decision');
  assert.deepEqual(JSON.parse(calls[2].init.body), { approve: false, reason: 'Horario no disponible' });
});

test('cancels an appointment and loads its history through the USER endpoints', async () => {
  const calls = [];
  const user = { id: 9, firstName: 'Ada', lastName: 'Prueba', email: 'ada@example.test', roles: ['USER'] };
  const events = [{ id: 90, status: 'REQUESTED', actorId: null, source: 'SYSTEM', changedAt: '2030-01-01T12:00:00Z', reason: null }];
  const api = createCitasApi('http://localhost:8080', async (url, init) => {
    calls.push({ url, init });
    if (url.endsWith('/login')) return Response.json({ accessToken: 'user-access', tokenType: 'Bearer', expiresIn: 900, user });
    if (url.endsWith('/history')) return Response.json(events);
    return Response.json({ id: 90, status: 'CANCELLED' });
  });

  await api.login('ada@example.test', 'synthetic-password');
  await api.cancelAppointment(90);
  assert.deepEqual(await api.getAppointmentHistory(90), events);

  assert.equal(calls[1].url, 'http://localhost:8080/api/v1/appointments/90/cancel');
  assert.equal(calls[1].init.headers.Authorization, 'Bearer user-access');
  assert.equal(calls[2].url, 'http://localhost:8080/api/v1/appointments/90/history');
  assert.equal(calls[2].init.headers.Authorization, 'Bearer user-access');
});
