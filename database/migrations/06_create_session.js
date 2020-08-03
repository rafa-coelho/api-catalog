exports.up = async function(knex) {
    return knex.schema.createTable("session", table => {
        table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('external_id', 80).notNullable();
        table.string('user', 45).notNullable();
        table.string('status', 25).notNullable();
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('session');
}