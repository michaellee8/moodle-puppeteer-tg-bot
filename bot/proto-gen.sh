#!/usr/bin/env bash
protoc \
--go_out=plugins=grpc:./pb/ \
--proto_path=../ \
../moodle-puppeteer-tg-bot.proto