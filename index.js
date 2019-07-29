const Discord = require('discord.js')

const botconfig = require('./botconfig.json')

const { BotEvent } = require('./models/BotEvent')

const bot = new Discord.Client()

const classRoles = [
    'Warrior',
    'Paladin',
    'Hunter',
    'Druid',
    'Rogue',
    'Priest',
    'Mage',
    'Warlock',
]

const specRoles = ['Tank', 'Healer', 'Damage']

const raidMap = require('./constants/raidMap')
const CONSTS = require('./constants/main');

let classRoleMap = {}
let specRoleMap = {}
let botEventStore = []

bot.on('ready', () => {
    const guild = bot.guilds.find('name', 'Prototype')

    classRoles.forEach(roleName => {
        let role = guild.roles.find('name', roleName)
        if (role) classRoleMap[role.id] = roleName
    })

    specRoles.forEach(roleName => {
        let role = guild.roles.find('name', roleName)
        if (role) specRoleMap[role.id] = roleName
    })

    console.log(`Logged in as ${bot.user.tag}!`)
    bot.channels
        .find('name', 'bot-commands')
        .send('Bot restarted. Events may be lost.')
    bot.user.setActivity('#help')
})

bot.on('message', msg => {
    let prefix = botconfig.prefix
    let msgArray = msg.content.split(' ')
    let cmd = msgArray[0]
    let raid = msgArray[1]
    let args = msgArray.slice(2)

    switch (cmd) {
        case `${prefix}newevent`:
            if (!raidMap[raid]) {
                msg.channel.send(`The format is $newevent {eventtype} {text}
Valid eventtypes : ${Object.keys(raidMap).join(' ')}
        `)
                return
            }
            botEventStore.push(
                new BotEvent({ id: botEventStore.length, event: raidMap[raid] })
            )
            let eventembed = new Discord.RichEmbed()
                .setThumbnail(raidMap[raid].img)
                .setColor(raidMap[raid].color)
                .addField(
                    `Event #${botEventStore.length - 1} ${
                        raidMap[raid].name
                    } - ${args.join(' ')}`,
                    generateMessage({})
                )
            bot.channels
                .find('name', 'events')
                .send(eventembed)
                .then(sentMsg => {
                    Promise.all([
                        sentMsg.react(CONSTS.EMOJI_ACCEPT),
                        sentMsg.react(CONSTS.EMOJI_MAYBE),
                        sentMsg.react(CONSTS.EMOJI_DECLINE),
                    ])
                })
            break
        default:
            break
    }
})

bot.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.channel.name !== 'events') {
        return
    }
    let title = reaction.message.embeds[0].fields[0].name
    let id = title.match(/#(\d+)/)[1]
    if (user.bot) {
        return
    }
    reaction.message.guild.fetchMember(user.id).then(user => {
        let userObj = {
            id: user.id,
            user,
            playerClass: null,
            playerRole: null,
        }
        user._roles.forEach(roleId => {
            if (specRoleMap[roleId]) {
                userObj.playerRole = specRoleMap[roleId]
            }
            if (classRoleMap[roleId]) {
                userObj.playerClass = classRoleMap[roleId]
            }
        })
        if (!userObj.playerRole || !userObj.playerClass) {
            console.log(userObj)
            user.sendMessage(
                'You need to pick a class and role to sign up to an event. You can do this in the #role-assign channel of the discord'
            )
            return
        }
        switch (reaction._emoji.name) {
            case CONSTS.EMOJI_ACCEPT:
                botEventStore[id].addPlayer(
                    userObj,
                    userObj.playerRole,
                    userObj.playerClass
                )
                break
            case CONSTS.EMOJI_MAYBE:
                botEventStore[id].addPlayer(
                    userObj,
                    'Maybe',
                    userObj.playerClass
                )
                break
            case CONSTS.EMOJI_DECLINE:
                botEventStore[id].addPlayer(
                    userObj,
                    'Declined',
                    userObj.playerClass
                )
                break
            default:
                break
        }

        reaction.message.edit(
            new Discord.RichEmbed()
                .setThumbnail(botEventStore[id].event.img)
                .setColor(botEventStore[id].event.color)
                .addField(title, generateMessage(botEventStore[id].store))
        )
    })
})

bot.login(botconfig.token)

const getClassIcon = className => {
    return bot.emojis.find(emoji => emoji.name === className.toLowerCase())
}

const generateRoleMessage = role => {
    if (!role) {
        return ''
    }
    return Object.values(role).map(playerClass => {
        if (!playerClass.length) return null
        return (
            getClassIcon(playerClass[0].playerClass) +
            playerClass.map(player => {
                return player.user
            })
        )
    })
}

const generateMessage = accepted => {
    const { Tank, Healer, Damage, Maybe, Declined } = accepted

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
  
  Please react to this post with ${CONSTS.EMOJI_ACCEPT} to **Accept**, ${CONSTS.EMOJI_MAYBE} for **Maybe**, and ${CONSTS.EMOJI_DECLINE} to **Decline**.`
}
