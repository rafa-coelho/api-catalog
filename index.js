const express = require('express');
const app = express();
const cors = require('cors');
const expressValidator = require("express-validator");

app.use(express.json());
app.use(cors());
app.use(expressValidator());



global.PROD = process.env.NODE_ENV === 'prod'
global.HOST_SDM = "https://dessdm-por.sonda.com:8080/axis/services/USD_R11_WebService";
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

app.listen(3333, () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});

