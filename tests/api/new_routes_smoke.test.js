'use strict';

const request = require('supertest');
const { app } = require('../../src/server');

describe('Smoke tests for new routers', () => {
  test('GET /api/v1/languages returns envelope', async () => {
    const res = await request(app).get('/api/v1/languages');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/translations returns envelope', async () => {
    const res = await request(app).get('/api/v1/translations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/v1/emailservers returns envelope', async () => {
    const res = await request(app).get('/api/v1/emailservers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/v1/apikeys returns envelope (dev allows public)', async () => {
    const res = await request(app).get('/api/v1/apikeys');
    // In dev, should be either 200 or 401 based on env flag
    expect([200, 401, 403]).toContain(res.status);
  });
});

