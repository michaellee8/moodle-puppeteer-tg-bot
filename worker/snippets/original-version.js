const puppeteer = require("puppeteer");
// const path = require("path");
const notifier = require("node-notifier");
const BASE_URL = "moodle.hku.hk";
const keytar = require("keytar");
const prompt = require("password-prompt");
const storage = require("node-persist");
// const notifier = require("node-notifier");
const waitForSeconds = parseInt(process.env.WAIT_FOR_SECONDS) || 5;
const restartSeconds = parseInt(process.env.RESTART_SECONDS) || 60;
const timeoutSeconds = parseInt(process.env.TIMEOUT_SECONDS) || 10;
const tgToken = process.env.TELEGRAM_BOT_TOKEN;
let timeoutErrorCount = 0;
let showedNotification = false;

var statusStorage;
var usersStorage;
var authStorage;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

var sendMsg = async () => {};

// console.log(waitForSeconds, restartSeconds);
const alert =
  "...........       \r\n  .        ..`      \r\n  . `````````.`    ,\r\n  . ````````.`.`  , \r\n  . ````````.``,`:  \r\n  . ````````` ``;;  \r\n  . ```````. ``;;,  \r\n  .````````,..;;.,, \r\n  .``````````;:;``. \r\n  ,`````````;:;```, \r\n  ,````````;:;````, \r\n  ;;``````;:::````, \r\n '::'````'::'`````, \r\n ':;:'``'::'``````, \r\n  ':;:'':;;:``````, \r\n  ,':;;:;:'```````, \r\n  ,`';;;;'````````, \r\n  ,``';;;:````````, \r\n  ,```';'`````````, \r\n  ,....'.........., \r\n";
