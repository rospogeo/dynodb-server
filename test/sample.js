/**
 * Created by daniel.joppi on 12/19/14.
 */
var mongoose = require('mongoose'),
    dynodbServer = require('../lib/dynodb-server');

(function(dynodb, mongoose) {
    'use strict';

    console.log('Starting DynoDB Server ...');
    var port = 27027;

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

            // Usual mongoose code to define a schema for contact entities
            mongoose.model('Contact', {
                firstName: String,
                lastName: String
            });

            mongoose.connect('mongodb://localhost:27027/fakedb', {server: {poolSize: 1}}, function (err) {
                // Usual mongoose code to retreive all the contacts
                console.log('find model contact');
                var Contact = mongoose.connection.model('Contact');
                console.log('dinf contact');
                Contact.find(function (err, contacts) {
                    //
                    console.log('contacts :', contacts);
                    //
                    mongoose.disconnect(function (err) { // clean death
                        console.log('finish!');
                    });
                });
            });
        }
    });
})(dynodbServer, mongoose);


