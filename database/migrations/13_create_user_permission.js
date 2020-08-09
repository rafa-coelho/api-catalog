exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('user_permission').then(function (exists) {
        if (!exists)
            return database.schema.createTable("user_permission", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('user', 45).notNullable();
                table.string('action', 80).notNullable();
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('user_permission').then(function (exists) {
        if (exists)
            return database.schema.dropTable('user_permission');
    });
}