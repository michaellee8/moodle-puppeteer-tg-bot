// GENERATED CODE -- DO NOT EDIT!

"use strict";
var grpc = require("grpc");
var google_protobuf_empty_pb = require("google-protobuf/google/protobuf/empty_pb.js");

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error("Expected argument of type google.protobuf.Empty");
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

var BotService = (exports.BotService = {
  onStatusUpdate: {
    path: "/Bot/onStatusUpdate",
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty
  }
});

exports.BotClient = grpc.makeGenericClientConstructor(BotService);
var WorkerService = (exports.WorkerService = {
  resetStatus: {
    path: "/Worker/resetStatus",
    requestStream: false,
    responseStream: false,
    requestType: google_protobuf_empty_pb.Empty,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_google_protobuf_Empty,
    requestDeserialize: deserialize_google_protobuf_Empty,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty
  }
});

exports.WorkerClient = grpc.makeGenericClientConstructor(WorkerService);
