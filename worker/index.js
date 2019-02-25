const grpc = require("grpc");
const services = require("./grpc/moodle-puppeteer-tg-bot_grpc_pb");
const messages = require("./grpc/moodle-puppeteer-tg-bot_pb");
const waitForSeconds = parseInt(process.env.WAIT_FOR_SECONDS) || 5;
const restartSeconds = parseInt(process.env.RESTART_SECONDS) || 60;
const timeoutSeconds = parseInt(process.env.TIMEOUT_SECONDS) || 10;
const baseUrl = process.env.BASE_URL || "moodle.hku.hk";
