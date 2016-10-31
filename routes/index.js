var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',ensureAuthenticated,function(req, res, next) {
  res.render('index', { title: 'Energy Balance Modeling' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {res.render('login', { title: 'Energy Balance Modeling' });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
module.exports = router;
