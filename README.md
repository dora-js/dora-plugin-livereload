# dora-plugin-livereload

[![NPM version](https://img.shields.io/npm/v/dora-plugin-livereload.svg?style=flat)](https://npmjs.org/package/dora-plugin-livereload)
[![Build Status](https://img.shields.io/travis/dora-js/dora-plugin-livereload.svg?style=flat)](https://travis-ci.org/dora-js/dora-plugin-livereload)
[![Coverage Status](https://img.shields.io/coveralls/dora-js/dora-plugin-livereload.svg?style=flat)](https://coveralls.io/r/dora-js/dora-plugin-livereload)
[![NPM downloads](http://img.shields.io/npm/dm/dora-plugin-livereload.svg?style=flat)](https://npmjs.org/package/dora-plugin-livereload)

dora plugin for livereload。

---

## Usage

```bash
$ npm i dora dora-plugin-webpack dora-plugin-livereload -SD
$ ./node_modules/.bin/dora --plugins 'webpack,livereload?enableJs=true&enableCss=true&enableImg=true&enableAll:false'
```

## Param

`always ignore .map files`

default:

```javascript
{
  compiler: false,
  injectHost: localIP,
  enableJs:true,
  enableCss:true,
  enableImg:true,
  enableAll:false,
  port: customPort, // default port is 35729
}
```
## Test

```bash
$ npm test
```

## LICENSE

MIT
