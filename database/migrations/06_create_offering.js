exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('offering').then(function (exists) {
        if (!exists)
            return database.schema.createTable("offering", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('name', 50).notNullable();
                table.string('company', 45);
                table.string('type').notNullable();
                table.string('external_id', 50);
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('offering').then(function (exists) {
        if (exists)
            return database.schema.dropTable('offering');
    });
}