const Discord = require('discord.js');

const CONSTS = require('../constants/main');
const raidMap = require('../constants/raidMap');
const generateMessage = require('../utils/generateMessage');

module.exports = (bot, msg, store) => {
    let msgArray = msg.content.split(' ');
    let raid = msgArray[1];
    let eventTitle = msgArray.slice(2).join(' ');

    if (!raidMap[raid]) {
        return msg.channel.send(
            `The format is \`$new {eventType} {text}\` Valid eventTypes : ${Object.keys(
                raidMap
            ).join(' ')}`
        );
    }

    let eventembed = new Discord.RichEmbed()
        .setThumbnail(raidMap[raid].img)
        .setColor(raidMap[raid].color)
        .addField(
            `#Event ${raidMap[raid].name} - ${eventTitle}`,
            generateMessage(bot, {})
        );
    bot.channels
        .find('name', 'events')
        .send(eventembed)
        .then(sentMsg => {
            Promise.all([
                sentMsg.react(CONSTS.EMOJI_ACCEPT),
                sentMsg.react(CONSTS.EMOJI_MAYBE),
                sentMsg.react(CONSTS.EMOJI_DECLINE),
            ]);

            store.dispatch({
                type: 'add_event',
                event: {
                    id: sentMsg.id,
                    name: eventTitle,
                    event: raidMap[raid],
                    attending: [],
                },
            });
        });
};
