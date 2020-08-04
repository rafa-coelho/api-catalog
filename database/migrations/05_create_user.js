exports.up = async function(knex) {
    return knex.schema.createTable("user", table => {
        table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('external_id', 80).notNullable();
        table.string('name', 80).notNullable();
        table.string('email', 80).notNullable();
        table.string('username', 80).notNullable();
        table.string('password', 80).notNullable();
        table.string('access_type', 25).notNullable();
        table.string('status', 25).notNullable();
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('user');
}