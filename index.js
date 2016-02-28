var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/', function(req, res){
  console.log(req.body);
  res.end();  
})

app.listen(443 , function () {
    console.log('Ready');
});
