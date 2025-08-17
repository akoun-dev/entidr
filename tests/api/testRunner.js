const http = require('http');
const assert = require('assert');

const { app } = require('../../src/server/index');
const server = app.listen(0);

const testValidGroup = () => {
  const req = http.request({
    host: 'localhost',
    port: server.address().port,
    path: '/groups',
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      assert.strictEqual(res.statusCode, 201);
      console.log('✓ Test valid group passed');
    });
  });
  req.write(JSON.stringify({name: 'Valid Group'}));
  req.end();
};

testValidGroup();
