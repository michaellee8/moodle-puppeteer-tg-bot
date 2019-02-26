#!/usr/bin/env bash
grpc_tools_node_protoc \
--js_out=import_style=commonjs,binary:./grpc/ \
--ts_out=./grpc/ \
--grpc_out=./grpc/ \
--plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
--plugin="protoc-gen-ts=`which protoc-gen-ts`" \
--proto_path=../ \
../moodle-puppeteer-tg-bot.proto