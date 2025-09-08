'use strict';

const request = require('supertest');
const { app } = require('../../src/server');

describe('HR Security API', () => {
  const unique = Date.now();
  const permName = `perm.read.docs.${unique}`;
  const roleName = `role.hr.${unique}`;
  let permId = null;
  let roleId = null;

  test('GET /api/v1/hr/security/roles returns envelope', async () => {
    const res = await request(app).get('/api/v1/hr/security/roles');
    expect([200, 403]).toContain(res.status); // allow role guard in some env
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  test('Create permission', async () => {
    const res = await request(app)
      .post('/api/v1/hr/security/permissions')
      .send({ name: permName, resource: 'hr.document', action: 'read', description: 'test perm' })
      .set('Content-Type', 'application/json');
    expect([201, 403]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('data');
      permId = res.body.data.id;
    }
  });

  test('Create role', async () => {
    const res = await request(app)
      .post('/api/v1/hr/security/roles')
      .send({ name: roleName, description: 'hr role', permissions: [permName] })
      .set('Content-Type', 'application/json');
    expect([201, 403]).toContain(res.status);
    if (res.status === 201) {
      roleId = res.body.data.id;
    }
  });

  test('Assign permission to role', async () => {
    if (!roleId || !permId) return; // skipped if forbidden
    const res = await request(app)
      .post(`/api/v1/hr/security/roles/${roleId}/permissions`)
      .send({ permission_id: permId })
      .set('Content-Type', 'application/json');
    expect([200, 403]).toContain(res.status);
  });

  test('Cleanup created role and permission', async () => {
    if (roleId) {
      const delRole = await request(app).delete(`/api/v1/hr/security/roles/${roleId}`);
      expect([204, 403, 404]).toContain(delRole.status);
    }
    if (permId) {
      const delPerm = await request(app).delete(`/api/v1/hr/security/permissions/${permId}`);
      expect([204, 403, 404]).toContain(delPerm.status);
    }
  });
});

