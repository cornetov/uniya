var webpack = require('webpack');
var path = require('path');

// variables
var port = process.env.port || 1337;
var isProduction = process.argv.indexOf('-p') >= 0;
var sourcePath = path.join(__dirname, './src');
var outPath = path.join(__dirname, '../../dist/uniya');

module.exports = {
  context: sourcePath,
  entry: {
    main: './src/index.ts'
  },
  output: {
    path: outPath,
    publicPath: '/',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    loaders: [
      // .ts, .tsx
      {
        test: /\.tsx?$/,
        use: isProduction
          ? 'awesome-typescript-loader?module=es6'
          : [
            'awesome-typescript-loader'
          ]
      }
    ]
  },
  devServer: {
    contentBase: sourcePath,
    stats: {
      warnings: false
    }
  },
  node: {
    // workaround for webpack-dev-server issue
    // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
    fs: 'empty',
    net: 'empty'
  }
};