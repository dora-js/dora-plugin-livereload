import 'babel-polyfill';
import { existsSync, readFileSync } from 'fs';
import { parse } from 'url';
import { join } from 'path';
import { isEqual } from 'lodash';
import tinylr from 'tiny-lr';

function getAssetContent(asset) {
  let content = null;
  if (asset._value) {
    content = asset._value;
  } else if (asset.children) {
    content = asset.children;
  } else if (asset._cachedSource) {
    content = asset._cachedSource;
  }

  return content;
}

let opts = {};
let tinylrServer = {};
let firstRun = 0;
let preCompilerationAssets = {};

export default {
  'middleware.before'() {
    const { log } = this;
    opts = {
      port: 35729,
      errorListener(err) {
        log.error(err);
      },
    };
    tinylrServer = tinylr(opts);
    tinylrServer.listen(opts, () => {
      log.info(`Listening on ${opts.port}`);
    });
  },

  'middleware'() {
    const { cwd, localIP, query, log } = this;
    const ignore = query.ignore;
    let reg;
    try {
      reg = new RegExp(ignore, 'i');
    } catch (err) {
      log.error('pattern is illegal');
    }
    const compiler = this.get('compiler');
    if (!compiler) {
      throw new Error('[error] must used together with dora-plugin-atool-build');
    }
    compiler.plugin('done', function doneHandler(stats) {
      if (stats.hasErrors()) {
        log.error(stats.toString());

        return;
      }

      const assets = stats.compilation.assets;
      let items = [];
      if (ignore) {
        log.info(`livereload will ignore ${query.ignore} files`);
        items = Object.keys(assets).filter((item) => {
          return !reg.test(item);
        });
      } else {
        items = Object.keys(assets);
      }

      log.info(`final watching items ${items}`);
      if (!firstRun) {
        firstRun ++;
        preCompilerationAssets = items.reduce((prev, item) => {
          prev[item] = getAssetContent(assets[item]);

          return prev;
        }, {});

        return;
      }

      const changedItems = items.reduce((prev, item) => {
        const pre = preCompilerationAssets[item];
        const now = getAssetContent(assets[item]);

        if (!isEqual(pre, now)) {
          preCompilerationAssets[item] = now;
          prev.push(item);
        }

        return prev;
      }, []);

      tinylrServer.changed({body: {files: changedItems}});
      log.warn('livereload changed ' + changedItems.join(', '));
    });

    return function* (next) {
      const fileName = parse(this.url).pathname;
      const filePath = join(cwd, fileName);
      const isHTML = /\.html?$/.test(this.url.split('?')[0]);
      if (isHTML && existsSync(filePath)) {
        const injectScript = `<script src='http://${localIP}:${opts.port}/livereload.js'></script>`;
        let content = readFileSync(filePath, 'utf-8');
        const docTypeReg = new RegExp('^\s*\<\!DOCTYPE\s*.+\>.*$', 'im');
        const docType = content.match(docTypeReg);
        if (docType) {
          content = content.replace(docTypeReg, docType[0] + injectScript);
          this.body = content;

          return;
        }
        content = injectScript + content;
        this.body = content;

        return;
      }
      yield next;
    };
  },
};
