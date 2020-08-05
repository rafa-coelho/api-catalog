exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("domain_type", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('description', 200);
        table.integer('deleted').defaultTo(0);
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('domain_type');
}