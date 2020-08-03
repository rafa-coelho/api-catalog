exports.up = async function(knex) {
    return knex.schema.createTable("domain_value", table => {
        table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('type', 45).notNullable();
        table.string('parent', 45).notNullable();
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('domain_value');
}