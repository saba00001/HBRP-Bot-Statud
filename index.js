const { Client, GatewayIntentBits, ActivityType, Partials, EmbedBuilder } = require('discord.js');
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

// შეცვალეთ ეს თქვენი Discord user ID-ით
const yourUserId = '1327435040732352601'; // აქ ჩასვით თქვენი ID

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

// ფერების სია კომანდისთვის
const validColors = {
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#00FF00',
  'yellow': '#FFFF00',
  'purple': '#800080',
  'orange': '#FFA500',
  'black': '#000000',
  'white': '#FFFFFF',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF'
};

// ფუნქცია, რომელიც ამოწმებს არის თუ არა ჩანაწერი HEX ფერის კოდი
function isValidHexColor(color) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // შეამოწმეთ მომხმარებლის უფლებები
  const isAuthorized = message.author.id === yourUserId;
  
  // !say კომანდა - ჩვეულებრივი ტექსტის გასაგზავნად
  if (message.content.startsWith('!say')) {
    if (!isAuthorized) {
      return message.reply("❌ ამ ბრძანების გამოყენება არ შეგიძლია.");
    }
    
    // მთელი შინაარსის აღება !say-ს გარეშე
    const args = message.content.slice(4).trim();
    if (!args) return message.reply("⚠️ გთხოვ, მიუთითე ტექსტი.");
    
    // შეამოწმეთ ხომ არ არის არხი მითითებული
    const channelMention = message.mentions.channels.first();
    
    if (channelMention) {
      // გამოალევინეთ არხის მითითება ტექსტიდან
      const text = args.replace(/<#\d+>/, '').trim();
      if (!text) return message.reply("⚠️ გთხოვ, მიუთითე ტექსტი.");
      
      // გაგზავნეთ ტექსტი მითითებულ არხში
      channelMention.send(text);
    } else {
      // გაგზავნეთ ტექსტი იმავე არხში
      message.channel.send(args);
    }
    
    // წაშალეთ თავდაპირველი ბრძანება
    message.delete().catch(() => {});
  }
  
  // !embed კომანდა - ფერადი გვერდით ზოლიანი შეტყობინების გასაგზავნად
  if (message.content.startsWith('!embed')) {
    if (!isAuthorized) {
      return message.reply("❌ ამ ბრძანების გამოყენება არ შეგიძლია.");
    }
    
    // გამოყავით ფერი და ტექსტი ბრძანებიდან
    // ფორმატი: !embed red ტექსტი აქ
    // ან: !embed #FF0000 ტექსტი აქ
    const fullCommand = message.content.slice(7).trim();
    const firstSpace = fullCommand.indexOf(' ');
    
    if (firstSpace === -1) {
      return message.reply("⚠️ გთხოვ, მიუთითე ფერი და ტექსტი, მაგ: `!embed red გამარჯობა` ან `!embed #FF0000 გამარჯობა`");
    }
    
    const colorInput = fullCommand.slice(0, firstSpace).toLowerCase();
    let text = fullCommand.slice(firstSpace + 1).trim();
    
    // მოძებნეთ ხომ არ არის არხი მითითებული
    const channelRegex = /<#(\d+)>/;
    const channelMatch = text.match(channelRegex);
    let targetChannel = message.channel;
    
    if (channelMatch) {
      const channelId = channelMatch[1];
      targetChannel = client.channels.cache.get(channelId);
      text = text.replace(channelRegex, '').trim();
      
      if (!targetChannel) {
        return message.reply("⚠️ მითითებული არხი ვერ მოიძებნა.");
      }
    }
    
    // შეამოწმეთ ფერის სისწორე
    let embedColor;
    
    if (isValidHexColor(colorInput)) {
      // თუ პირდაპირ HEX კოდია მითითებული (#FF0000)
      embedColor = colorInput;
    } else if (validColors[colorInput]) {
      // თუ წინასწარ განსაზღვრული ფერის სახელია (red, blue, etc.)
      embedColor = validColors[colorInput];
    } else {
      return message.reply(`⚠️ არასწორი ფერი. შეგიძლიათ გამოიყენოთ HEX კოდი (მაგ: #FF0000) ან შემდეგი ფერები: ${Object.keys(validColors).join(', ')}`);
    }
    
    if (!text) {
      return message.reply("⚠️ გთხოვ, მიუთითე ტექსტი.");
    }
    
    // შექმენით embed შეტყობინება ფერადი ზოლით
    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor(embedColor);
    
    // გაგზავნეთ embed
    targetChannel.send({ embeds: [embed] });
    
    // წაშალეთ თავდაპირველი ბრძანება
    message.delete().catch(() => {});
  }
});

login();
