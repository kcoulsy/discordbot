const Discord = require('discord.js');
const fs = require('fs');

const { ROLES_CLASS, ROLES_SPEC } = require('./constants/main');
const rawReactionEmitter = require('./utils/rawReactionEmitter');
const messageHandler = require('./utils/messageHandler');
const messageReaction = require('./utils/messageReaction');
const createStore = require('./store/store');
const botconfig = require('./botconfig.json');
const {
    ADD_PLAYER_TO_EVENT,
    REMOVE_PLAYER_FROM_EVENT,
    LOAD_INITIAL_STATE,
} = require('./constants/redux');

const bot = new Discord.Client();
const store = createStore();
let classRoleMap = {};
let specRoleMap = {};

// const unsub = store.subscribe(() => {
//     // console.log(store.getState());
// });

bot.on('ready', () => {
    const guild = bot.guilds.find('name', 'Prototype');

    // settting initial discord rank ids => name map
    ROLES_CLASS.forEach(roleName => {
        let role = guild.roles.find('name', roleName);
        if (role) classRoleMap[role.id] = roleName;
    });

    ROLES_SPEC.forEach(roleName => {
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

bot.on('message', messageHandler.bind({ bot, store }));

// Since the bot may restart, messages may not be cached.
// So we are listening for the raw events of all reactions
// Only in the correct channel.
bot.on('raw', rawReactionEmitter.bind(bot));

bot.on(
    'messageReactionAdd',
    messageReaction.bind({
        bot,
        store,
        type: ADD_PLAYER_TO_EVENT,
        classRoleMap,
        specRoleMap,
    })
);

bot.on(
    'messageReactionRemove',
    messageReaction.bind({
        bot,
        store,
        type: REMOVE_PLAYER_FROM_EVENT,
        classRoleMap,
        specRoleMap,
    })
);

bot.login(botconfig.token);
