var express = require('express');
const jwt = require('jsonwebtoken');
const hat = require('hat');


var router = express.Router();
var corpsec = process.env.API_SEC || "default";

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('no users configured');
});

/* GET apikey. */
router.get('/account/apikey',ensureAuthenticated,function(req, res, next) {

    /*var apikey= jwt.sign({
        data: req.user.id
    }, corpsec, { expiresIn: '365d' }); */

    var apikey=  hat();

    //Update the API Key associated with the user

    var db = req.db;
    var users = db.get('users');

    users.findOne({'user.email':req.user.email}).then(function(user){


        if (user == null){
            // rare case , user not updated, send blank
            // TODO, fix the feedback
            res.status(200).json({
                apikey: ''
            });
        }
        else
        {
            res.status(200).json({
                apikey: user.apikey
            });
        }


    });


});

/* GET api secrets. */
router.get('/account/apisecret',ensureAuthenticated,function(req, res, next) {

    /*var apisec= jwt.sign({
        data: req.user.id
    }, corpsec, { expiresIn: '365d' }); */

    var apisec=  hat();
    var db = req.db;
    var users = db.get('users');

    users.findOne({'user.email':req.user.email}).then(function(user){


        if (user == null){
            // rare case , user not updated, send blank
            // TODO, fix the feedback
            res.status(200).json({
                apisec: ''
            });
        }
        else
        {
            res.status(200).json({
                apisec: user.apisecret
            });
        }


        });


});



/* POST apikey - fetch new api key and update. */
router.post('/account/apikey',ensureAuthenticated,function(req, res, next) {

    /*var apikey= jwt.sign({
     data: req.user.id
     }, corpsec, { expiresIn: '365d' }); */

    var apikey=  hat();

    //Update the API Key associated with the user

    var db = req.db;
    var users = db.get('users');

    users.findAndModify({ query: {'user.email':req.user.email},
        update: { $set: {apikey: apikey }}, new:true}).then(function(user){


        if (user == null){
            // rare case , user not updated, send blank
            // TODO, fix the feedback
            res.status(200).json({
                apikey: ''
            });
        }
        else
        {
            res.status(200).json({
                apikey: apikey
            });
        }


    });


});

/* POST api secret - fetch api secret and update. */
router.post('/account/apisecret',ensureAuthenticated,function(req, res, next) {

    /*var apisec= jwt.sign({
     data: req.user.id
     }, corpsec, { expiresIn: '365d' }); */

    var apisec=  hat();

    var db = req.db;
    var users = db.get('users');

    users.findAndModify({ query: {'user.email':req.user.email},
        update: { $set: {apisecret: apisec }}, new:true}).then(function(user){


        if (user == null){
            // rare case , user not updated, send blank
            // TODO, fix the feedback
            res.status(200).json({
                apisec: ''
            });
        }
        else
        {
            res.status(200).json({
                apisec: apisec
            });
        }


    });


});






function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}
module.exports = router;
