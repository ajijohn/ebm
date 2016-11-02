var express = require('express');
var router = express.Router();

/* GET microclim page. */
router.get('/',function(req, res, next) {
  res.render('home', { title: 'home'});
});

/* GET api page. */
router.get('/APIs',function(req, res, next) {
  res.render('apis', { title: 'APIs' });
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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
module.exports = router;
