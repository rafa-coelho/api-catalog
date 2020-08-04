exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("session", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('user', 45).notNullable();
        table.string('status', 25);
        table.boolean('deleted');
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('session');
}