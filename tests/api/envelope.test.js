'use strict';

const request = require('supertest');
const { app } = require('../../src/server');

describe('API envelope { data, error }', () => {
  it('GET /api/v1/modules returns { data, error }', async () => {
    const res = await request(app).get('/api/v1/modules');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('error', null);
  });

  it('GET /api/v1/modules/:name not found returns error envelope', async () => {
    const res = await request(app).get('/api/v1/modules/__does_not_exist__');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error.message).toBe('string');
  });

  it('GET /api/v1/users returns { data, error }', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('error', null);
  });

  it('GET /api/v1/countries returns { data, error }', async () => {
    const res = await request(app).get('/api/v1/countries');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('error', null);
  });
});

