// Only browsers with support of async/await are supported
// List based on the GitHub preset: https://github.com/github/babel-preset-github/blob/master/index.js
const BROWSERS = [
  'last 8 Chrome versions',
  'last 4 Firefox versions',
  'last 3 Safari versions',
  'last 4 Edge versions',
  'Firefox ESR',
  'Chrome >= 55',
  'Firefox >= 53',
  'Safari >= 10.3',
  'Edge >= 15',
  'Opera >= 42',
]

const COMMON_PRESETS = ['@babel/preset-react', '@babel/preset-flow']

const COMMON_PLUGINS = [
  '@babel/plugin-proposal-object-rest-spread',
  // Explicitly run flow-strip-types before class properties
  // https://github.com/babel/babel/issues/8417#issuecomment-430007587
  '@babel/plugin-transform-flow-strip-types',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-export-default-from',
  '@babel/plugin-proposal-export-namespace-from',
]

// Configuration for the published NPM packages
const BABEL_NPM = {
  plugins: COMMON_PLUGINS,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: BROWSERS.concat(['Node 8.14.0']),
        },
        modules: false,
        loose: true,
      },
    ],
  ].concat(COMMON_PRESETS),
}

// Configuration for tests
const BABEL_TEST = {
  plugins: COMMON_PLUGINS,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        exclude: ['transform-regenerator'],
      },
    ],
  ].concat(COMMON_PRESETS),
}

// Configuration for running benchmarks :D
const BABEL_BENCHMARK = BABEL_TEST

// Configuration for examples served on GitHub pages
const BABEL_WEBPACK = {
  plugins: COMMON_PLUGINS.concat(['react-hot-loader/babel']),
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: BROWSERS,
        },
        loose: true,
        modules: false,
      },
    ],
  ].concat(COMMON_PRESETS),
}

module.exports = function babelConfig(api) {
  switch (api.env()) {
    case 'webpack':
      return BABEL_WEBPACK
    case 'test':
      return BABEL_TEST
    case 'benchmark':
      return BABEL_BENCHMARK
    default:
      return BABEL_NPM
  }
}
