const CONSTS = require('../constants/main')

const getClassIcon = (bot, className) => {
    return bot.emojis.find(emoji => emoji.name === className.toLowerCase())
}

const generateRoleMessage = (bot, role) => {
    if (!role) {
        return ''
    }
    return Object.values(role).map(playerClass => {
        if (!playerClass.length) return null
        return (
            getClassIcon(bot, playerClass[0].playerClass) +
            playerClass.map(player => {
                return player.user
            })
        )
    })
}

module.exports = (bot, { Tank, Healer, Damage, Maybe, Declined }) => {
    return `
  __Players Going:__

  **Tank**
${generateRoleMessage(bot, Tank)}
  **Healer**
${generateRoleMessage(bot, Healer)}
  **Damage**
${generateRoleMessage(bot, Damage)}

__Maybe__
${generateRoleMessage(bot, Maybe)}
__Declined__
${generateRoleMessage(bot, Declined)}

Please react to this post with ${CONSTS.EMOJI_ACCEPT} to **Accept**, ${
        CONSTS.EMOJI_MAYBE
    } for **Maybe**, and ${CONSTS.EMOJI_DECLINE} to **Decline**.`
}
