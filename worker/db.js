const redis = require("redis");
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// noinspection JSUnresolvedVariable
const credentialDbHost = process.env.CREDENTIAL_DB_HOST || "ssdb-credential";
// noinspection JSUnresolvedVariable
const statusDbHost = process.env.status_DB_HOST || "ssdb-status";
// noinspection JSUnresolvedVariable
const credentialDbPort = process.env.CREDENTIAL_DB_PORT || "8888";
// noinspection JSUnresolvedVariable
const statusDbPort = process.env.status_DB_PORT || "8888";

const credentialClient = redis.createClient(credentialDbHost, credentialDbPort);
const credentialGetAsync = promisify(credentialClient.get).bind(
  credentialClient
);
const crenentialSetAsync = promisify(credentialClient.set).bind(
  credentialClient
);

const statusClient = redis.createClient(statusDbHost, statusDbPort);
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
    haveQuiz: await statusGetAsync("haveQuiz"),
    quizCount: await statusGetAsync("quizCount"),
    quizItems: JSON.parse(await statusGetAsync("quizItems")),
    lastUpdate: new Date(JSON.parse(await statusGetAsync("lastUpdate")))
  };
}

async function resetStatusHaveQuiz() {
  await statusSetAsync("haveQuiz", false);
}

module.exports = { getUsername, getPassword, setStatus, getStatus };
