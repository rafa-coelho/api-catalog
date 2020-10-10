const express = require('express');
const app = express();
const cors = require('cors');
const expressValidator = require("express-validator");
const bodyparser = require("body-parser");
const fileUpload = require('express-fileupload');


require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(expressValidator());
app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

app.use(fileUpload({
    createParentPath: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Expose-Headers', '*');
    // res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

global.PROD = process.env.NODE_ENV === 'prod';
global.ROOT = __dirname;

const consign = require('consign');

const fs = require("fs");

const directories = ["utils", "classes"];
directories.forEach(dir => {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(function (file) {
            const Class = require(`./${dir}/${file}`);
            global[file.split(".")[0]] = Class;
        });
    } catch (e) {
        console.log(e);
    }
});

consign().include('controllers').into(app);

app.listen(3333, async () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});