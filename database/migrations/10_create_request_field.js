exports.up = async function (database, utf8 = false) {
    return database.schema.hasTable('request_field').then(function (exists) {
        if (!exists)
        return database.schema.createTable("request_field", table => {
            if(utf8)
                table.collate('utf8_unicode_ci');
            table.string('id', 45).primary();
            table.string('request', 45).notNullable();
            table.string('name', 200).notNullable();
            table.string('value', 200).notNullable();
            
            table.string('_status', 25);
            table.integer('deleted').defaultTo(0);
        });
    });
}

exports.down = async function (database) {
    return database.schema.hasTable('request_field').then(function (exists) {
        if (exists)
            return database.schema.dropTable('request_field');
    });
}