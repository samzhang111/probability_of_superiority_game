const path = require('path');

module.exports = {
  entry: './src/prob-dev.js',
  output: {
    filename: 'prob.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
