const Discord = require('discord.js');
const fs = require('fs');

const botconfig = require('./botconfig.json');

const bot = new Discord.Client();

const CONSTS = require('./constants/main');

let classRoleMap = {};
let specRoleMap = {};

const createStore = require('./store/store');

const store = createStore();
const createEvent = require('./commands/createEvent');
const generateMessage = require('./utils/generateMessage');
const rawReactionEmitter = require('./utils/rawReactionEmitter');

const {
    REMOVE_EVENT,
    ADD_PLAYER_TO_EVENT,
    REMOVE_PLAYER_FROM_EVENT,
    LOAD_INITIAL_STATE,
} = require('./constants/redux');

// const unsub = store.subscribe(() => {
//     // console.log(store.getState());
// });

bot.on('ready', () => {
    const guild = bot.guilds.find('name', 'Prototype');

    // settting initial discord rank ids => name map
    CONSTS.ROLES_CLASS.forEach(roleName => {
        let role = guild.roles.find('name', roleName);
        if (role) classRoleMap[role.id] = roleName;
    });

    CONSTS.ROLES_SPEC.forEach(roleName => {
        let role = guild.roles.find('name', roleName);
        if (role) specRoleMap[role.id] = roleName;
    });

    const initialState = fs.readFileSync('store.json');

    store.dispatch({
        type: LOAD_INITIAL_STATE,
        initialState: JSON.parse(initialState),
    });

    console.log(`Logged in as ${bot.user.tag}!`);
    // bot.channels
    //     .find('name', 'bot-commands')
    //     .send('Bot restarted. Events may be lost.');
    bot.user.setActivity('$');
});

bot.on('message', msg => {
    let prefix = botconfig.prefix;
    let msgArray = msg.content.split(' ');
    let cmd = msgArray[0];

    if (
        ![CONSTS.ROLE_OFFICER, CONSTS.ROLE_GM].includes(msg.member.highestRole.name)
    ) {
        return;
    }

    switch (cmd) {
        case `${prefix}event`:
            return createEvent(bot, msg, store);
        default:
            break;
    }
});

// Since the bot may restart, messages may not be cached.
// So we are listening for the raw events of all reactions
// Only in the correct channel.
bot.on('raw', rawReactionEmitter.bind(bot));

const messageReaction = (reaction, user, type) => {
    // Only check correct channel
    if (reaction.message.channel.name !== CONSTS.CHANNEL_NAME) {
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
            let status;
            let playerRole;
            let playerClass;

            switch (reaction._emoji.name) {
                case CONSTS.EMOJI_CLOSE:
                    if (
                        [CONSTS.ROLE_OFFICER, CONSTS.ROLE_GM].includes(
                            user.highestRole.name
                        )
                    ) {
                        // reaction.message.channel.sendMessage('Closing that one');
                        const ev = store
                            .getState()
                            .find(event => event.id === messageId);
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
                case CONSTS.EMOJI_ACCEPT:
                    status = 'Accepted';
                    break;
                case CONSTS.EMOJI_MAYBE:
                    status = 'Maybe';
                    break;
                case CONSTS.EMOJI_DECLINE:
                    status = 'Declined';
                    break;
                default:
                    break;
            }
            user._roles.forEach(roleId => {
                if (specRoleMap[roleId]) {
                    playerRole = specRoleMap[roleId];
                }
                if (classRoleMap[roleId]) {
                    playerClass = classRoleMap[roleId];
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
            const ev = store.getState().find(event => event.id === messageId);
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

bot.on('messageReactionAdd', (reaction, user) => {
    messageReaction(reaction, user, ADD_PLAYER_TO_EVENT);
});

bot.on('messageReactionRemove', (reaction, user) => {
    messageReaction(reaction, user, REMOVE_PLAYER_FROM_EVENT);
});

bot.login(botconfig.token);
