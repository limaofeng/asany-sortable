const replace = require('@rollup/plugin-replace');
const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
          cssnano({
            preset: 'default',
          }),
        ],
        inject: true,
        extract: !!options.writeMeta,
        less: true,
      })
    );
    config.plugins = config.plugins.map(p => {
      if (p.name === 'replace') {
        return replace({
          'process.env.NODE_ENV': JSON.stringify(options.env),
          preventAssignment: true,
        })
      }
      return p
    });
    return config;
  },
};