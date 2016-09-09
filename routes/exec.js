var express = require('express');
var router = express.Router();
const
    spawn = require( 'child_process' ).spawn;


/* GET home page. */
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

module.exports = router;
