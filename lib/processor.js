/**
 * Created by daniel.joppi on 12/19/14.
 */
var AWS = require('aws-sdk');
var opts = {dynamo: {endpoint: new AWS.Endpoint('http://localhost:8000')}};
var dynodb = require('dynodb-client'),
//var dynodb = require('../../dynodb-client'),
    db = new dynodb(opts, function (err,_db) { err && console.log(err )}),
    util = require('util'),
    helper = require('./helper'),
    filter = require('./filter'),
    logger;

function getCollection(clientReqMsg) {
  var name = clientReqMsg.fullCollectionName;
  return db.collection(name);
}

var that = {
  mocks: null,
  init: function (mocks) {
    logger = require('../lib/log').getLogger();
    that.mocks = mocks;
    filter.init();
  },
  process: function (socket) {
    logger.trace('new socket');
    var processSocketData = function (buf) {
      var header, clientReqMsg;
      header = helper.fromMsgHeaderBuf(buf);
      switch (header.opCode) {
        case helper.OP_QUERY:
          clientReqMsg = helper.fromOpQueryBuf(header, buf);
          if (clientReqMsg.fullCollectionName.match(/\.\$cmd$/)) {
            that.doCmdQuery(socket, clientReqMsg);
          } else {
            that.doQuery(socket, clientReqMsg);
          }
          break;
        case helper.OP_INSERT:
          clientReqMsg = helper.fromOpInsertBuf(header, buf);
          that.doInsert(socket, clientReqMsg);
          break;
        case helper.OP_DELETE:
          clientReqMsg = helper.fromOpDeleteBuf(header, buf);
          that.doDelete(socket, clientReqMsg);
          break;
        case helper.OP_UPDATE:
          clientReqMsg = helper.fromOpUpdateBuf(header, buf);
          that.doUpdate(socket, clientReqMsg);
          break;
        default:
          throw new Error('not supported');
      }
      if (buf.bytesRead < buf.length) {
        processSocketData(buf.slice(buf.bytesRead));
      }
    };
    socket.on('data', processSocketData);
    socket.on('end', function () {
      logger.trace('socket disconnect');
    });
  },
  doCmdQuery: function (socket, clientReqMsg) {
    var reply, replyBuf;
    logger.trace('doCmdQuery');
    if (clientReqMsg.query['ismaster']) {
      reply = {
        documents: { 'ismaster': true, 'ok': true }
      };
      replyBuf = helper.toOpReplyBuf(clientReqMsg, reply);
      socket.write(replyBuf);
    } else if (clientReqMsg.query['getlasterror']) {
      reply = {
        documents: { 'ok': true }
      };
      replyBuf = helper.toOpReplyBuf(clientReqMsg, reply);
      socket.write(replyBuf);
    } else {
      logger.error('clientReqMsg :', clientReqMsg);
      throw new Error('not supported');
    }
  },
  doQuery: function (socket, clientReqMsg) {
    var collection, docs, replyBuf;
    logger.trace('doQuery');
    collection = getCollection(clientReqMsg);
    if (clientReqMsg.query && !helper.isEmpty(clientReqMsg.query)) {
      docs = filter.filterItems(collection, clientReqMsg.query);
    } else {
      docs = collection;
    }
    if (clientReqMsg.returnFieldSelector) {
      docs.forEach(function (document) {
        for (var key in document) {
          if (!clientReqMsg.returnFieldSelector[key]) {
            delete document[key];
          }
        }
      });
    }
    replyBuf = helper.toOpReplyBuf(clientReqMsg, { documents: docs });
    socket.write(replyBuf);
  },
  doInsert: function (socket, clientReqMsg) {
    var collection;
    logger.trace('doInsert');
    collection = getCollection(clientReqMsg);
    clientReqMsg.documents.forEach(function (document) {
      collection.push(document);
    });
  },
  doDelete: function (socket, clientReqMsg) {
    var collection, i, item, key, match;
    logger.trace('doDelete');
    collection = getCollection(clientReqMsg);
    i = 0;
    while (i < collection.length) {
      item = collection[i];
      match = true;
      for (key in clientReqMsg.selector) {
        if (item[key] != clientReqMsg.selector[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        collection.splice(i, 1);
      } else {
        i++;
      }
      /*
       if (item._id && (item._id.toString() === clientReqMsg.selector._id.toString())) {
       logger.trace('removing id ', item._id);
       collection.splice(i, 1);
       } else {
       i++;
       }
       */
    }
  },
  doUpdate: function (socket, clientReqMsg) {
    var collection, docs, updateKey, propKey;
    logger.trace('doUpdate');
    collection = getCollection(clientReqMsg);
    if (clientReqMsg.selector && !helper.isEmpty(clientReqMsg.selector)) {
      docs = filter.filterItems(collection, clientReqMsg.selector);
    } else {
      docs = collection;
    }
    docs.forEach(function (doc) {
      var value;
      for (updateKey in clientReqMsg.update) {
        if (updateKey === '$set') {
          for (propKey in clientReqMsg.update[updateKey]) {
            value = clientReqMsg.update[updateKey][propKey];
            eval(util.format('doc.%s=%s', propKey, typeof value === 'string' ? util.format('"%s"', value) : value));
          }
        } else {
          throw new Error('update value "' + updateKey + '" not supported');
        }
      }
    });
  }
};

module.exports = that;