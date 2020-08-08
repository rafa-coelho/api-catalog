exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('role_permission').then(function (exists) {
        if (!exists)
            return database.schema.createTable("role_permission", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('role', 50).notNullable();
                table.string('action', 50).notNullable();
                table.integer('deleted').defaultTo(0);
            });

    });
}

exports.down = async function (database) {
    return database.schema.hasTable('role_permission').then(function (exists) {
        if (exists)
            return database.schema.dropTable('role_permission');
    });
}