exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("request", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('user', 45).notNullable();
        table.string('offering', 45).notNullable();
        table.string('summary', 200);
        table.string('status', 25);
        
        table.integer('created_at', 30).defaultTo(0);
        table.integer('updated_at', 30).defaultTo(0);
        
        table.string('_status', 25);
        table.integer('deleted').defaultTo(0);
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('request');
}