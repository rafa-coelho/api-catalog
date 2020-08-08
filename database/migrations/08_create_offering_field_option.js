exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('offering_field_option').then(function (exists) {
        if (!exists)
            return database.schema.createTable("offering_field_option", table => {
                if (utf8)
                    table.collate('utf8_unicode_ci');
                table.string('id', 45).primary();
                table.string('field', 45).notNullable();
                table.string('label', 50).notNullable();
                table.string('value', 50).notNullable();
                table.integer('deleted').defaultTo(0);
            });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('offering_field_option').then(function (exists) {
        if (exists)
            return database.schema.dropTable('offering_field_option');
    });
}