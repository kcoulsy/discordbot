const CONSTS = require('../constants/main');

const getClassIcon = (bot, className) => {
    return bot.emojis.find(emoji => emoji.name === className.toLowerCase());
};

const generateMessage = (bot, event, close) => {
    const { attending, description } = event;
    let message = `${description}\n`;
    // console.log(event);
    if (attending) {
        Object.entries(attending).map(([status, role]) => {
            message += `\n**${status}:**\n`;
            Object.entries(role).map(([playerRole, playerClasses]) => {
                message += `${playerRole}\n`;
                Object.entries(playerClasses).map(([playerClass, players]) => {
                    message += `${getClassIcon(bot, playerClass)}: `;
                    players.map(playerId => {
                        const user = bot.users.get(playerId);
                        message += `${user}`;
                    });
                });
                message += `\n`;
            });
            message += `\n`;
        });
    }
    if (!close) {
        message += `\nPlease react to this post with ${
            CONSTS.EMOJI_ACCEPT
        } to **Accept**, ${CONSTS.EMOJI_MAYBE} for **Maybe**, and ${
            CONSTS.EMOJI_DECLINE
        } to **Decline**.`;
    } else {
        message += `This event has finished!`
    }

    return message;
};

module.exports = generateMessage;
