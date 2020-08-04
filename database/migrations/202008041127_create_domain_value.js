exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("domain_value", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('type', 45);
        table.string('parent', 45);
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('domain_value');
}