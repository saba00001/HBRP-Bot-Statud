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
const yourUserId = '1326983284168720505'; // აქ ჩასვით თქვენი ID

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
    // დაუყოვნებლივ წაშალეთ ბრძანება, სანამ რაიმე სხვა ლოგიკას დავიწყებთ
    try {
      await message.delete();
    } catch (error) {
      console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to delete command message:', error.message);
      // მაინც გააგრძელეთ შესრულება, თუნდაც წაშლა ვერ მოხერხდეს
    }
    
    if (!isAuthorized) {
      return message.author.send("❌ ამ ბრძანების გამოყენება არ შეგიძლია.").catch(() => {});
    }
    
    // მთელი შინაარსის აღება !say-ს გარეშე
    const args = message.content.slice(4).trim();
    if (!args) {
      return message.author.send("⚠️ გთხოვ, მიუთითე ტექსტი.").catch(() => {});
    }
    
    // შეამოწმეთ ხომ არ არის არხი მითითებული
    const channelMention = message.mentions.channels.first();
    
    try {
      if (channelMention) {
        // გამოალევინეთ არხის მითითება ტექსტიდან
        const text = args.replace(/<#\d+>/, '').trim();
        if (!text) {
          return message.author.send("⚠️ გთხოვ, მიუთითე ტექსტი.").catch(() => {});
        }
        
        // გაგზავნეთ ტექსტი მითითებულ არხში
        await channelMention.send(text);
      } else {
        // გაგზავნეთ ტექსტი იმავე არხში
        await message.channel.send(args);
      }
    } catch (error) {
      console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Error in !say command:', error.message);
      message.author.send("❌ შეცდომა შეტყობინების გაგზავნისას. გთხოვთ, სცადოთ მოგვიანებით.").catch(() => {});
    }
  }
  
  // !embed კომანდა - ფერადი გვერდით ზოლიანი შეტყობინების გასაგზავნად
  if (message.content.startsWith('!embed')) {
    // დაუყოვნებლივ წაშალეთ ბრძანება, სანამ რაიმე სხვა ლოგიკას დავიწყებთ
    try {
      await message.delete();
    } catch (error) {
      console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to delete command message:', error.message);
      // მაინც გააგრძელეთ შესრულება, თუნდაც წაშლა ვერ მოხერხდეს
    }
    
    // გამოყავით ფერი და ტექსტი ბრძანებიდან
    // ფორმატი: !embed #FF0000 ტექსტი აქ
    const fullCommand = message.content.slice(7).trim();
    const firstSpace = fullCommand.indexOf(' ');
    
    if (firstSpace === -1) {
      return message.reply("⚠️ გთხოვ, მიუთითე ფერის HEX კოდი და ტექსტი, მაგ: `!embed #FF0000 გამარჯობა`");
    }
    
    const colorInput = fullCommand.slice(0, firstSpace);
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
    if (!isValidHexColor(colorInput)) {
      return message.reply(`⚠️ არასწორი ფერის HEX კოდი. გამოიყენეთ ფორმატი #RRGGBB ან #RGB (მაგ: #FF0000 წითელისთვის, #00FF00 მწვანისთვის)`);
    }
    
    if (!text) {
      return message.reply("⚠️ გთხოვ, მიუთითე ტექსტი.");
    }
    
    // შექმენით embed შეტყობინება ფერადი ზოლით
    const embed = new EmbedBuilder()
      .setDescription(text)
      .setColor(colorInput);
    
    // გაგზავნეთ embed
    await targetChannel.send({ embeds: [embed] });
    
    // მცირე დაყოვნება წაშლამდე, რათა Discord-ის კლიენტმა მოასწროს სინქრონიზაცია
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // წაშალეთ თავდაპირველი ბრძანება
    try {
      await message.delete();
      console.log('\x1b[32m[ SUCCESS ]\x1b[0m', 'Command message deleted successfully');
    } catch (error) {
      console.log('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to delete command message:', error.message);
    }
  }
});

login();
