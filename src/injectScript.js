import ConcatSource from 'webpack-core/lib/ConcatSource';
import { getInjectLivereloadContent } from './util';

export default class InjectScript {
  static defaults = {
    injectHost: '127.0.0.1',
    port: '35729',
  };

  constructor(options) {
    this.options = { ...InjectScript.defaults, ...options };
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      const opts = this.options;
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        chunks.forEach(chunk => {
          chunk.files.filter(file => /.(js)$/.test(file)).forEach(file => {
            const injectContent = getInjectLivereloadContent(opts.injectHost, opts.port);
            compilation.assets[file] = new ConcatSource(
              injectContent,
              '\n',
              compilation.assets[file]
            );
          });
        });

        callback();
      });
    });
  }
}
