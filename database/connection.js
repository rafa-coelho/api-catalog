const connection = require('../knexfile');
module.exports = connection[PROD ? 'preduction' : 'development'];