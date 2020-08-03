const knex = require('knex');
const path = require('path');

const connection = require('../knexfile');
module.exports = knex(connection[PROD ? 'preduction' : 'development']);