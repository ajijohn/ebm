var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;


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
router.get('/', function (req, res, next) {
    var db = req.db;
    var requests = db.get('requests');
    requests.find({ email: req.user.email }, {}, function (e, rqsts) {
        res.json(201, rqsts);
    });
});


/* Write to the requests file */
router.post('/', function (req, res, next) {

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


    // If not multiple select
    //var variable = req.body.variable;
    // If  multiple select
    var variable = req.body["variable[]"];

    var latN = req.body.latN;
    var latS = req.body.latS;
    var lonW = req.body.lonW;
    var lonE = req.body.lonE;

    var stdate = req.body.startdate;
    var eddate = req.body.enddate;
    var file = req.body.file;
    var email = req.body.email;
    var dateperformed = req.body.dateperformed;


    var shadelevel = req.body.shadelevel;
    var hod = req.body.hod;
    var interval = req.body.interval;
    var aggregation = req.body.aggregation;

    var sourcetype = req.body.sourcetype;

    if (variable != null && !Array.isArray(variable))
        variable = [variable];

    //latS,latN,lonW,lonE
    var new_request = {
        misc: "",
        email: email,
        status: "OPEN",
        lats: [latS, latN],
        timelogged: dateperformed,
        longs: [lonW, lonE],
        variable: variable,
        text: "",
        shadelevel: shadelevel,
        hod: hod,
        interval: interval,
        aggregation: aggregation,
        enddate: eddate,
        outputformat: file,
        startdate: stdate,
        status_message: "",
        sourcetype: sourcetype
    };

    //Using the {w:1} option ensure you get the error back if the document fails to insert correctly.
    //TODO handle error
    //  const sgMail = require('@sendgrid/mail')
    // const sgMailApiKey = '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'
    // sgMail.setApiKey(sgMailApiKey)

    requests.insert(new_request, { w: 1 }, function (err, request_added) {

        //Request logged
        if (request_added) {
            const childPython = spawn('python',['index1.py']);

            childPython.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            
            childPython.stderr.on(`data`, (data) => {
                console.error(`stderr: ${data}`);
            });

            childPython.on('close', (code) => {
                console.log(`childprocess exited with code ${code}`)
            })
            /*
             sgMail.setApiKey(process.env.SENDGRID_API_KEY)
            const msg = {
                to: 'sapti.s@gmail.com', // Change to your recipient
                from: 'sapti.s@innoneur.com', // Change to your verified sender
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            }
            sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                }) */
            res.json(201, {
                success: 'Request logged',
                request_id: request_added._id.toString()
            });
        }
        else {
            res.json(500, {
                error: 'Request not logged.'
            });

        }

    });





});


module.exports = router;
