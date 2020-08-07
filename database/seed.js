global.PROD = process.env.NODE_ENV == 'prod';
const fs = require('fs');
const path = require('path');
const knex = require('./connection');

const seedsDir = path.join(__dirname, 'seeds');

const rollback = async () => {

    const seeds = fs.readdirSync(seedsDir);

    for (const file of seeds) {
        const seed = require(`${seedsDir}/${file}`);
        let error = false;
        try {
            await seed.seed(knex);
        } catch (E) {
            error = true;
            console.log(E);
        }
        if (!error) {
            console.log(`Runned ${file} successfully!`);
        }
    }

    console.log('Done!');
    process.exit();
}

rollback();