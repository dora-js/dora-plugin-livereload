'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ConcatSource = require('webpack-core/lib/ConcatSource');

var _ConcatSource2 = _interopRequireDefault(_ConcatSource);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InjectScript = function () {
  function InjectScript(options) {
    (0, _classCallCheck3.default)(this, InjectScript);

    this.options = (0, _extends3.default)({}, InjectScript.defaults, options);
  }

  (0, _createClass3.default)(InjectScript, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('compilation', function (compilation) {
        var opts = _this.options;
        compilation.plugin('optimize-chunk-assets', function (chunks, callback) {
          chunks.forEach(function (chunk) {
            chunk.files.filter(function (file) {
              return (/.(js)$/.test(file)
              );
            }).forEach(function (file) {
              var injectContent = (0, _util.getInjectLivereloadContent)(opts.injectHost, opts.port);
              compilation.assets[file] = new _ConcatSource2.default(injectContent, '\n', compilation.assets[file]);
            });
          });

          callback();
        });
      });
    }
  }]);
  return InjectScript;
}();

InjectScript.defaults = {
  injectHost: '127.0.0.1',
  port: '35729'
};
exports.default = InjectScript;
module.exports = exports['default'];