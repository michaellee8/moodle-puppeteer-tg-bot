const grpc = require("grpc");
const services = require("./grpc/moodle-puppeteer-tg-bot_grpc_pb");
const messages = require("./grpc/moodle-puppeteer-tg-bot_pb");
const waitForSeconds = parseInt(process.env.WAIT_FOR_SECONDS) || 5;
const restartSeconds = parseInt(process.env.RESTART_SECONDS) || 60;
const timeoutSeconds = parseInt(process.env.TIMEOUT_SECONDS) || 10;
const baseUrl = process.env.BASE_URL || "moodle.hku.hk";
const botUrl = process.env.BOT_URL;

async function main() {
  let onUpdateCallback = () => {
    console.log("update");
  };
  if (botUrl) {
    const botClient = new services.BotClient(
      botUrl,
      grpc.credentials.createInsecure()
    );
    const onUpdateRecived = () => {
      console.log("update received");
    };
    onUpdateCallback = () => {
      return botClient.onStatusUpdate({}, onUpdateRecived);
    };
  }
}

main()
  .then(() => {
    console.log("restarting now");
    process.exit(0);
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
