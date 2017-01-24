var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var monk = require('monk');
var _ = require('underscore');
var session = require('express-session');
const flash = require('express-flash');
const expressValidator = require('express-validator');

const MongoClient = require('mongodb').MongoClient
var compression = require('compression');
var MongoStore = require('connect-mongo')(session);

// Load Auth Providers variables
var auth = require('./auth.js');

//Authentication
var passport = require( 'passport' ),GoogleStrategy   = require( 'passport-google-oauth20' ).Strategy;



//TODO load the models
var cauth = require('./routes/coreauth');
var apis = require('./routes/apis');
var routes = require('./routes/index');
var users = require('./routes/users');
var requests = require('./routes/requests');

var app = express();

// Backup Connection URL .
var url = 'mongodb://localhost:27017/ebm';

/**
 * Connect to MongoDB.
 */

var db = monk(process.env.MONGODB_URI || process.env.MONGOLAB_URI || url);

function extractProfile (profile) {
    var imageUrl = '';
    if (profile.photos && profile.photos.length) {
        imageUrl = profile.photos[0].value;
    }
    return {
        id: profile.id,
        displayName: profile.displayName,
        image: imageUrl,
        email: profile.emails[0].value
    };
}



// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
      clientID: auth.google.clientID ,
      clientSecret: auth.google.clientSecret ,
      callbackURL: auth.google.callbackURL,
      passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        // Extract the minimal profile information we need from the profile object
        // provided by Google
        done(null, extractProfile(profile));

    }
));

// Passport session setup.
passport.serializeUser(function(user, done) {
    //Store the User
    //Called only when the user is granted the access first time
    ldbs.store(user, function(err, user){
        if(err) {return next(err);}
        // User stored
    });

    done(null, user);
});

//In case of Third Party Login - Google and LinkedIn etc, the obj would be the user object
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

const ldbs = {
    store: function(user, cb){
        // store the user
        var users = db.get('users');

        //Insert only if the user does not exist

        users.find({'user.email':user.email}, {}).then(function (doc) {

        if(doc.length == 0) {
            //TODO Possibly populate the api key and secret for a new user
            users.insert({user: user}, {w: 1}, function (err, object) {
                    if (err) {
                        //TODO - remove when started logging to file
                        console.warn(err.message);  // returns error if no matching object found
                    } else {
                        //TODO - remove when started logging to file
                        console.dir(object);
                    }
                }
            );

            //anything extra which might be needed
        }
        else
        {
            //any operation which might be required if user does exist
            //TODO maybe if the same user uses a separate service still associated with the same email
        }
        // only if the user exists
        });

        cb(null, user);
    }
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(compression());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

// required for passport session
app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,
    resave: true,
    // using store session on MongoDB using express-session + connect
    store: new MongoStore({
        url: url,
        collection: 'sessions'
    })
}));

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});

app.use( passport.initialize());
app.use( passport.session());
app.use(flash());

app.use(function(req, res, next)  {
    res.locals.user = req.user;
next();
});

app.use('/',routes);
app.use('/users', users);
app.use('/requests', requests);
app.use('/microclim', apis);
app.use('/api', cauth);


// GET /auth/google
app.get('/auth/google', passport.authenticate('google', { scope: [
    'email', 'profile']
}));

app.get(
    // OAuth 2 callback url. Use this url to configure your OAuth client in the
    // Google Developers console
    '/auth/google/callback',

    // Finish OAuth 2 flow using Passport.js
    passport.authenticate('google'),

    // Redirect back to the original page, if any
    function (req, res) {
      var redirect = req.session.oauth2return || '/';
      delete req.session.oauth2return;
      res.redirect(redirect);
    }
);


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = app;
