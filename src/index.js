import { existsSync, readFileSync } from 'fs';
import { parse } from 'url';
import { join, extname } from 'path';
import isEqual from 'lodash.isequal';
import tinylr from 'tiny-lr';

const localIP = require('internal-ip')();

let lrOpts = {};

let pluginOpts = {
  compiler: false,
  injectHost: localIP,
  enableJs: true,
  enableCss: true,
  enableImg: true,
  enableAll: false,
};

const ignorePattern = {
  enableJs: 'js',
  enableCss: 'css',
  enableImg: 'jpg|jpeg|gif|png|bmp',
};
let pattern = '';
let tinylrServer = {};
let firstRun = 0;
let preCompilerationAssets = {};


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

function getPattern(opts) {
  const patternString = Object.keys(opts).reduce((prev, item) => {
    if (opts[item] && ignorePattern[item]) {
      prev.push(ignorePattern[item]);
    }

    return prev;
  }, []);

  return patternString.join('|');
}

export default {
  'middleware.before'() {
    const { log, query } = this;
    if (query && typeof query === 'object') {
      pluginOpts = { ...pluginOpts, ...query };
      if (pluginOpts.enableAll) {
        pattern = '.*$';
      } else {
        pattern = `.(${getPattern(pluginOpts)})$`;
      }
    }
    lrOpts = {
      port: 35729,
      errorListener(err) {
        log.error(err);
      },
    };
    tinylrServer = tinylr(lrOpts);
    tinylrServer.listen(lrOpts.port, () => {
      log.info(`listening on ${lrOpts.port}`);
    });
  },

  'middleware'() {
    const { cwd, log } = this;
    let isNeedLiveReload = true;
    let reg;
    if (pattern.length !== 1) {
      reg = new RegExp(pattern, 'i');
      log.debug(`livereload is watching the pattern of ${pattern} files`);
    } else {
      isNeedLiveReload = false;
    }

    const compiler = pluginOpts.compiler || this.get('compiler');
    if (!compiler) {
      throw new Error('[error] must used together with dora-plugin-atool-build');
    }
    compiler.plugin('done', stats => {
      if (stats.hasErrors()) {
        log.error(stats.toString());

        return;
      }

      const assets = stats.compilation.assets;
      if (!isNeedLiveReload) {
        return;
      }

      let items = [];
      items = Object.keys(assets).filter((item) => reg.test(item) && extname(item) !== '.map');
      log.debug(`final watching items ${items}`);

      if (!firstRun) {
        firstRun ++;
        preCompilerationAssets = items.reduce((prev, item) => {
          const preItem = prev;
          preItem[item] = getAssetContent(assets[item]);

          return preItem;
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

      tinylrServer.changed({
        body: {
          files: changedItems,
        },
      });
      log.info(`livereload changed ${changedItems.join(', ')}`);
    });

    return function* mw(next) {
      const pathName = parse(this.url).pathname;
      const fileName = pathName === '/' ? 'index.html' : pathName;
      const filePath = join(cwd, fileName);
      const isHTML = /\.html?$/.test(fileName);
      if (isHTML && existsSync(filePath)) {
        const injectScript = `<script src='http://${pluginOpts.injectHost}:${lrOpts.port}/livereload.js'></script>`;
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
