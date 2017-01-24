var express = require('express');
var router = express.Router();

const expressJwt = require('express-jwt');

var corpsec = process.env.API_SEC || "default";
const authenticate = expressJwt({secret : corpsec});


//Get list of avaliable services
router.get('/apis', authenticate, function(req, res) {
    var services ={
       "services": [
            {
                "service_id":"query_microclim",
                "service_brief":"Puts in a new microclim request.",
                "service_endpoint":"PUT /microclim/"
            },
            {
                "service_id":"retrieve_microclim",
                "service_brief":"Get details of a microclim request.",
                "service_endpoint":"GET(or POST) /microclim"
            },
           {
               "service_id":"list_apis",
               "service_brief":"Lists avaliable API endpoints.",
               "service_endpoint":"GET /apis"
           }
            ]

    };

    res.status(200).json(services);
});


/* Request a microclim extraction */
router.get('/request', authenticate, function(req, res) {
    res.status(200).json(req.user);
});

module.exports = router;