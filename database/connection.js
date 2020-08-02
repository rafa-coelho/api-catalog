const knex = require('knex');
const path = require('path');

// const connection = knex({
//     client: 'sqlite3',
//     connection: {
//         filename: path.resolve(__dirname, 'database.sqlite')
//     },
//     useNullAsDefault: true
// });
const connection = knex({
    client: 'mysql',
    connection: {
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "catalog"
    },
    useNullAsDefault: true
});

module.exports = connection;