'use strict';

const request = require('supertest');
const { app } = require('../../src/server');
const { User } = require('../../src/models');

describe('User Module Roles API', () => {
  let userId;
  const moduleName = 'hr';
  const roleName = 'manager';

  beforeAll(async () => {
    // Ensure a user exists
    const u = await User.create({ username: `test_${Date.now()}`, email: `${Date.now()}@ex.com`, password: 'x' });
    userId = u.id;
  });

  test('Set module role for user', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${userId}/module-roles/${moduleName}`)
      .send({ role: roleName })
      .set('Content-Type', 'application/json');
    expect([200]).toContain(res.status);
    expect(res.body.data).toHaveProperty('module', moduleName);
    expect(res.body.data).toHaveProperty('role', roleName);
  });

  test('List module roles for user includes the assignment', async () => {
    const res = await request(app).get(`/api/v1/users/${userId}/module-roles`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find(r => r.module === moduleName && r.role === roleName);
    expect(!!found).toBe(true);
  });

  test('Delete module role assignment', async () => {
    const res = await request(app).delete(`/api/v1/users/${userId}/module-roles/${moduleName}`);
    expect([204, 404]).toContain(res.status);
  });
});

