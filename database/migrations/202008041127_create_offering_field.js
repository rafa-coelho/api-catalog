exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("offering_field", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('label', 30).notNullable();
        table.string('type', 30).notNullable();
        table.boolean('automatic');
        table.boolean('multiple');
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('offering_field');
}