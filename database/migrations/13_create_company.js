exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('company').then(function (exists) {
        if (!exists)
            return database.schema.createTable("company", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('name', 80).notNullable();
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('company').then(function (exists) {
        if (exists)
            return database.schema.dropTable('company');
    });
}