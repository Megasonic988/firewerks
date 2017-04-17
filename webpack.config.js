const path = require('path');

module.exports = {
  entry: path.resolve('client') + '/app.js',
  output: {
    path: path.resolve('client') + '/bin',
    filename: 'app.js'
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/}
    ]
  }
}
