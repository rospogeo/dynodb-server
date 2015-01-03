/**
 * Created by daniel.joppi on 12/19/14.
 */
var dynodbServer = require('./lib/dynodb-server');

(function(dynodb) {
    'use strict';

    console.log('Starting DynoDB Server ...');
    var port = 27017;

// Initialize the server
    dynodb.init({
        port: port, // Feel free to match your settings
        mocks: { // The all database is here...
            dynamo: {
                // TODO get list tables
            }
        },
        // Additionnal options
        fork: true         // force the server to run in a separate process (default: false)
        // fork is useful to deal with async hell (client and server in same main-loop)
    });

    dynodb.start(function (err) {

        if (err) {
            console.log('Fail to start DynoDB: ', err);
            dynodb.stop(function (err) {
                console.log('bye!');
            });
        } else {
            console.log('DynoDB has listen on port:' + port);
        }
    });
})(dynodbServer);