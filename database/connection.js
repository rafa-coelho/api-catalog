const knex = require('knex');
const connection = require('../knexfile');

module.exports = knex(connection[PROD ? 'production' : 'development']);