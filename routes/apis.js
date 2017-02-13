var express = require('express');
var router = express.Router();
var _ = require('underscore');

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
                "service_endpoint":"POST /microclim/request"
            },
            {
                "service_id":"status_microclim",
                "service_brief":"Get details of a microclim request.",
                "service_endpoint":"GET(or POST) /microclim/status"
            },
           {
               "service_id":"retrieve_microclim",
               "service_brief":"Get details of a microclim request including the generated files.",
               "service_endpoint":"GET(or POST) /microclim/fetch"
           },
           {
               "service_id":"list_apis",
               "service_brief":"Lists avaliable API endpoints.",
               "service_endpoint":"GET /microclim/apis"
           },
           {
               "service_id":"retrieve_microclim_requests",
               "service_brief":"Retrieve all requests.",
               "service_endpoint":"GET /microclim/requests"
           },
           {
               "service_id":"retrieve_microclim_health",
               "service_brief":"Retrieve the health of the API.",
               "service_endpoint":"GET /microclim/poke"
           },
           {
               "service_id":"retrieve_microclim_file",
               "service_brief":"Retrieve the generated file.",
               "service_endpoint":"GET /microclim/download"
           }
            ]

    };

    res.status(200).json(services);
});


/**
 * @api {get} /microclim/request Request Microclim Extraction
 * @apiName query_microclim
 * @apiGroup Microclim APIs
 *
 * @apiParam {String} variable Microclimate Variable.
 * @apiParam {Number} latN Bounding box Lat N.
 * @apiParam {Number} latS Bounding box Lat S.
 * @apiParam {Number} lonW Bounding box Lat W.
 * @apiParam {Number} lonE Bounding box Lat E
 * @apiParam {String} startdate  - YYYYMMDDHH where YYYY is year, MM is month, DD is day, and HH is hour.
 * @apiParam {String} enddate -  YYYYMMDDHH where YYYY is year, MM is month, DD is day, and HH is hour.

 * @apiParam {String} file Output type (CSV or netCDF)
 * @apiParam {String} shadelevel percentage shade
 * @apiParam {String} hod height in meters; above or below the surface
 * @apiParam {String} interval time interval
 * @apiParam {String} aggregation aggregation metric

 * @apiSuccess {String} Request Id (aka handle) of the submitted request
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "request_id": "58740a47aec8ba86d36f37d0",
 *     }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Extraction request failure."
 *     }
 *
 */
router.all('/request', authenticate, function(req, res) {
    //find the user's email
    //res.status(200).json(req.user);
    //TODO - Don't support HTTP method Delete or PUT

    var db = req.db;
    var users = db.get('users');
    var requests = db.get('requests');

    var d = new Date();
    var dateperformed = d.toString();

    //latS,latN,lonW,lonE
    var api_request = {  misc:"",
        email:"",
        status:"OPEN",
        lats:[req.body.latS,req.body.latN],
        timelogged:dateperformed,
        longs:[req.body.lonW,req.body.lonE],
        variable:[req.body.variable],
        text:"",
        shadelevel:req.body.shadelevel,
        hod:req.body.hod,
        interval:req.body.interval,
        aggregation:req.body.aggregation,
        enddate:req.body.eddate,
        outputformat:req.body.file,
        startdate:req.body.stdate};


    users.findOne({'user.id':req.user.id}).then(function(user){


    api_request.email = user.user.email;

    //Using the {w:1} option ensure you get the error back if the document fails to insert correctly.
    //TODO handle error
    requests.insert(api_request, {w:1}, function(err, request_added) {

        //Request logged
        if(request_added)
        {
            res.json(201, {
                success: 'Request logged',
                request_id: request_added._id.toString()
            });
        }
        else
        {
            res.json(500, {
                error: 'Request not logged.'
            });

        }

    });


    });

});

/**
 * @api {get} /microclim/status Request Microclim Extraction
 * @apiName status_microclim
 * @apiGroup Microclim APIs
 *
 * @apiParam {String} id Extraction Request ID.
 *
 * @apiSuccess {String} 'EMAILED' - Request completed successfully
 * @apiSuccess {String} 'OPEN' - Request created but not picked up yet
 * @apiSuccess {String} 'ERROR'  - Request errored
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       {"status":"EMAILED",
 *       }
 *     }
 *
 * @apiError RequestNotFound The Request id was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "RequestNotFound"
 *     }
 *
 */
router.get('/status', authenticate, function(req, res) {
    requestId= req.query.requestId
    //Request by
    console.log(req.user);

    var db = req.db;
    var requests = db.get('requests')

    //Pull the details of the request
    //
    requests.findOne({_id:requestId}).then(function(request){

            //Request fetched
            if(request)
            {
                res.json(200, {
                    status: request.status
                });
            }
            else
            {
                res.json(404, {
                    error: 'RequestNotFound.'
                });

            }

    });


});

