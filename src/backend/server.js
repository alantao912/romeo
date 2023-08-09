const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.get('/chess', jsonParser, function(req, res, next) {

});

app.listen(3000);