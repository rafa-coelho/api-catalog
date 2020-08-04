global.PROD = process.env.NODE_ENV == 'prod';
const fs = require('fs');
const path = require('path');
const knex = require('./connection');
const e = require('express');

const migrationsDir = path.join(__dirname, 'migrations');

const migrate = async () => {
    if(PROD){
        const conn = {
            host: process.env.DB_HOST ? process.env.DB_HOST : "127.0.0.1",
            user: process.env.DB_USER ? process.env.DB_USER : "root",
            password: process.env.DB_PASS ? process.env.DB_PASS : "",
            charset: 'utf8'
        };
    
        try{
            const knex = require('knex')({ client: 'mysql', connection: conn });
            knex.raw(`CREATE DATABASE ${process.env.DB_BASE ? process.env.DB_BASE : "catalog"}`).then(() => { }).catch(e => {});
        }catch(e){
            console.log(e);
        }
    }


    
    const migrations = fs.readdirSync(migrationsDir);

    for (const file of migrations) {
        const migration = require(`${migrationsDir}/${file}`);
        let error = false;
        try{
            await migration.up(knex);
        }catch(E){
            if(E.toString().indexOf('Knex only supports collate statement with mysql.') < 0){
                error = true;
                console.log(E);
            }
        }
        if(!error){
            // console.log(`Runned ${file} successfully!`);
        }
    }

    console.log('Database generated successfully');
    process.exit();
}

migrate();