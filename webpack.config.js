const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    './index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'Resources/public'),
    filename: 'file-bundle.js',
  },
  context: path.resolve(__dirname, 'Resources/js'),
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'Resources/js'),
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'Resources/js'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  ],
};
