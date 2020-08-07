exports.up = async function(knex, utf8 = false) {
    return knex.schema.createTable("role_permission", table => {
        if(utf8)
            table.collate('utf8_unicode_ci');
        table.string('id', 45).primary();
        table.string('role', 50).notNullable();
        table.string('action', 50).notNullable();
    });
}

exports.down = async function(knex) {
    return knex.schema.dropTable('role_permission');
}