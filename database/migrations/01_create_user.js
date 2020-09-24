exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('user').then(function (exists) {
        if (!exists)
            return database.schema.createTable("user", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('external_id', 80);
                table.string('name', 80).notNullable();
                table.string('email', 80).notNullable();
                table.string('username', 80).notNullable();
                table.string('password', 80).notNullable();
                table.string('access_type', 80);
                table.string('company', 40);
                table.string('status', 25);
                table.integer('deleted').defaultTo(0);
            });

    });

}

exports.down = async function (database) {
    return database.schema.hasTable('user').then(function (exists) {
        if (exists)
            return database.schema.dropTable('user');
    });
}