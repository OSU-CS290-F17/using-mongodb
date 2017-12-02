var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var peopleData = require('./peopleData');
var app = express();
var port = process.env.PORT || 3000;

var mongoHost = process.env.MONGO_HOST;
var mongoPort = process.env.MONGO_PORT || 27017;
var mongoUser = process.env.MONGO_USER;
var mongoPassword = process.env.MONGO_PASSWORD;
var mongoDBName = process.env.MONGO_DB;

var mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword +
  '@' + mongoHost + ':' + mongoPort + '/' + mongoDBName;

var mongoConnection = null;

// console.log("== Mongo URL:", mongoURL);

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.status(200).render('homePage');
});

app.get('/people', function (req, res) {

  var peopleDataCollection = mongoConnection.collection('peopleData');
  peopleDataCollection.find({}).toArray(function (err, results) {
    if (err) {
      res.status(500).send("Error fetching people from DB");
    } else {
      console.log("== query results:", results);
      res.status(200).render('peoplePage', {
        people: results
      });
    }
  });
});

app.get('/people/:personId', function(req, res, next) {
  var peopleDataCollection = mongoConnection.collection('peopleData');

  peopleDataCollection.find({ personId: req.params.personId }).toArray(function (err, results) {
    if (err) {
      res.status(500).send("Error fetching people from DB");
    } else if (results.length > 0) {
      res.status(200).render('personPage', results[0]);
    } else {
      next();
    }
  });
});

app.use(express.static('public'));

app.get('*', function (req, res) {
  res.status(404).render('404');
});

app.post('/people/:personId/addPhoto', function (req, res, next) {

  if (req.body && req.body.photoURL) {
    var peopleDataCollection = mongoConnection.collection('peopleData');
    var photoObj = {
      photoURL: req.body.photoURL,
      caption: req.body.caption
    };

    peopleDataCollection.updateOne(
      { personId: req.params.personId },
      { $push: { photos: photoObj } },
      function (err, result) {
        if (err) {
          res.status(500).send("Error fetching people from DB");
        } else {
          res.status(200).send("Success");
        }
      }
    );

  } else {
    res.status(400).send("Request body needs a `photoURL` field.");
  }

  // var personId = req.params.personId;
  // if (peopleData[personId]) {
  //   if (req.body && req.body.photoURL) {
  //     peopleData[personId].photos.push({
  //       photoURL: req.body.photoURL,
  //       caption: req.body.caption
  //     });
  //     res.status(200).send("Success");
  //   } else {
  //     res.status(400).send("Request body needs a `photoURL` field.");
  //   }
  // } else {
  //   next();
  // }
});

app.post('*', function (req, res) {
  res.status(404).send("POST to unknown path");
});

MongoClient.connect(mongoURL, function (err, connection) {
  if (err) {
    throw err;
  }
  mongoConnection = connection;
  app.listen(port, function () {
    console.log("== Server listening on port:", port);
  });
});