/**
 * @api {get} /microclim/fetch Extract Microclim Request Artifacts
 * @apiName retrieve_microclim
 * @apiGroup Microclim APIs
 *
 * @apiParam {String} id Extraction Request ID.
 *
 * @apiSuccess {String} Link to the extracted files and Request metadata
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "files" :[],
 *        "request":{"_id":"589ce9a4b2df447c910f7d59",
 *                  "aggregation":"0",
 *                  "email":"huckleylab@gmail.com",
 *                  "enddate":"19810131",
 *                  "hod":"0",
 *                  "interval":"0",
 *                  "lats":["39.431950321168635",
 *                  "40.451127265872316"],
 *                  "longs":["-108.08349609375",
 *                  "-106.5399169921875"],
 *                  "misc":"",
 *                  "outputformat":"csv",
 *                  "shadelevel":"0",
 *                  "startdate":"19810101",
 *                  "status":"EMAILED",
 *                  "text":"",
 *                  "timelogged":"02/09/2017 22:10:29 +00:00",
 *                  "variable":["ALBEDO"]
 *                  }

 *     }
 *
 * @apiError RequestNotFound The extraction request was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "RequestNotFound"
 *     }
 */
router.get('/fetch', authenticate, function(req, res) {
    console.log(req.user);
    requestId= req.query.requestId


    var db = req.db;
    var users = db.get('users');
    var requests = db.get('requests')
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();

    var params = {
        Bucket: 'microclim/'
    };
    s3.listObjects(params, function(err, data) {

        if (err) {
            console.log(err, err.stack); // an error occurred
            res.json(404, {
                error: 'RequestNotFound.'
            });


        }
        else {
            console.log(data);           // successful response
            var mkeys = _.filter(data.Contents, function(keyEntry){
                return keyEntry.Key.indexOf(requestId) !== -1;
            });

            res.json(200, {
                files: mkeys
            });
        }
    });

    //Pull the details of the request
    //TODO Get the corresponding request and add it to the json
    /*
    requests.findOne({_id:requestId}).then(function(request){

        //Request fetched
        if(request)
        {
            res.json(200, {
                request: request
            });
        }
        else
        {
            res.json(404, {
                error: 'RequestNotFound.'
            });

        }

    });*/

});

/**
 * @api {get} /microclim/download Download Microclim Generated Artifact
 * @apiName retrieve_microclim_file
 * @apiGroup Microclim APIs
 *
 * @apiParam {String} fileKey Extraction Request ID.
 *
 * @apiSuccess {String} Artifact streamed
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "files" :[],
 *     }
 *
 * @apiError RequestNotFound The extraction request was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "RequestNotFound"
 *     }
 */
router.get('/download', authenticate, function(req, res) {
    console.log(req.user);
    requestId= req.query.requestId
    requestfileKey= req.query.fileKey


    var db = req.db;
    var users = db.get('users');
    var requests = db.get('requests')
    var AWS = require('aws-sdk');
    var fs = require('fs');
    var s3 = new AWS.S3();

    var params = {
              Bucket: '/microclim'
    };

    //Form the whole path

    if(requestfileKey)
         params.Key =  requestId + '/' +  requestfileKey;

    try
    {
          res.attachment(requestfileKey);
          var fileStream = s3.getObject(params).createReadStream();
          fileStream.pipe(res);
    }
    catch (e) {
         // TODO statements to handle any exceptions
             //logMyErrors(e);
              res.json(500, {
               error: 'RequestsNotReturned'
           });
     }





});
/**
 * @api {get} /microclim/poke Get health check of the service
 * @apiName retrieve_microclim_health
 * @apiGroup Microclim APIs
 *
 * @apiParam None
 *
 * @apiSuccess {String} Json encompassing health
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "service":"online"
 *     }
 *
 * @apiError Internal Server Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *     }
 */
router.get('/poke', authenticate, function(req, res) {
    //Request by
    console.log(req.user);
    res.status(200).json({"service":"online"});
});

/**
 * @api {get} /microclim/requests Get requests of the current user
 * @apiName retrieve_microclim_requests
 * @apiGroup Microclim APIs
 *
 * @apiParam None
 *
 * @apiSuccess {String} Json encompassing requests
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         requests:[{...},{...}]
 *     }
 *
 * @apiError RequestNotFound The extraction request was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Not Found
 *     {
 *       "error": "RequestsNotReturned"
 *     }
 */
router.get('/requests', authenticate, function(req, res) {
    console.log(req.user);

    var db = req.db;
    var users = db.get('users');
    var requests = db.get('requests');

    users.findOne({'user.id':req.user.id}).then(function(user){


        api_request.email = user.user.email;

        try {

                // Get a cursor of all the requests for the user
                var cursor = requests.find({'email':user.user.email});

                // Populate the requests
                var requests = [];

               // Iterate over the requests cursor
                while(cursor.hasNext()) {
                        requests.push(cursor.next());
                }

            res.json(200, {
                 requests: requests
            });

        }
        catch (e) {
            // TODO statements to handle any exceptions
            //logMyErrors(e);
            res.json(500, {
                error: 'RequestsNotReturned'
            });
        }

    });

});


module.exports = router;