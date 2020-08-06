exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("request_field", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('request', 45).notNullable();
        table.string('name', 200).notNullable();
        table.string('value', 200).notNullable();
        
        table.string('_status', 25);
        table.integer('deleted').defaultTo(0);
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('request_field');
}