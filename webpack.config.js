var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js/everytweet.js',
    path: path.resolve(__dirname, 'build')
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/manifest.json' },
      { from: './src/assets/EveryTweet.png', to: 'icons/' },
      { from: './src/js/background.js', to: 'js/'},
      { from: './src/styles/all.css', to: 'css/'}
    ])
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      { test: /\.html$/, loader: "raw-loader" }
     ],
  },
  stats: {
    colors: true
  }
};