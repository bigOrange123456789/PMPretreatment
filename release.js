var express = require('express');
var app = express();
app.use('/', express.static('mytest/'));
app.listen(8081);