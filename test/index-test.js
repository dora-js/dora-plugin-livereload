import dora from 'dora';
import { join } from 'path';
import request from 'supertest';
import { outputFileSync } from 'fs-extra';

const localIP = require('internal-ip')();
const port = 1234;

describe('index', () => {
  xdescribe('livereload.js', () => {
    const cwd = process.cwd();
    before(done => {
      process.chdir(join(__dirname, './fixtures/normal'));
      dora({
        port,
        plugins: ['dora-plugin-webpack', '../../../src/index'],
        cwd: join(__dirname, './fixtures/normal'),
      }, done);
    });

    after(() => {
      process.chdir(cwd);
    });

    it('GET /livereload.js', done => {
      request('http://localhost:35729')
        .get('/livereload.js')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          if (res.text.indexOf('(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o])') < 0) {
            const e = new Error('dora-plugin-debug-corner.js is not correct');

            return done(e);
          }

          return done();
        });
    });

    xit('GET /index.html is injected the script livereload.js', done => {
      request(`http://localhost:${port}`)
        .get('/index.html')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          if (res.text.indexOf(`<script src='http://${localIP}:35729/livereload.js'></script>`) < 0) {
            const e = new Error('livereload.js is not injected');

            return done(e);
          }

          return done();
        });
    });

    xit('GET /lackdoctype.html is injected the script livereload.js', done => {
      request(`http://localhost:${port}`)
        .get('/lackdoctype.html')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          if (res.text.indexOf(`<script src='http://${localIP}:35729/livereload.js'></script>`) < 0) {
            const e = new Error('livereload.js is not injected');

            return done(e);
          }

          return done();
        });
    });

    xit('GET /x.js should not be handled', done => {
      request(`http://localhost:${port}`)
        .get('/x.js')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          if (res.text.indexOf('console.log(1);') < 0) {
            const e = new Error('other types of files should not be handled');

            return done(e);
          }

          return done();
        });
    });
  });

    // todo
  describe('files are changed', () => {
    const c = process.cwd();
    before(done => {
      process.chdir(join(__dirname, './fixtures/normal'));
      dora({
        port: port + 1,
        plugins: ['dora-plugin-webpack', '../../../src/index?{enableAll:true}'],
        cwd: join(__dirname, './fixtures/normal'),
      });
      setTimeout(done, 1000);
    });

    after(() => {
      process.chdir(c);
    });
    it('file changed', done => {
      const randomColor = (new Date() - 0).toString().slice(7);
      outputFileSync(
        join(__dirname, './fixtures/normal/mod.js'),
        `console.log('${randomColor}');`
      );
      setTimeout(done, 50000);
    });
  });
});
