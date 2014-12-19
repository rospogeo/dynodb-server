/**
 * Created by daniel.joppi on 12/19/14.
 */
var mongodb = require('./lib/dynodb-server');

console.log('Starting DynoDB ...');
var port = 27027;

// Initialize the server
mongodb.init({
    port: port, // Feel free to match your settings
    mocks: { // The all database is here...
        dynamo: {
            // TODO get list tables
        }
    },
    // Additionnal options
    fork: true,         // force the server to run in a separate process (default: false)
    // fork is useful to deal with async hell (client and server in same main-loop)
});

mongodb.start(function(err){
    if (err) {
        console.log('Fail to start DynoDB: ', err);
        mongodb.stop(function (err) {
            console.log('bye!');
        });
    } else {
        console.log('DynoDB has listen on port:'+port);
    }
});