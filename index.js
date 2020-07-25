const express = require('express');
const app = express();

const consign = require('consign');
consign().include('controllers').into(app);



app.listen(3333, () => {});



