const Discord = require('discord.js');

const rawReactionEmitter = require('./utils/rawReactionEmitter');
const messageHandler = require('./utils/messageHandler');
const messageReaction = require('./utils/messageReaction');
const loadInitialState = require('./utils/loadInitialState');
const createStore = require('./store/store');
const botconfig = require('./botconfig.json');
const {
    ADD_PLAYER_TO_EVENT,
    REMOVE_PLAYER_FROM_EVENT,
} = require('./constants/redux');

const bot = new Discord.Client();
const store = createStore();

// Load in initial state - classRoleMap, specRoleMap and events
bot.on('ready', loadInitialState.bind({ bot, store }));

// Routes messages to commands
bot.on('message', messageHandler.bind({ bot, store }));

// Since the bot may restart, messages may not be cached.
// So we are listening for the raw events of all reactions
// Only in the correct channel.
bot.on('raw', rawReactionEmitter.bind({bot}));

// Handles reaction addition - adds sign up to events
bot.on(
    'messageReactionAdd',
    messageReaction.bind({
        bot,
        store,
        type: ADD_PLAYER_TO_EVENT,
    })
);

// Handles reaction removal - removes sign up from events
bot.on(
    'messageReactionRemove',
    messageReaction.bind({
        bot,
        store,
        type: REMOVE_PLAYER_FROM_EVENT,
    })
);

// Starts the bot
bot.login(botconfig.token);
