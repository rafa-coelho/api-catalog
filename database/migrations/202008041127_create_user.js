exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("user", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('external_id', 80).notNullable();
        table.string('name', 80).notNullable();
        table.string('email', 80).notNullable();
        table.string('username', 80).notNullable();
        table.string('password', 80).notNullable();
        table.string('access_type', 25);
        table.string('status', 25);
        table.integer('deleted').defaultTo(0);
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('user');
}