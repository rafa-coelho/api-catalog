exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("user_role", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('user', 45).notNullable();
        table.string('role', 45).notNullable();
        table.integer('deleted').defaultTo(0);
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('user_role');
}