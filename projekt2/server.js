const body_parser= require('body-parser');
const mongodb = require('mongodb');
const express = require('express');
const session = require('express-session');
const pug = require('pug');

const dbname = '8szeliga';
const url = 'mongodb://'+dbname+':pass'+dbname+'@172.20.44.25/'+dbname;
var clientdb;
const app = express();

app.use(body_parser.json());
app.use(body_parser.urlencoded( {extended: true } ));
app.use(
	session({secret: 'some-secret',
   			 resave: true,
   			 saveUninitialized: true})
);

app.listen(4224,function() {
   console.log('listening on ' + 4224);
})

var authorization = function(req, res, next) {
   if (req.session && req.session.admin && req.session.user === "admin")
     return next();
   else
     return res.status(401).send("Najpierw musisz się zalogować!");
 };

app.get('/style.css', function(req,res) {
   res.sendFile(__dirname + '/style.css');
})

app.get('/functions.js', function(req,res) {
   res.sendFile(__dirname + '/functions.js');
})

app.get('/documentation', function(req,res) {
   result = pug.renderFile('templates/documentation.pug');
   res.status(200).send(result);
})

app.get('/analytics', authorization, function(req,res) {
   result = pug.renderFile('templates/analytics.pug');
   res.status(200).send(result);
})

app.get('/analytics_data', authorization, function(req,res) {
   var cursor = clientdb.collection('survey').find().toArray(function(error, db_results) {
      if (error) 
      	return console.log(error);
      res.status(200).send(db_results);
   })
})

app.get('/login', function(req,res) {
   result = pug.renderFile('templates/login.pug');
   res.status(200).send(result);
})

app.post('/login', function(req,res) {
   console.log(req.body);
   if (!req.body.username || !req.body.pass) {
      res.status(401).send("Złe hasło lub login");
   } else if(req.body.username === "admin" && req.body.pass === "1111") {
      req.session.user = "admin";
      req.session.admin = true;
      mongodb.MongoClient.connect(url, function(error, client) {
         if (error) 
         	return console.log(error)
         clientdb = client.db(dbname);
         console.log('Connect OK');
      })

      res.status(200).send("Zalogowano: jesteś online");
   } else
      res.status(401).send("Złe hasło lub login");
})

app.get('/logout', function(req,res) {
   req.session.destroy();
   result = pug.renderFile('templates/survey.pug');
   res.status(200).send(result);
})

app.get('/', function(req,res) {
   result = pug.renderFile('templates/survey.pug');
   res.status(200).send(result);
})

app.post('/survey', function( req,res ) {
   	if(req.session.admin){
   		clientdb.collection('survey').insertOne(req.body, function(error,result){
      		if (error) 
      			return console.log(error);
         	res.end();
      	})
    } else
      	res.status(401).send("Najpierw musisz się zalogować!");
})

app.get('/survey_results', function(req, res) {
   if(req.session.admin){
      result = pug.renderFile('templates/survey_results.pug');
      res.status(200).send(result);
   } else
      res.status(401).send("Najpierw musisz się zalogować!");
})

app.get('/survey_save_offline', function(req, res) {
   if(!req.session.admin){
      result = pug.renderFile('templates/survey_save_offline.pug');
      res.status(200).send(result);
   }else
      res.status(401).send("Najpierw wyloguj się");
})
