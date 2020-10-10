exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('attachment').then(function (exists) {
        if (!exists)
            return database.schema.createTable("attachment", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('request', 45).notNullable();
                table.string('name', 80).notNullable();
                table.string('image', 80).notNullable();
                table.string('type', 80).notNullable();
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('attachment').then(function (exists) {
        if (exists)
            return database.schema.dropTable('attachment');
    });
}