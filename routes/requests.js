var express = require('express');
var router = express.Router();
const spawn = require( 'child_process' ).spawn;


/* Test */
/*
router.get('/', function(req, res, next) {

    var child = spawn('ls', [ '-lh', '/usr' ] );

    child.stdout.on('data', function(chunk) {
        // output will be here in chunks
        process.stdout.write(chunk + '\n');
    });

    child.stderr.on('data', function(chunk) {
        // output will be here in chunks
        process.stdout.write(chunk + '\n');
    });

    res.render('new', { title: 'Express' });
});
*/

/* GET All Requests. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var requests = db.get('requests');
    requests.find({},{},function(e,rqsts){
        res.json(201, rqsts);
    });
});


/* Write to the requests file */
router.post('/', function(req, res, next) {

    var db = req.db;
    var requests = db.get('requests');

    /*

     misc:
     email:a.j@xyz.com
     status:EMAILED
     aggregationmetric:
     lats:Array[3]
     timelogged:
     longs:Array[3]
     variable:Array[1]
     interval:
     text:Request for extract
     enddate:19810102
     outputformat:csv
     startdate:19810102

     */


    var variable = req.body.variable;
    var latN = req.body.latN;
    var latS = req.body.latS;
    var lonW = req.body.lonW;
    var lonE = req.body.lonE;


    var stdate = req.body.startdate;
    var eddate = req.body.enddate;
    var file = req.body.file;
    var email = req.body.email;
    var dateperformed = req.body.dateperformed;

    //latS,latN,lonW,lonE
    var new_request = {  misc:"",
                         email:email,
                         status:"OPEN",
                         aggregationmetric:"",
                         lats:[latS,latN],
                         timelogged:dateperformed,
                          longs:[lonW,lonE],
                         variable:[variable],
                         interval:"",
                          text:"",
                          enddate:eddate,
                          outputformat:file,
                          startdate:stdate};

    //Using the {w:1} option ensure you get the error back if the document fails to insert correctly.
    requests.insert(new_request, {w:1}, function(err, result) {});

    res.json(201, {
        success: 'Request logged'
    });


});


module.exports = router;