const main = async () => {
  try {
    statusStorage = storage.create({
      dir: "stoarage/moodle-pupeteer-scripts-persist/status"
    });
    usersStorage = storage.create({
      dir: "stoarage/moodle-pupeteer-scripts-persist/users"
    });
    authStorage = storage.create({
      dir: "stoarage/moodle-pupeteer-scripts-persist/auth"
    });

    await statusStorage.init();
    await usersStorage.init();
    await authStorage.init();

    if (process.env.SET_PASSWORD == "true") {
      await authStorage.setItem(
        "username",
        await prompt("Portal username: ", { method: "hide" })
      );
      await authStorage.setItem(
        "password",
        await prompt("Portal password: ", { method: "hide" })
      );
    }
    const HKU_PORTAL_USERNAME = await authStorage.getItem("username");
    const HKU_PORTAL_PASSWORD = await authStorage.getItem("password");

    console.log(`logging in with ${HKU_PORTAL_USERNAME}`);

    function delay(timeout) {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
    }

    await statusStorage.setItem("haveQuiz", false);
    await statusStorage.setItem("quizCount", 0);
    await statusStorage.setItem("quizItems", []);
    await statusStorage.setItem("lastUpdate", Date.now());

    const keypress = async () => {
      process.stdin.setRawMode(true);
      return new Promise(resolve =>
        process.stdin.once("data", data => {
          const byteArray = [...data];
          if (byteArray.length > 0 && byteArray[0] === 3) {
            console.log("^C");
            process.exit(1);
          }
          process.stdin.setRawMode(false);
          resolve();
        })
      );
    };

    function dumpFrameTree(frame, indent) {
      console.log(indent + frame.url());
      for (let child of frame.childFrames())
        dumpFrameTree(child, indent + "  ");
    }

    while (true) {
      const browser = await puppeteer.launch({
        headless: process.env.HEADLESS_MODE == "true",
        timeout: 0
      });
      const loginPage = await browser.newPage();
      let waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      await loginPage.goto(`http://${BASE_URL}`);
      await waiter;
      console.log(`Goto ${`http://${BASE_URL}`}`);
      // await delay(1500);
      // await loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      // await loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      await loginPage.click("#login-nav-btn");
      await waiter;
      // await loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      // await delay(1500);
      waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      await loginPage.click(".loginpanel > div:first-child > a");
      await waiter;
      // await delay(500);
      await loginPage.type("#username", HKU_PORTAL_USERNAME);
      await loginPage.type("#password", HKU_PORTAL_PASSWORD);
      waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      await loginPage.click('input[alt="Log In"]');
      await waiter;
      waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      await waiter;
      waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
      await loginPage.click(
        'a[href="http://moodle.hku.hk/course/view.php?id=66155"]'
      );
      await waiter;
      // await loginPage.waitForNavigation({ waitUntil: "networkidle0" });

      // await loginPage.waitForNavigation({ waitUntil: "domcontentloaded" });
      let count = 0;
      const originalCount = (await loginPage.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            ".quiz.modtype_quiz > div > div > div:last-child > div.activityinstance > a > span.instancename"
          )
        ).map(e => e.innerText)
      )).length;

      while (count < restartSeconds / waitForSeconds) {
        count++;
        // .quiz.modtype_quiz > div > div > div:last-child > div.activityinstance > a > span.instancename
        let quizItems = await loginPage.evaluate(() =>
          Array.from(
            document.querySelectorAll(
              ".quiz.modtype_quiz > div > div > div:last-child > div.activityinstance > a > span.instancename"
            )
          ).map(e => e.innerText)
        );
        console.log("\033c");
        console.log(`Refreshing every ${waitForSeconds}s/${restartSeconds}s`);
        console.log(`iteration ${count}`);
        console.log(`TimeoutError count: ${timeoutErrorCount}`);
        quizItems.forEach(i => console.log(i));
        console.log(`Count: ${quizItems.length}/${originalCount}`);
        if (quizItems.length != originalCount) {
          await statusStorage.setItem("haveQuiz", true);
          await statusStorage.setItem("quizCount", quizItems.length);
          await statusStorage.setItem("quizItems", quizItems);
          await statusStorage.setItem("lastUpdate", Date.now());

          console.log(alert);
        }
        if (quizItems.length == originalCount) {
          await statusStorage.setItem("haveQuiz", false);
          await statusStorage.setItem("quizCount", quizItems.length);
          await statusStorage.setItem("quizItems", quizItems);
          await statusStorage.setItem("lastUpdate", Date.now());
        }
        if (quizItems.length != originalCount && !showedNotification) {
          showedNotification = true;
          await sendMsg();
          notifier.notify({
            title: "New quiz detected",
            message: "moodle.hku.hk"
          });
        }
        if (quizItems.length == originalCount && showedNotification) {
          showedNotification = false;
        }
        await delay(waitForSeconds * 1000);
        waiter = loginPage.waitForNavigation({
          waitUntil: "networkidle0",
          timeout: timeoutSeconds * 1000
        });
        await loginPage.reload();
        await waiter;

        // await loginPage.waitForNavigation({ waitUntil: "networkidle0" });
        // await loginPage.waitForNavigation({ waitUntil: "domcontentloaded" });
      }
      await browser.close();
    }

    // const downloadPage = await browser.newPage();
    // await downloadPage.goto(result[0][0]);
    // const cookies = await downloadPage.evaluate(() => document.cookie);
    // await browser.close();

    // console.log(result.length);
    // result.forEach(([link, name]) => console.log(link, name));
    // console.log(cookies);
  } catch (err) {
    console.error(err);
    if (err.name == "TimeoutError") {
      main();
      timeoutErrorCount++;
    }
  }
};
main();
(async () => {
  if (tgToken) {
    const Telegraf = require("telegraf");
    const bot = new Telegraf(tgToken);
    bot.start(async ctx => {
      console.log("bot /start");
      await ctx.reply(
        "Welcome m8! You suffer so much in 1310? This bot is for you to monitor those freaking quizzes so that u can do something else!"
      );
      const cid = ctx.chat.id.toString();
      const cname = ctx.chat.username;
      if (await usersStorage.getItem(cid)) {
        await ctx.reply(`Oh ${cname} m8, I already have u in my database`);
      } else {
        await usersStorage.setItem(cid, cname);
        await ctx.reply(
          `${cname} m8, you are in my databse now, feel free to wait for my notifications! :D`
        );
      }
    });
    bot.command("status", async ctx => {
      console.log("bot /status");
      let msg = `Have any quiz now? ${await statusStorage.getItem(
        "haveQuiz"
      )}\n`;
      msg += `Last update ${(Date.now() -
        (await statusStorage.getItem("lastUpdate"))) /
        1000} seconds ago\n`;
      msg += `There are ${await statusStorage.getItem("quizCount")} now\n`;
      (await statusStorage.getItem("quizItems")).forEach(q => {
        msg += `${q}\n`;
      });
      ctx.reply(msg);
    });
    sendMsg = async () => {
      console.log("bot boardcast message");
      asyncForEach(
        await usersStorage.keys(),
        async uid =>
          await bot.telegram.sendMessage(
            uid,
            `m8, there are quizzes now!\nhttp://moodle.hku.hk/`
          )
      );
    };
    bot.launch();
    console.log("bot launched");
  }
})();

// const Telegraf = require("telegraf");
