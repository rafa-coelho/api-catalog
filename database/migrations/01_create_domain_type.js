exports.up = async function(knex) {
    return knex.schema.createTable("domain_type", table => {
        table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('description', 200).notNullable();
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('domain_type');
}