const redis = require("redis");
const { promisify } = require("util");

// noinspection JSUnresolvedVariable
const credentialDbHost = process.env.CREDENTIALS_DB_HOST || "ssdb-credentials";
// noinspection JSUnresolvedVariable
const statusDbHost = process.env.STATUS_DB_HOST || "ssdb-status";
// noinspection JSUnresolvedVariable
const credentialDbPort = process.env.CREDENTIALS_DB_PORT || "8888";
// noinspection JSUnresolvedVariable
const statusDbPort = process.env.STATUS_DB_PORT || "8888";

const credentialClient = redis.createClient(credentialDbPort, credentialDbHost);
const credentialGetAsync = promisify(credentialClient.get).bind(
  credentialClient
);
const crenentialSetAsync = promisify(credentialClient.set).bind(
  credentialClient
);

const statusClient = redis.createClient(statusDbPort, statusDbHost);
const statusGetAsync = promisify(statusClient.get).bind(statusClient);
const statusSetAsync = promisify(statusClient.set).bind(statusClient);

async function getUsername() {
  return Buffer.from(await credentialGetAsync("username"), "base64").toString(
    "ascii"
  );
}

async function getPassword() {
  return Buffer.from(await credentialGetAsync("password"), "base64").toString(
    "ascii"
  );
}

async function setStatus(haveQuiz, quizCount, quizItems, lastUpdate) {
  await statusSetAsync("haveQuiz", haveQuiz);
  await statusSetAsync("quizCount", quizCount);
  await statusSetAsync("quizItems", JSON.stringify(quizItems));
  await statusSetAsync("lastUpdate", JSON.stringify(lastUpdate));
}

async function getStatus() {
  return {
    haveQuiz: JSON.parse(await statusGetAsync("haveQuiz")),
    quizCount: await statusGetAsync("quizCount"),
    quizItems: JSON.parse(await statusGetAsync("quizItems")),
    lastUpdate: new Date(JSON.parse(await statusGetAsync("lastUpdate")))
  };
}

async function resetStatusHaveQuiz() {
  await statusSetAsync("haveQuiz", false);
}

module.exports = { getUsername, getPassword, setStatus, getStatus };
