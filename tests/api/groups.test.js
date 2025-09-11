const request = require('supertest');
const { app } = require('../../src/server/index');

describe('Group API Validation', () => {
  describe('POST /groups', () => {
    it('should reject short group name', (done) => {
      request(app)
        .post('/groups')
        .send({ name: 'ab' })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          if (!res.body.errors.includes('Le nom doit contenir entre 3 et 50 caractères')) {
            return done(new Error('Validation error missing'));
          }
          done();
        });
    });
  });
});
