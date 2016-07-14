'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInjectLivereloadContent = getInjectLivereloadContent;
function getInjectLivereloadContent(host, port) {
  var src = 'http://' + host + ':' + port + '/livereload.js';
  var injectContent = ['// livereload', '(function() {', '  if (typeof window === "undefined") { return };', '  window.onload = function() {', '    var id = "webpack-livereload-plugin-script";', '    if (document.getElementById(id)) { return; }', '    var el = document.createElement("script");', '    el.id = id;', '    el.async = true;', '    el.src = "' + src + '";', '    document.body.appendChild(el);', '  }', '}());', ''].join('\n');

  return injectContent;
}