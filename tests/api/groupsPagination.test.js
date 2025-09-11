const request = require('supertest');
const { app } = require('../../src/server/index');
const { Group, User } = require('../../models');

describe('Groups Pagination', () => {
  beforeAll(async () => {
    // Créer des données de test
    await Group.bulkCreate([
      { name: 'Group 1', active: true },
      { name: 'Group 2', active: true },
      { name: 'Group 3', active: true },
      { name: 'Group 4', active: true },
      { name: 'Group 5', active: true },
    ]);
  });

  afterAll(async () => {
    await Group.destroy({ where: {} });
  });

  test('should return paginated groups', async () => {
    const res = await request(app)
      .get('/groups?page=1&limit=2')
      .expect(200);

    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.totalItems).toBe(5);
    expect(res.body.meta.totalPages).toBe(3);
    expect(res.body.meta.currentPage).toBe(1);
    expect(res.body.meta.itemsPerPage).toBe(2);
  });

  test('should return second page', async () => {
    const res = await request(app)
      .get('/groups?page=2&limit=2')
      .expect(200);

    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.currentPage).toBe(2);
  });
});
