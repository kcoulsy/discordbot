const Discord = require("discord.js");
// const axios = require("axios");

const botconfig = require("./botconfig.json");

const { BotEvent } = require("./models/BotEvent");

const bot = new Discord.Client();

const RSVP_ACCEPT = "✅";
const RSVP_MAYBE = "❔";
const RSVP_DECLINE = "❌";

let classRoles = [
  "Warrior",
  "Paladin",
  "Hunter",
  "Druid",
  "Rogue",
  "Priest",
  "Mage",
  "Warlock"
];

let specRoles = ["Tank", "Healer", "Damage"];

let classRoleMap = {};
let specRoleMap = {};

let eventStore = [];

let botEventStore = [];

bot.on("ready", () => {
  const guild = bot.guilds.find("name", "Prototype");

  classRoles.forEach(roleName => {
    let role = guild.roles.find("name", roleName);
    if (role) classRoleMap[role.id] = roleName;
  });

  specRoles.forEach(roleName => {
    let role = guild.roles.find("name", roleName);
    if (role) specRoleMap[role.id] = roleName;
  });

  console.log(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity("#help");
});

bot.on("message", msg => {
  let prefix = botconfig.prefix;
  let msgArray = msg.content.split(" ");
  let cmd = msgArray[0];
  let args = msgArray.slice(1);

  switch (cmd) {
    case `${prefix}newevent`:
      eventStore.push({});
      botEventStore.push(new BotEvent({ id: botEventStore.length }));
      let eventembed = new Discord.RichEmbed()
      .setThumbnail('https://i.gyazo.com/5f9ed3d6298a3bc0b46f15808ec6a659.png')
      .setColor(0x52A030)
      .addField(
        `Event #${eventStore.length - 1} - ${args.join(" ")}`,
        generateMessage({})
      )
      msg.channel.send(eventembed).then(sentMsg => {
        Promise.all([
          sentMsg.react(RSVP_ACCEPT),
          sentMsg.react(RSVP_MAYBE),
          sentMsg.react(RSVP_DECLINE)
        ]);
      });
      break;
    default:
      break;
  }
});

bot.on("messageReactionAdd", (reaction, user) => {
  let title = reaction.message.embeds[0].fields[0].name;
  let id = title.match(/#(\d+)/)[1];
  if (user.bot) {
    return;
  }
  reaction.message.guild.fetchMember(user.id).then(user => {

    let userObj = {
      id: user.id,
      user,
      playerClass: null,
      playerRole: null
    };
    user._roles.forEach(roleId => {
      if (specRoleMap[roleId]) {
        userObj.playerRole = specRoleMap[roleId];
      }
      if (classRoleMap[roleId]) {
        userObj.playerClass = classRoleMap[roleId];
      }
    });

    switch (reaction._emoji.name) {
      case RSVP_ACCEPT:
        botEventStore[id].addPlayer(
          userObj,
          userObj.playerRole,
          userObj.playerClass
        );
        break;
      case RSVP_MAYBE:
        botEventStore[id].addPlayer(userObj, "Maybe", userObj.playerClass);
        break;
      case RSVP_DECLINE:
        botEventStore[id].addPlayer(userObj, "Declined", userObj.playerClass);
        break;
      default:
        break;
    }

    reaction.message.edit(
      new Discord.RichEmbed()
      .setThumbnail('https://i.gyazo.com/5f9ed3d6298a3bc0b46f15808ec6a659.png')
      .setColor(0x52A030)
      .addField(
        title,
        generateMessage(botEventStore[id].store)
      )
      
    );
  });
});

bot.login(botconfig.token);

const getClassIcon = className => {
  return bot.emojis.find(emoji => emoji.name === className.toLowerCase());
};

const generateRoleMessage = role => {
  if (!role) {
    return "";
  }
  return Object.values(role).map(playerClass => {
    if (!playerClass.length) return null;
    return (
      getClassIcon(playerClass[0].playerClass) +
      playerClass.map(player => {
        return player.user;
      })
    );
  });
};

const generateMessage = accepted => {
  const { Tank, Healer, Damage, Maybe, Declined } = accepted;

  return `
    __Players Going:__

    **Tank**
  ${generateRoleMessage(Tank)}
    **Healer**
  ${generateRoleMessage(Healer)}
    **Damage**
  ${generateRoleMessage(Damage)}

  __Maybe__
  ${generateRoleMessage(Maybe)}
  __Declined__
${generateRoleMessage(Declined)}
  
  Please react to this post with ${RSVP_ACCEPT} to **Accept**, ${RSVP_MAYBE} for **Maybe**, and ${RSVP_DECLINE} to **Decline**.`;
};

// TODO

// REMOVE BOT FROM LIST (DON'T ALLOW IN FIRST PLACE)
// ONLY ALLOW 1 CHOICE PER ID
// ALLOW USER TO UNCHOOSE THEIR CHOICE
// MAYBE SOME SORT OF DB.
