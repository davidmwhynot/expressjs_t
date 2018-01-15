// first, require any other module/file that you want to use in this file
// new (es6) syntax:
// `import app`
// old syntax:
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectID;

var app = express();


/*************************************************************************************************/
/* MIDDLEWARE */

/*
// Some custom middleware to illustrate the concept
// order of this is important... if this were to be located AFTER the route handler, it would NOT work
var logger = function(req, res, next) {
  console.log('Logging...');
  next();
}

app.use(logger);
*/

/* EXPRESS VALIDATOR TODO: update to latest version per documentation on github */
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;
    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));


/* EJS */
// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* BODY PARSER */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

/* STATIC FOLDER */
// set static path
app.use(express.static(path.join(__dirname, 'public')));

/*
// parse some json
var people = [ // dummy data
  {
    name:'Jeff',
    age: 30
  },
  {
    name:'Sarah',
    age: 20
  },
  {
    name:'Bill',
    age: 69
  },
  {
    name:'Don',
    age: 122
  }
]
*/


/*************************************************************************************************/
/* GLOBAL VARIABLES */

app.use(function(req, res, next) {
  res.locals.errors = null;
  next();
});


/*************************************************************************************************/
/* ROUTE HANDLERS */

/*
var users = [ // dummy data
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'johndoe@gmail.com'
  },
  {
    id: 2,
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bobsmith@gmail.com'
  },
  {
    id: 3,
    first_name: 'Jill',
    last_name: 'Jackson',
    email: 'jjackson@gmail.com'
  }
]
*/
app.get('/', function(req, res) { // this is a "route handler" where "/" is the route. generally, you would want to "render a view" in the route handler (put something else on the screen)
  // res.json(people);
  db.users.find(function(err, docs) {
    // docs is an array of all the documents in mycollection
    res.render('index', {
      title: 'Customers',
      users: docs
    });
  });


});

app.post('/users/add', function(req, res) { // here we are "catching" the form submission
  // going to validate the form using express validator (on github)
  // TODO: update to new api of express validator per documentation on github (currently using legacy api, which is apparently not good)

  req.checkBody('first_name', 'First Name is Required').notEmpty();
  req.checkBody('last_name', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    res.render('index', {
      title: 'Customers',
      users: users,
      errors: errors
    });
  } else {
    var newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    }
    db.users.insert(newUser, function(error, result) {
      if(error) {
        console.log(error);
      }
      res.redirect('/');
    });
    console.log('success');
  }


});

app.delete('/users/delete/:id', function(req, res) {
  db.users.remove({_id: ObjectId(req.params.id)}, function(err, result) {
    if(err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

app.listen(8080, function() {
  console.log('\nServer started!\nPort: 3000\n');
});
