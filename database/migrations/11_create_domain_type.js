exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('domain_type').then(function (exists) {
        if (!exists)
            return database.schema.createTable("domain_type", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('name', 50).notNullable();
                table.string('description', 200);
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('domain_type').then(function (exists) {
        if (exists)
            return database.schema.dropTable('domain_type');
    });
}