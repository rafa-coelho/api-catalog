exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('user_role').then(function (exists) {
        if (!exists)
            return database.schema.createTable("user_role", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('user', 45).notNullable();
                table.string('role', 45).notNullable();
                table.integer('deleted').defaultTo(0);
            });
    })
}

exports.down = async function (database) {
    return database.schema.hasTable('user_role').then(function (exists) {
        if (exists)
            return database.schema.dropTable('user_role');
    });
}