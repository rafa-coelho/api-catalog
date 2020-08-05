exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("offering_field", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('name', 50).notNullable();
        table.string('label', 30).notNullable();
        table.string('type', 30).notNullable();
        table.integer('automatic').defaultTo(0);
        table.integer('multiple').defaultTo(0);
        table.integer('deleted').defaultTo(0);
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('offering_field');
}