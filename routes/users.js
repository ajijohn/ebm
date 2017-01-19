var express = require('express');
const jwt = require('jsonwebtoken');

var router = express.Router();
var corpsec = process.env.API_SEC || "default";

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('no users configured');
});

/* GET apikey. */
router.get('/account/apikey',ensureAuthenticated,function(req, res, next) {

    var apikey= jwt.sign({
        data: req.user.id
    }, corpsec, { expiresIn: '365d' });

    res.status(200).json({
        apikey: apikey
    });
});

/* GET api secrets. */
router.get('/account/apisecret',ensureAuthenticated,function(req, res, next) {

    var apisec= jwt.sign({
        data: req.user.id
    }, corpsec, { expiresIn: '365d' });

    res.status(200).json({
        apisec: apisec
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}
module.exports = router;
