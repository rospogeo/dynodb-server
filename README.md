DynoDB
=======

  DynoDB using MongoDB server interface for insert data in DynamoDB.

## Installation

    $ git clone https://github.com/rospogeo/dynodb.git
    $ node index.js

    or

    $ sudo npm install dynodb --save
    $ var dyno = require('dynodb')
    $ dyno.start()

## Limitations

Supported operations : all queries, update, remove, insert

Only a few mongodb operators are supported by the moment (gt, gte, lt, gte, ne).

Enjoy !

