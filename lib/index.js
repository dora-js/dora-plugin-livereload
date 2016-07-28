'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _fs = require('fs');

var _url = require('url');

var _path = require('path');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _tinyLr = require('tiny-lr');

var _tinyLr2 = _interopRequireDefault(_tinyLr);

var _util = require('./util');

var _injectScript = require('./injectScript');

var _injectScript2 = _interopRequireDefault(_injectScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var localIP = require('address').ip();

var lrOpts = {
  port: 35729
};

var pluginOpts = {
  compiler: false,
  injectHost: localIP,
  enableJs: true,
  enableCss: true,
  enableImg: true,
  enableAll: false
};

var ignorePattern = {
  enableJs: 'js',
  enableCss: 'css',
  enableImg: 'jpg|jpeg|gif|png|bmp'
};
var pattern = '';
var tinylrServer = {};
var firstRun = 0;
var preCompilerationAssets = {};

function getAssetContent(asset) {
  var content = null;
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
  var patternString = (0, _keys2.default)(opts).reduce(function (prev, item) {
    if (opts[item] && ignorePattern[item]) {
      prev.push(ignorePattern[item]);
    }

    return prev;
  }, []);

  return patternString.join('|');
}

exports.default = {
  name: 'livereload',

  'middleware.before': function middlewareBefore() {
    var log = this.log;


    lrOpts = (0, _extends3.default)({}, lrOpts, {
      errorListener: function errorListener(err) {
        log.error(err);
      }
    });
    tinylrServer = (0, _tinyLr2.default)(lrOpts);
    tinylrServer.listen(lrOpts.port, function () {
      log.info('listening on ' + lrOpts.port);
    });
  },
  'middleware': function middleware() {
    var cwd = this.cwd;
    var log = this.log;

    var isNeedLiveReload = true;
    var reg = void 0;
    if (pattern.length !== 1) {
      reg = new RegExp(pattern, 'i');
      log.debug('livereload is watching the pattern of ' + pattern + ' files');
    } else {
      isNeedLiveReload = false;
    }

    var compiler = pluginOpts.compiler || this.get('compiler');
    if (!compiler) {
      throw new Error('[error] must used together with dora-plugin-webpack');
    }

    compiler.plugin('done', function (stats) {
      if (stats.hasErrors()) {
        log.error(stats.toString());

        return;
      }

      var assets = stats.compilation.assets;
      if (!isNeedLiveReload) {
        return;
      }

      var items = [];
      items = (0, _keys2.default)(assets).filter(function (item) {
        return reg.test(item) && (0, _path.extname)(item) !== '.map';
      });
      log.debug('final watching items ' + items);

      if (!firstRun) {
        firstRun++;
        preCompilerationAssets = items.reduce(function (prev, item) {
          var preItem = prev;
          preItem[item] = getAssetContent(assets[item]);

          return preItem;
        }, {});

        return;
      }

      var changedItems = items.reduce(function (prev, item) {
        var pre = preCompilerationAssets[item];
        var now = getAssetContent(assets[item]);

        if (!(0, _lodash2.default)(pre, now)) {
          preCompilerationAssets[item] = now;
          prev.push(item);
        }

        return prev;
      }, []);

      tinylrServer.changed({
        body: {
          files: changedItems
        }
      });
      log.info('livereload changed ' + changedItems.join(', '));
    });

    return _regenerator2.default.mark(function mw(next) {
      var pathName, fileName, filePath, isHTML, injectContent, injectScript, content;
      return _regenerator2.default.wrap(function mw$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              pathName = (0, _url.parse)(this.url).pathname;
              fileName = pathName === '/' ? 'index.html' : pathName;
              filePath = (0, _path.join)(cwd, fileName);
              isHTML = /\.html?$/.test(fileName);

              if (!(isHTML && (0, _fs.existsSync)(filePath))) {
                _context.next = 11;
                break;
              }

              injectContent = (0, _util.getInjectLivereloadContent)(pluginOpts.injectHost, lrOpts.port);
              injectScript = '<script>' + injectContent + '</script>';
              content = (0, _fs.readFileSync)(filePath, 'utf-8');

              content = content + injectScript;
              this.body = content;

              return _context.abrupt('return');

            case 11:
              _context.next = 13;
              return next;

            case 13:
            case 'end':
              return _context.stop();
          }
        }
      }, mw, this);
    });
  },
  'webpack.updateConfig.finally': function webpackUpdateConfigFinally(webpackConfig) {
    var query = this.query;

    if (query && (typeof query === 'undefined' ? 'undefined' : (0, _typeof3.default)(query)) === 'object') {
      pluginOpts = (0, _extends3.default)({}, pluginOpts, query);
      if (pluginOpts.enableAll) {
        pattern = '.*$';
      } else {
        pattern = '.(' + getPattern(pluginOpts) + ')$';
      }
    }

    webpackConfig.plugins.push(new _injectScript2.default({
      injectHost: pluginOpts.injectHost,
      port: lrOpts.port
    }));

    return webpackConfig;
  }
};
module.exports = exports['default'];