'use strict';

const request = require('supertest');
const { app } = require('../../src/server');

describe('HR Workflows & Signatures API', () => {
  const unique = Date.now();
  const wfName = `wf-onboarding-${unique}`;
  let wfId = null;
  let sigId = null;

  test('Create workflow', async () => {
    const res = await request(app)
      .post('/api/v1/hr/workflows')
      .send({ name: wfName, kind: 'onboarding', config: { steps: [] } })
      .set('Content-Type', 'application/json');
    expect([201, 403]).toContain(res.status);
    if (res.status === 201) {
      wfId = res.body.data.id;
    }
  });

  test('List workflows', async () => {
    const res = await request(app).get('/api/v1/hr/workflows');
    expect([200, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  test('Create signature request (requires document_id)', async () => {
    const res = await request(app)
      .post('/api/v1/hr/signatures')
      .send({ document_id: 1 })
      .set('Content-Type', 'application/json');
    expect([201, 400, 403]).toContain(res.status);
    if (res.status === 201) sigId = res.body.data.id;
  });

  test('List signatures', async () => {
    const res = await request(app).get('/api/v1/hr/signatures');
    expect([200, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
    }
  });

  test('Cleanup workflow', async () => {
    if (wfId) {
      const res = await request(app).delete(`/api/v1/hr/workflows/${wfId}`);
      expect([204, 403, 404]).toContain(res.status);
    }
  });
});

