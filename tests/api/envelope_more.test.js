'use strict';

const request = require('supertest');
const { app } = require('../../src/server');

describe('Envelope on additional endpoints', () => {
  test('GET /api/v1/notifications/settings returns { data, error }', async () => {
    const res = await request(app).get('/api/v1/notifications/settings');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('error', null);
  });

  test('GET /api/v1/languages returns { data, error }', async () => {
    const res = await request(app).get('/api/v1/languages');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/shippingmethods returns { data, error }', async () => {
    const res = await request(app).get('/api/v1/shippingmethods');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

