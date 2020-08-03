exports.up = async function(knex) {
    return knex.schema.createTable("offering_field_option", table => {
        table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('field', 45).notNullable();
        table.string('label', 50).notNullable();
        table.string('value', 50).notNullable();
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('offering_field_option');
}