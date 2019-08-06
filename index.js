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

const {
    ADD_PLAYER_TO_EVENT,
    REMOVE_PLAYER_FROM_EVENT,
    LOAD_INITIAL_STATE,
} = require('./constants/redux');


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

    switch (cmd) {
        case `${prefix}new`:
            return createEvent(bot, msg, store);

        default:
            break;
    }
});

// Since the bot may restart, messages may not be cached. So we are listening for the raw events of all reactions
// Only in the correct channel.
bot.on('raw', packet => {
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t))
        return;
    // Grab the channel to check the message from
    const channel = bot.channels.get(packet.d.channel_id);

    // Check we are in the correct channel
    if (channel.name !== CONSTS.CHANNEL_NAME) return;

    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.fetchMessage(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id
            ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
            : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.get(emoji);
        // Adds the currently reacting user to the reaction's users collection.
        if (reaction)
            reaction.users.set(
                packet.d.user_id,
                bot.users.get(packet.d.user_id)
            );
        // Check which type of event it is before emitting
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            bot.emit(
                'messageReactionAdd',
                reaction,
                bot.users.get(packet.d.user_id)
            );
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            bot.emit(
                'messageReactionRemove',
                reaction,
                client.users.get(packet.d.user_id)
            );
        }
    });
});

bot.on('messageReactionAdd', (reaction, user) => {
    messageReaction(reaction, user, ADD_PLAYER_TO_EVENT);
});

bot.on('messageReactionRemove', (reaction, user) => {
    messageReaction(reaction, user, REMOVE_PLAYER_FROM_EVENT);
});

const messageReaction = (reaction, user, type) => {
    // Only check correct channel
    if (reaction.message.channel.name !== CONSTS.CHANNEL_NAME) {
        return;
    }

    // const title = reaction.message.embeds[0].fields[0].name;
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
            reaction.message.edit(
                new Discord.RichEmbed()
                    .setThumbnail(ev.event.img)
                    .setColor(ev.event.color)
                    .addField(ev.name, generateMessage(bot, ev))
            );
        });
};

bot.login(botconfig.token);
