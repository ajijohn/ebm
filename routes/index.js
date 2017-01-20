var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');



var corpsec = process.env.API_SEC || "default";
const authenticate = expressJwt({secret : corpsec});


/* GET microclim page. */
router.get('/',function(req, res, next) {
  res.render('home', { title: 'home'});
});

/* GET api page. */
router.get('/APIs',function(req, res, next) {
  res.render('apis', { title: 'APIs' });
});

/* GET account page. */
router.get('/account',function(req, res, next) {
    res.render('accounts', { title: 'Profile' });
});


router.get('/signup',function(req, res, next) {
  res.render('signup', { title: 'signup' });
});

/**
 * POST /signup
 * Create a new local account.
 */
router.post('/signup', function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = {
    email: req.body.email,
    password: req.body.password
  };

  var db = req.db;
  var User = db.collection('User');

  var query = { 'email' : user.email};

  User.findOne(query, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }

    User.save(user, {w:1}, function(err, result) {

      if (err) { return next(err); }
      req.logIn(user, function(err)  {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });

    });


});
});

/* GET microclim page. */
router.get('/microclim',ensureAuthenticated,function(req, res, next) {
  res.render('index', { title: 'microclim' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {res.render('login', { title: 'login' });
});

/* Sample Request which is secured */
router.get('/ply', authenticate, function(req, res) {
    res.status(200).json(req.user);
});

router.post('/auth', serialize, generateToken, function(req, res, next) {

    res.status(200).json({
        user: req.user,
        token: req.token
    });

});

function serialize(req, res, next) {
    var db = req.db;
    var users = db.get('users');

    ldb.validateAPICall(users, req.body.apikey,req.body.apisecret, function(err, user){
        if(err) {return next(err);}
        // we store the updated information in req.user again
        req.user = {
            id: user.user.id
        };
        next();
    });
}

const ldb = {
    validateAPICall: function(users, apikey,apisecret, cb){
        // TODO find the user for the passed apikey and apisec


        users.findOne({'apisecret':apisecret,'apikey':apikey}).then(function(user){


            if (user == null){
                // no user with that key or secret
                // TODO, fix the feedback
                var err = new Error();
                err.status = 401;
                err.message= "Authentication error";

                cb(err,null);
            }
            else
            {
                cb(null, user);
            }


        });


        //cb(null, user);
    }
};


function generateToken(req, res, next) {
    req.token = jwt.sign({
        id: req.user.id,
    }, corpsec, {
        expiresIn: '2h'
    });
    next();
}


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
module.exports = router;
