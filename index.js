const Discord = require('discord.js');
const axios = require('axios');

const botconfig = require('./botconfig.json');

const bot = new Discord.Client();


const RSVP_ACCEPT = '✅';
const RSVP_MAYBE = '❔';
const RSVP_DECLINE = '❌';

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  bot.user.setActivity('#help');
});

bot.on('message', msg => {
  let prefix = botconfig.prefix;
  let msgArray = msg.content.split(' ');
  let cmd = msgArray[0];
  let args = msgArray.slice(1);

  switch(cmd){
    case `${prefix}newevent`:
    let embedMsg = `event
    
    :tank:

    - :warrior:

    :healer: 

    - :paladin: 
    - :priest: 
    - :druid: 

    :Damage: 

    - :warrior:  
    - :hunter:  
    - :rogue:
    - :mage:  
    - :warlock:

    Please react to this post with ${RSVP_ACCEPT} to **Accept**, ${RSVP_MAYBE} for **Maybe**, and ${RSVP_DECLINE} to **Decline**.`

      let eventembed = new Discord.RichEmbed()
        .addField(args.join(' '), embedMsg);
       
      msg.channel.send(eventembed).then((msg) => {
        Promise.all([
          msg.react(RSVP_ACCEPT),
          msg.react(RSVP_MAYBE),
          msg.react(RSVP_DECLINE)
        ])
      });
      break;
    case `${prefix}botinfo`:
        let bicon = bot.user.displayAvatarURL;
        let botembed = new Discord.RichEmbed()
        .setDescription('Bot info')
        .setColor('#64fc6f')
        .setThumbnail(bicon)
        .addField('Bot Name', bot.user.username)
        .addField('This bot was created by Sytho-Draenor on ', bot.user.createdAt);
        msg.channel.send(botembed);
        break;

    case `${prefix}serverinfo`:
        let sicon = msg.guild.iconURL;
        let serverembed = new Discord.RichEmbed()
          .setDescription('Server Information')
          .setColor('#64fc6f')
          .setThumbnail(sicon)
          .addField('Server Name', msg.guild.name)
          .addField('Created on', msg.guild.createdAt)
          .addField('You joined', msg.guild.joinedAt)
          .addField('Total Members', msg.guild.memberCount);
        msg.channel.send(serverembed);
        break;

      case `${prefix}dox`:
        if(args.length != 3){
          let errorembed = new Discord.RichEmbed()
          .addField('Syntax Error', 'To use the dox command you must format as "#dox charname server region"');
          msg.channel.send(errorembed);
        } else {
          let name = args[0];
          let server = args[1];
          let region = args[2];
          const details = getCharacterInfo(name, server, region);

          let raiderio = {};

          const raiderioUrl = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${server}&name=${name}&fields=raid_progression%2Cmythic_plus_scores%2Cprevious_mythic_plus_scores%2Cmythic_plus_best_runs`;
          axios(raiderioUrl).then((response)=>{
            if(response.status === 200) {
              raiderio = response;

              let mplus = {
                currentScore: raiderio.data.mythic_plus_scores,
                previousScore: raiderio.data.previous_mythic_plus_scores,
                bestRuns: raiderio.data.mythic_plus_best_runs
              }
              let raidProg = raiderio.data.raid_progression;
              let antorus = raidProg["antorus-the-burning-throne"];
              let characterembed = new Discord.RichEmbed()
              .addField('Character Info', `${raiderio.data.name} - ${raiderio.data.realm} (${raiderio.data.region}) ${raiderio.data.race} ${raiderio.data.class}`)
              .setThumbnail(raiderio.data.thumbnail_url)
              .addField('Antorus Progression', antorus.summary)
              .addField('Mythic Plus Score', `Current: ${mplus.currentScore.all}\n` +
                          `Tank: ${mplus.currentScore.tank}\n` +
                          `Healer: ${mplus.currentScore.healer}\n` +
                          `DPS: ${mplus.currentScore.dps}\n` +
                          `Previous: ${mplus.previousScore.all}`)
              .addField('Best Mythic Plus Runs', `${mplus.bestRuns[0].dungeon} - ${mplus.bestRuns[0].mythic_level} +${mplus.bestRuns[0].num_keystone_upgrades}\n` +
                                                 `${mplus.bestRuns[1].dungeon} - ${mplus.bestRuns[1].mythic_level} +${mplus.bestRuns[1].num_keystone_upgrades}\n` +
                                                 `${mplus.bestRuns[2].dungeon} - ${mplus.bestRuns[2].mythic_level} +${mplus.bestRuns[2].num_keystone_upgrades}`);
              msg.channel.send(characterembed);
            }
        }).catch((e)=>{
          let errorembed = new Discord.RichEmbed()
          .addField('Error', 'Unable to retrieve information on that character');
          msg.channel.send(errorembed);
        });
      }
    default:
      break;
  }
});
const getCharacterInfo = (name, server, region) => {

}
bot.login(botconfig.token);
