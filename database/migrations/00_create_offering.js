exports.up = async function(knex) {
    return knex.schema.createTable("offering", table => {
        table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('external_id', 50).notNullable();
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('offering');
}