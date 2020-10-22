const argv = require('yargs').argv
const webpack = require('webpack')
const cssnano = require('cssnano')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const project = require('./project.config')
const debug = require('debug')('app:config:webpack')
const { __DEV__, __PROD__, __TEST__ } = project.globals

debug('Creating configuration.')
const webpackConfig = {
  mode: project.env,
  cache: { type: 'filesystem', buildDependencies: { config: [__filename] } },
  optimization: {
    emitOnErrors: true,
    concatenateModules: false,
  },
  name    : 'client',
  target  : 'web',
  devtool : false,
  resolve: {
    modules: [
      project.paths.client(),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.json']
  },
  module : {
    rules: []
  }
}

// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = project.paths.client('main.js')

webpackConfig.entry = {
  app: { import: project.paths.client('main.js'), dependOn: 'shared' },
  ...(__DEV__ ? { localDevHmr: { import: `webpack-hot-middleware/client?path=${project.compiler_public_path}__webpack_hmr`, dependOn: 'shared' } } : {}),
  shared: ['react','react-dom','redux','react-redux','react-router','react-router-dom'],

  // babelPolyfill: 'babel-polyfill',
  // fetchPolyfill: 'whatwg-fetch',
  // vendor: project.compiler_vendors,
  // app: __DEV__
  //     ? [APP_ENTRY, `webpack-hot-middleware/client?path=${project.compiler_public_path}__webpack_hmr`]
  //     : [APP_ENTRY]
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename   : __PROD__ ? `[name].[chunkhash].js` : `[name].[fullhash].js`,
  path       : project.paths.dist(),
  publicPath : project.compiler_public_path
}

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
  new webpack.DefinePlugin(project.globals),
  new HtmlWebpackPlugin({
    template : project.paths.client('index.html'),
    hash     : false,
    filename : 'index.html',
    inject   : 'body',
    minify   : {
      collapseWhitespace : true
    }
  })
]

// Ensure that the compiler exits on errors during testing so that
// they do not get skipped and misreported.
if (__TEST__ && !argv.watch) {
  webpackConfig.plugins.push(function () {
    this.plugin('done', function (stats) {
      if (stats.compilation.errors.length) {
        // Pretend no assets were generated. This prevents the tests
        // from running making it clear that there were warnings.
        throw new Error(
          stats.compilation.errors.map(err => err.message || err)
        )
      }
    })
  })
}

if (__DEV__) {
  debug('Enabling plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
} else if (__PROD__) {
  debug('Enabling plugins for productio.')
  //webpackConfig.plugins.push()
}

// ------------------------------------
// Loaders
// ------------------------------------
webpackConfig.module.rules = []

// JavaScript
webpackConfig.module.rules.push({
  test: /\.(js|jsx)$/,
  include: [
    project.paths.client(),
  ],
  use: [
    {
      loader: require.resolve('babel-loader'),
      options: project.compiler_babel,
    }
  ]
})

// ------------------------------------
// Style Loaders
// ------------------------------------

// Add any packge names here whose styles need to be treated as CSS modules.
// These paths will be combined into a single regex.
const PATHS_TO_TREAT_AS_CSS_MODULES = [
  // 'react-toolbox', (example)
]

const compilerCssModules = true

// If config has CSS modules enabled, treat this project's styles as CSS modules.
if (compilerCssModules) {
  PATHS_TO_TREAT_AS_CSS_MODULES.push(
    project.paths.client().replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&') // eslint-disable-line
  )
}

const isUsingCSSModules = !!PATHS_TO_TREAT_AS_CSS_MODULES.length
const cssModulesRegex = new RegExp(`(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`)

// Loaders for styles that need to be treated as CSS modules.
if (isUsingCSSModules) {

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    include: cssModulesRegex,
    use: [
      { loader: require.resolve('style-loader'), options: { } },
      { loader: require.resolve('css-loader'), options: { sourceMap: true, modules: { localIdentName: '[name]__[local]___[hash:base64:5]' }, importLoaders: 1 } },
      { loader: require.resolve('postcss-loader'), options: { sourceMap: true } },
      { loader: require.resolve('sass-loader'), options: { sourceMap: true, sassOptions: { includePaths: [project.paths.client('styles')] } } }
    ]
  })

  webpackConfig.module.rules.push({
    test: /\.css$/,
    include: cssModulesRegex,
    use: [
      { loader: require.resolve('style-loader'), options: { } },
      { loader: require.resolve('css-loader'), options: { sourceMap: true, modules: { localIdentName: '[name]__[local]___[hash:base64:5]' }, importLoaders: 1 } },
      { loader: require.resolve('postcss-loader'), options: { sourceMap: true } },
    ]
  })
}

// Loaders for files that should not be treated as CSS modules.
const excludeCSSModules = isUsingCSSModules ? cssModulesRegex : false
webpackConfig.module.rules.push({
  test: /\.scss$/,
  exclude: excludeCSSModules,
  use: [
    { loader: require.resolve('style-loader'), options: { } },
    { loader: require.resolve('css-loader'), options: { } },
    { loader: require.resolve('postcss-loader'), options: { sourceMap: true } },
    { loader: require.resolve('sass-loader'), options: { sourceMap: true, sassOptions: { includePaths: [project.paths.client('styles')] } } }
  ]
})
webpackConfig.module.rules.push({
  test: /\.css$/,
  exclude: excludeCSSModules,
  use: [
    { loader: require.resolve('style-loader'), options: { } },
    { loader: require.resolve('css-loader'), options: { } },
    { loader: require.resolve('postcss-loader'), options: { sourceMap: true } },
  ]
})

// File loaders
/* eslint-disable */
webpackConfig.module.rules.push(
  { test: /\.(woff|woff2|ttf|eot|svg)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/, use: [{ loader: require.resolve('url-loader'), options: { limit: 100000 } }] },
  { test: /\.(gif|png|jpg)$/, use: [ { loader: require.resolve('url-loader'), options: { limit: 8192 } }] }
)
/* eslint-enable */

/* try to resolve extensionless .mjs and .js imports */
webpackConfig.module.rules.push(
  { test: /\.m?js$/, type: 'javascript/auto', resolve: { fullySpecified: false } },
)
/* done */

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
  //webpackConfig.plugins.push()
}
console.log(webpackConfig)
module.exports = webpackConfig
