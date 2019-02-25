const { asyncForEach, dumpFrameTree, delay, isLessonQuiz } = require("./utils");
const { getUsername, getPassword, setStatus, getStatus } = require("./db");
const puppeteer = require("puppeteer");
module.exports = class Monitor {
  constructor(config) {
    this.config = config;
  }

  async init() {
    const {
      username,
      password,
      waitFor,
      restart,
      timeout,
      baseUrl
    } = this.config;

    // Set the original status if they does not exists
    if ((await getStatus()).haveQuiz == null) {
      console.log("Reset status db");
      await setStatus(false, 0, [], new Date());
    }
    this.browser = await puppeteer.launch({ timeout: timeout * 1000 });
    const loginPage = await this.browser.newPage();
    let waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
    await loginPage.goto(`http://${baseUrl}`);
    await waiter;
    console.log(`Goto ${`http://${baseUrl}`}`);
    waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
    await loginPage.click("#login-nav-btn");
    await waiter;
    waiter = loginPage.waitForNavigation({ waitUntil: "networkidle0" });
    await loginPage.click(".loginpanel > div:first-child > a");
    await waiter;
    await loginPage.type("#username", username);
    await loginPage.type("#password", password);
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
  }
};
