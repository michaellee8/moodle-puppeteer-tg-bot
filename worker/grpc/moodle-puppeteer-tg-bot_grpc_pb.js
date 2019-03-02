// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var moodle$puppeteer$tg$bot_pb = require('./moodle-puppeteer-tg-bot_pb.js');

function serialize_Empty(arg) {
  if (!(arg instanceof moodle$puppeteer$tg$bot_pb.Empty)) {
    throw new Error('Expected argument of type Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Empty(buffer_arg) {
  return moodle$puppeteer$tg$bot_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


var BotService = exports.BotService = {
  onStatusUpdate: {
    path: '/Bot/onStatusUpdate',
    requestStream: false,
    responseStream: false,
    requestType: moodle$puppeteer$tg$bot_pb.Empty,
    responseType: moodle$puppeteer$tg$bot_pb.Empty,
    requestSerialize: serialize_Empty,
    requestDeserialize: deserialize_Empty,
    responseSerialize: serialize_Empty,
    responseDeserialize: deserialize_Empty,
  },
};

exports.BotClient = grpc.makeGenericClientConstructor(BotService);
var WorkerService = exports.WorkerService = {
  resetStatus: {
    path: '/Worker/resetStatus',
    requestStream: false,
    responseStream: false,
    requestType: moodle$puppeteer$tg$bot_pb.Empty,
    responseType: moodle$puppeteer$tg$bot_pb.Empty,
    requestSerialize: serialize_Empty,
    requestDeserialize: deserialize_Empty,
    responseSerialize: serialize_Empty,
    responseDeserialize: deserialize_Empty,
  },
};

exports.WorkerClient = grpc.makeGenericClientConstructor(WorkerService);
