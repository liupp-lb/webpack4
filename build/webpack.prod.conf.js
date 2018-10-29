const path = require('path')
const conf = require('./config.js')
const baseConf = require('./webpack.base.conf.js')
const merge = require('webpack-merge')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyjsPlugin = require('uglifyjs-webpack-plugin')
process.env.NODE_ENV = 'production'
module.exports = merge.smart(baseConf, {
  mode: 'production',
  output: {
    publicPath: conf.build.publicPath,
    chunkFilename: conf.base.assetsDir + '/js/[name].[chunkhash].js'
  },
  module: {
    rules: [{
      test: /(png|jpe?g|gif)$/,
      use: {
        loader: 'image-webpack-loader',
        options: {
          disable: true
        }
      }
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: conf.base.assetsDir + '/css/[name].[contenthash].css'
    }),
    new webpack.HashedModuleIdsPlugin()
  ],
  devtool: conf.build.devtool,
  optimization: {
    splitChunks: {
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          name: 'vendors',
          minChunks: 1
        },
        commons: {
          test: /[\\/]src[\\/]js[\\/]/,
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true
        }
      }
    },
    minimizer: [new OptimizeCssAssetsPlugin({}), new UglifyjsPlugin()],
    runtimeChunk: conf.base.html.length > 1 ? false : true
  }
})
