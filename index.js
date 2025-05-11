const { Client, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

const statusMessages = ["🤖 Hi, I am Horizon Beyond Role Play Official Bot."];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
    process.exit(1);
  }
}

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Custom }],
    status: currentType,
  });
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

// როლი, რომელიც შეიძლება გამოიყენოს !say-ს
const allowedRoleId = '1327435040732352601'; // შეცვალეთ როლის ID

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!say')) {
    // ეჭვიანობის შემოწმება როლზე
    const hasRole = message.member?.roles.cache.has(allowedRoleId);
    if (!hasRole) {
      return message.reply("❌ ამ ბრძანების გამოყენება არ შეგიძლია.");
    }

    const args = message.content.slice(4).trim();
    if (!args) return message.reply("⚠️ გთხოვ, მიუთითე ტექსტი.");

    // სენსორული კოდი, რათა მოვიძიოთ არხი (თუ არსებობს)
    const channelMention = message.mentions.channels.first();

    if (channelMention) {
      // არხის მინიშნებული ტექსტის გაწმენდა
      const text = args.replace(channelMention.toString(), '').trim();
      if (!text) return message.reply("⚠️ გთხოვ, მიუთითე ტექსტი.");
      channelMention.send(text); // არხში გაგზავნა
    } else {
      // თუ არხი არ არის მინიშნებული, გაგზავნა იმ არხში, სადაც ბრძანება შეიქმნა
      message.channel.send(args); 
    }

    // თავდაპირველი მესიჯის წაშლა
    message.delete().catch(() => {});
  }
});

login();
