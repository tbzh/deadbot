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
const message = process.env.TRIGGER_MESSAGE;
const devAccount = process.env.DEV_USERNAME;

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
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const lastMsg = await client.getMessages(targetBot, { limit: 1 });
  
    if (sentMsg.id < lastMsg[0].id) {
      console.log("Bot is working fine!");
    } else {
      console.log("Bot is not working!");
      // send message to owner
      await client.sendMessage(devAccount, { message: "Bot is not working!" });
    }
  }
  
  // run check every 1 minute
  setInterval(check, 1 * 60 * 1000);
})();
