const grpc = require("grpc");
const services = require("./grpc/moodle-puppeteer-tg-bot_grpc_pb");
const { getUsername, getPassword } = require("./db");
const waitForSeconds = parseInt(process.env.WAIT_FOR_SECONDS) || 5;
const restartSeconds = parseInt(process.env.RESTART_SECONDS) || 60;
const timeoutSeconds = parseInt(process.env.TIMEOUT_SECONDS) || 10;
const baseUrl = process.env.BASE_URL || "moodle.hku.hk";
const botUrl = process.env.BOT_URL;
const Monitor = require("./monitor");

async function main() {
  let onUpdateCallback = () => {
    console.log("update");
  };
  if (botUrl && botUrl !== "") {
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
  let m = new Monitor({
    username: await getUsername(),
    password: await getPassword(),
    waitFor: waitForSeconds,
    restart: restartSeconds,
    timeout: timeoutSeconds,
    baseUrl
  });
  await m.init();
  await m.startMonitor(onUpdateCallback);
  await m.browser.close();
  console.log("restarting now");
  process.exit(0);
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
