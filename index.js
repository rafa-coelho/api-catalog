const express = require('express');
const app = express();

app.use(express.json())

global.HOST_SDM = "https://dessdm-por.sonda.com:8080/axis/services/USD_R11_WebService";
const consign = require('consign');
consign().include('controllers').into(app);


app.listen(3333, () => {
    for (let index = 0; index < 10; index++) console.log()
    console.clear();
    console.log("---------------------------")
    console.log("Rodando na porta 3333");
});
