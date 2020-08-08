exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('offering_field').then(function (exists) {
        if (!exists)
            return database.schema.createTable("offering_field", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('name', 50).notNullable();
                table.string('offering', 45);
                table.string('label', 30).notNullable();
                table.string('type', 30).notNullable();
                table.integer('automatic').defaultTo(0);
                table.integer('multiple').defaultTo(0);
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('offering_field').then(function (exists) {
        if (exists)
            return database.schema.dropTable('offering_field');
    });
}