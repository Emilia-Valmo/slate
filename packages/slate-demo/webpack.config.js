const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackTemplate = require('html-webpack-template')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin
const IS_PROD = process.env.NODE_ENV === 'production'
const IS_DEV = !IS_PROD

const config = {
  mode: IS_PROD ? 'production' : 'development',
  entry: ['react-hot-loader/patch', './src/index.tsx'],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name]-[hash].js',
  },
  devtool: IS_PROD ? 'source-map' : 'inline-source-map',
  devServer: {
    contentBase: './src',
    publicPath: '/',
    hot: true,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        parallel: true,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: 'source-map-loader',
        enforce: 'pre',
      },
      {
        test: /\.ts?x?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          IS_DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name]-[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Slate',
      template: HtmlWebpackTemplate,
      inject: false,
      scripts: ['https://cdn.polyfill.io/v2/polyfill.min.js'],
      links: [
        'https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i&subset=latin-ext',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
      ],
    }),
    IS_DEV && new HotModuleReplacementPlugin(),
  ].filter(Boolean),
}

module.exports = config
