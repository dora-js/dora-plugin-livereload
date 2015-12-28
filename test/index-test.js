import dora from 'dora';
import { join } from 'path';
import request from 'supertest';

const port = '12345';

describe('index', () => {

  before(done => {
    dora({
      port,
      plugins: [`../../../src/index`],
      cwd: join(__dirname, './fixtures/normal'),
    });
    setTimeout(done, 1000);
  });

  it('GET /package.json', done => {
    request(`http://localhost:${port}`)
      .get('/package.json')
      .expect(/\.\/index\.js/, done);
  });
});

