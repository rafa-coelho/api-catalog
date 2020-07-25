const express = require('express');
const app = express();

app.use(express.json())

global.HOST_SDM = "https://sdm17.sondait.com.br:8080/axis/services/USD_R11_WebService";
const consign = require('consign');
consign().include('controllers').into(app);


const fs = require("fs");
const directories = ["utils"];
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


app.listen(3333, () => {
    console.log("--------------------------------------------");
    for (let index = 0; index < 10; index++) console.log("\n");
    console.clear();
    console.log("Rodando na porta 3333");
});
