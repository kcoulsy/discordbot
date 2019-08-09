
const botconfig = require('../botconfig.json');
const createEvent = require('../commands/createEvent');
const { ROLE_GM, ROLE_OFFICER } = require('../constants/main');

module.exports = function(msg) {
    const {bot, store} = this;
    const prefix = botconfig.prefix;
    const msgArray = msg.content.split(' ');
    const cmd = msgArray[0];

    if (
        ![ROLE_OFFICER, ROLE_GM].includes(msg.member.highestRole.name)
    ) {
        return;
    }

    switch (cmd) {
        case `${prefix}event`:
            return createEvent(bot, msg, store);
        default:
            break;
    }
}
