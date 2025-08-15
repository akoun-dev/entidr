const request = require('supertest');
const app = require('../../src/server');
const { expect } = require('chai');

describe('API v1 - Users', () => {
  it('GET /api/v1/users - should return 200', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .expect(200);

    expect(res.body).to.be.an('array');
  });

  it('GET /api/v1/users/:id - should return user details', async () => {
    const testUserId = 1;
    const res = await request(app)
      .get(`/api/v1/users/${testUserId}`)
      .expect(200);

    expect(res.body).to.have.property('id', testUserId);
  });

  // Tests supplémentaires à implémenter
  // - Tests de création
  // - Tests de mise à jour
  // - Tests de suppression
  // - Tests d'erreurs
});
