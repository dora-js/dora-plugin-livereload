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
$ ./node_modules/.bin/dora --plugins 'webpack,livereload?enableJs=true&enableCss=true&enableImg=true&port=35429&enableAll:false'
```

## Param

`always ignore .map files`

default:

```javascript
{
  compiler: false, // 开放给 atool-doc 使用，一般开发者请忽略
  injectHost: localIP, // 指定注入资源文件的 host 名称，诸如 localhost ip 地址 等
  enableJs:true, // 对 js 开启 livereload
  enableCss:true, // 对 css 开启 livereload
  enableImg:true, // 对 image 开启 livereload
  enableAll:false, // 对所有文件开启 livereload
  port: 35729 // livereload 端口号
}
```
## Test

```bash
$ npm test
```

## LICENSE

MIT
