/**
 * Created by Aji John on 1/23/17.
 * Core authentication routines
 */
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

var corpsec = process.env.API_SEC || "default";
const authenticate = expressJwt({secret : corpsec, algorithms: ['RS256']});

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


module.exports = router;
