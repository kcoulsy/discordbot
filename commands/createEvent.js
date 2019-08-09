const Discord = require('discord.js');

const { ADD_EVENT } = require('./../constants/redux.js');
const CONSTS = require('../constants/main');
const raidMap = require('../constants/raidMap');
const generateMessage = require('../utils/generateMessage');

module.exports = (bot, msg, store) => {
    let msgArray = msg.content.split(' ');
    let raid = msgArray[1];
    let args = msgArray.slice(2).join(' ').split('|');
    let eventTitle = args[0];
    let eventDesc = args[1];

    if (!raidMap[raid]) {
        return msg.channel.send(
            `The format is \`$new {eventType} {text}\` Valid eventTypes : ${Object.keys(
                raidMap
            ).join(' ')}`
        );
    }

    if (store.getState().events.length >= 10) {
        return msg.channel.send(
            `You may only have 5 events at one time.`
        );
    }

    let eventembed = new Discord.RichEmbed()
        .setThumbnail(raidMap[raid].img)
        .setColor(raidMap[raid].color)
        .addField(
            `#Event - ${raidMap[raid].name} | ${eventTitle}`,
            generateMessage(bot, {
                description: eventDesc
            }, false)
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
                type: ADD_EVENT,
                event: {
                    id: sentMsg.id,
                    name: eventTitle,
                    description: eventDesc,
                    event: raidMap[raid],
                    attending: {},
                },
            });
        });
};
