const {delay, isLessonQuiz, getTimeInUnixSeconds} = require("./utils");
const {setStatus, getStatus} = require("./db");
const puppeteer = require("puppeteer");
module.exports = class Monitor {
  constructor(config) {
    this.config = config;
  }

  async init() {
    const {username, password, timeout, baseUrl} = this.config;

    // Set the original status if they does not exists
    if ((await getStatus()).haveQuiz == null) {
      console.log("Reset status db");
      await setStatus(false, 0, [], new Date());
    }
    this.browser = await puppeteer.launch({
      timeout: timeout * 1000,
      // noinspection JSUnresolvedVariable
      headless: process.env.VISUAL_MODE !== "1"
    });
    await delay(1000);
    const loginPage = await this.browser.newPage();

    await loginPage.goto(`http://${baseUrl}`);
    console.log(`Goto ${`http://${baseUrl}`}`);
    await loginPage.waitForSelector("#login-nav-btn");
    await loginPage.click("#login-nav-btn");
    await loginPage.waitForSelector(".loginpanel > div:first-child > a");
    await loginPage.click(".loginpanel > div:first-child > a");

    await loginPage.waitForSelector('input[alt="Log In"]');
    await loginPage.type("#username", username);
    await loginPage.type("#password", password);

    await loginPage.click('input[alt="Log In"]');
    // console.log("hi by fd");
    await loginPage.waitForSelector(
      'a[href="http://moodle.hku.hk/course/view.php?id=66155"]'
    );
    await loginPage.click(
      'a[href="http://moodle.hku.hk/course/view.php?id=66155"]'
    );
    await loginPage.waitForSelector(".course-title");

    this.loginPage = loginPage;
  }

  async checkUpdate(onUpdateCallback) {
    let waiter = this.loginPage.waitForNavigation({
      waitUntil: "networkidle0"
    });
    await this.loginPage.reload();
    await waiter;
    const prevStatus = await getStatus();
    const quizItems = await this.loginPage.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          ".quiz.modtype_quiz > div > div > div:last-child > div.activityinstance > a > span.instancename"
        )
      )
        .map(e => e.innerText)
        .map(s => s.split("\n")[0])
    );
    const quizCount = quizItems.length;
    const haveQuiz = quizItems.find(isLessonQuiz) !== undefined;
    await setStatus(haveQuiz, quizCount, quizItems, new Date());
    if (haveQuiz !== prevStatus.haveQuiz) {
      onUpdateCallback();
    }
    console.log("checked update")
  }

  async startMonitor(onUpdateCallBack) {
    const {waitFor, restart} = this.config;
    const startTime = getTimeInUnixSeconds();
    while (startTime + restart > getTimeInUnixSeconds()) {
      await this.checkUpdate(onUpdateCallBack);
      await delay(waitFor * 1000);
    }
  }
};
