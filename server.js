var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

var peopleData = require('./peopleData');
var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.status(200).render('homePage');
});

app.get('/people', function (req, res) {
  res.status(200).render('peoplePage', {
    people: peopleData
  });
});

app.get('/people/:personId', function(req, res, next) {
  var personId = req.params.personId;
  if (peopleData[personId]) {
    var person = peopleData[personId];
    res.status(200).render('personPage', person);
  }
  else {
    next();
  }
});

app.use(express.static('public'));

app.get('*', function (req, res) {
  res.status(404).render('404');
});

app.post('/people/:personId/addPhoto', function (req, res, next) {
  var personId = req.params.personId;
  if (peopleData[personId]) {
    if (req.body && req.body.photoURL) {
      peopleData[personId].photos.push({
        photoURL: req.body.photoURL,
        caption: req.body.caption
      });
      res.status(200).send("Success");
    } else {
      res.status(400).send("Request body needs a `photoURL` field.");
    }
  } else {
    next();
  }
});

app.post('*', function (req, res) {
  res.status(404).send("POST to unknown path");
});

app.listen(port, function () {
  console.log("== Server listening on port:", port);
});
