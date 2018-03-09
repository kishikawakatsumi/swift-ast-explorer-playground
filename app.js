'use strict';

const Express = require("express");
const ExpressBrute = require('express-brute');
const BodyParser = require('body-parser');
const Processor = require('./processor');
const compression = require('compression')

const app = Express();

const store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
const bruteforce = new ExpressBrute(store,{
    freeRetries: 50,
    lifetime: 3600
});

function random(size) {
  return require("crypto").randomBytes(size).toString('hex');
}

app.use(compression())
app.use(Express.static(__dirname + '/static'));
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/update', bruteforce.prevent, function(req, res) {
  const path = __dirname + "/";
  const folder = 'temp/' + random(10);
  const filename = 'main.swift';
  const code = req.body.code;

  const processor = new Processor(path, folder, filename, code);
  processor.update(function(data, error) {
    res.send({ output: data, errors: error })
  });
});

app.get('/', function(req, res) {
  res.sendfile("./index.html");
});

var server = require("http").createServer(app);
server.listen(8080, function() {
  console.log("Playground app listening on port " + server.address().port);
});
