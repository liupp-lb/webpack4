const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const conf = require('./config.js')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const isProd = process.env.NODE_ENV === 'production'
function createHtmInstance (htmlList) {
  return htmlList.map((val, i) => {
    const name = val.match(/[^/]*(?=\.html$)/)[0]
    const chunks = [name, 'vendors', 'commons']
    return new HtmlWebpackPlugin({
      filename: name + '.html',
      template: val,
      chunks: htmlList.length !== 1 ? chunks : undefined
    })
  })
}
function createEntry (entryList) {
  const entry = {}
  entryList.forEach((val, i) => {
    const name = val.match(/[^/]*(?=\.js$)/)[0]
    entry[name] = val
  })
  return entry
}
function createEslintRule () {
  return {
    test: /\.(js|vue)$/,
    enforce: 'pre',
    use: {
      loader: 'eslint-loader',
      options: {
        //formatter: require('eslint-friendly-formatter'),
        emitWarning: true
      }
    }
  }
}
module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: createEntry(conf.base.isSinglePage ? ['./src/index.js'] : conf.base.entry),
  output: {
    path: conf.base.outputPath,
    filename: conf.base.assetsDir + '/js/[name].' +  (isProd ? '[chunkhash].' : '') + 'js'
  },
  module: {
    rules: [
      ...(conf.dev.useEslint ? [createEslintRule()] : []),
      {
        test: /\.s?css$/,
        include: /src/,
        use: [
          {
            loader: isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            options: isProd ? {
              sourceMap: true,
              publicPath: '../../'
            } : undefined
          },
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
          'postcss-loader',
          ...(conf.base.pxToRem.turnon ? [{
            loader: 'px2rem-loader',
            options: conf.base.pxToRem
          }] : []),
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /(png|jpe?g|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8 * 1024,
            name: 'static/images/' + (isProd ? '[hash]' : '[name]') + '.[ext]'
          }
        }
      },
      {
        test: /\.(html)$/,
        use: {
          loader: 'art-template-loader',
          options: {
            htmlResourceRules: [/\bsrc="([^"]*)"/]
          }
        }
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    ...createHtmInstance(!conf.base.isSinglePage ? conf.base.html : ['./src/index.html']),
  ],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, '../src/assets'),
      components: path.resolve(__dirname, '../src/components'),
      vue$: 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, '../src')
    },
    extensions: ['.js', '.vue', 'json']
  }
}
