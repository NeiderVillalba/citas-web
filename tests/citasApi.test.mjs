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
