require('dotenv').config();
const readline = require("readline");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = +process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION_STRING); // fill this later with the value from session.save()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const targetBot = process.env.TARGET_BOT_USERNAME;
const devAccount = process.env.DEV_USERNAME;
let message = process.env.TRIGGER_MESSAGE;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your number: ", resolve)
      ),
    password: async () =>
      new Promise((resolve) =>
        rl.question("Please enter your password: ", resolve)
      ),
    phoneCode: async () =>
      new Promise((resolve) =>
        rl.question("Please enter the code you received: ", resolve)
      ),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again

  const check = async () => {
    const sentMsg = await client.sendMessage(targetBot, { message });
    await delay(5000);
    const lastMsg = await client.getMessages(targetBot, { limit: 1 });
  
    if (sentMsg.id < lastMsg[0].id) {
      message = "Bot is working fine!"
      console.log(message);
      await client.sendMessage(devAccount, { message });
    } else {
      message = "Bot is not working!"
      console.log(message);
      await client.sendMessage(devAccount, { message });
    }

    await delay(1 * 60 * 1000);
    check();
  }

  check();
})();
