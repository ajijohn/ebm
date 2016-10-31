var express = require('express');
var router = express.Router();

/* GET microclim page. */
router.get('/',function(req, res, next) {
  res.render('home', { title: 'Energy Balance Modeling' });
});

/* GET api page. */
router.get('/APIs',function(req, res, next) {
  res.render('apis', { title: 'Energy Balance Modeling' });
});


router.get('/signup',function(req, res, next) {
  res.render('signup', { title: 'Energy Balance Modeling' });
});

/* GET microclim page. */
router.get('/microclim',ensureAuthenticated,function(req, res, next) {
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
