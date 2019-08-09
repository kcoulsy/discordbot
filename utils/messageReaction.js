const Discord = require('discord.js');
const {
    ROLE_GM,
    ROLE_OFFICER,
    EMOJI_ACCEPT,
    EMOJI_MAYBE,
    EMOJI_DECLINE,
    EMOJI_CLOSE,
    CHANNEL_NAME,
} = require('../constants/main');
const { REMOVE_EVENT } = require('../constants/redux');
const generateMessage = require('./generateMessage');

module.exports = function messageReaction(reaction, user) {
    const { bot, store, type } = this;
    // Only check correct channel
    if (reaction.message.channel.name !== CHANNEL_NAME) {
        return;
    }

    const messageId = reaction.message.id;

    // Early return if bot, since it sets up the reactions on it's own post.
    if (user.bot) {
        return;
    }

    bot.guilds
        .find('name', 'Prototype')
        .fetchMember(user.id)
        .then(user => {
            const { classMap, specMap, events } = store.getState();
            let status;
            let playerRole;
            let playerClass;

            switch (reaction._emoji.name) {
                case EMOJI_CLOSE:
                    if (
                        [ROLE_OFFICER, ROLE_GM].includes(user.highestRole.name)
                    ) {
                        // reaction.message.channel.sendMessage('Closing that one');
                        const ev = events.find(event => event.id === messageId);
                        if (!ev) return;
                        reaction.message.edit(
                            new Discord.RichEmbed()
                                .setThumbnail(ev.event.img)
                                .setColor(ev.event.color)
                                .addField(
                                    `#Event - ${ev.event.name} | ${ev.name}`,
                                    generateMessage(bot, ev, true)
                                )
                        );
                        store.dispatch({
                            type: REMOVE_EVENT,
                            eventId: messageId,
                        });
                        return;
                    }
                    return;
                case EMOJI_ACCEPT:
                    status = 'Accepted';
                    break;
                case EMOJI_MAYBE:
                    status = 'Maybe';
                    break;
                case EMOJI_DECLINE:
                    status = 'Declined';
                    break;
                default:
                    break;
            }
            user._roles.forEach(roleId => {
                if (specMap[roleId]) {
                    playerRole = specMap[roleId];
                }
                if (classMap[roleId]) {
                    playerClass = classMap[roleId];
                }
            });
            if (!playerRole || !playerClass) {
                user.sendMessage(
                    'You need to pick a class and role to sign up to an event. You can do this in the #read-first channel of the discord'
                );
                return;
            }

            store.dispatch({
                type,
                eventId: messageId,
                playerId: user.id,
                status,
                playerRole,
                playerClass,
            });

            // Refetching events from store after dispatch
            const ev = store.getState().events.find(event => event.id === messageId);
            if (!ev) {
                return;
            }

            reaction.message.edit(
                new Discord.RichEmbed()
                    .setThumbnail(ev.event.img)
                    .setColor(ev.event.color)
                    .addField(
                        `#Event - ${ev.event.name} | ${ev.name}`,
                        generateMessage(bot, ev, false)
                    )
            );
        });
};
