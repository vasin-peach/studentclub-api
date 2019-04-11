if (process.env.NODE_ENV === 'production') {
  // Produciton environment
  module.exports = require('./prod')
} else {
  // Development or other environment
  module.exports = require('./dev');
}