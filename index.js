const Discord = require('discord.js');
const fs = require('fs');

const botconfig = require('./botconfig.json');

const bot = new Discord.Client();

const CONSTS = require('./constants/main');

let classRoleMap = {};
let specRoleMap = {};

const createStore = require('./store/store');

const store = createStore();

const unsub = store.subscribe(function() {
    console.log(store.getState());
    //   fs.writeFileSync('store.js', store.getState());
});

const createEvent = require('./commands/createEvent');

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

    console.log(`Logged in as ${bot.user.tag}!`);
    bot.channels
        .find('name', 'bot-commands')
        .send('Bot restarted. Events may be lost.');
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

bot.on('messageReactionAdd', (reaction, user) => {
    return;
    if (reaction.message.channel.name !== 'events') {
        return;
    }
    let title = reaction.message.embeds[0].fields[0].name;
    let id = title.match(/#(\d+)/)[1];
    if (user.bot) {
        return;
    }
    reaction.message.guild.fetchMember(user.id).then(user => {
        let userObj = {
            id: user.id,
            user,
            playerClass: null,
            playerRole: null,
        };
        user._roles.forEach(roleId => {
            if (specRoleMap[roleId]) {
                userObj.playerRole = specRoleMap[roleId];
            }
            if (classRoleMap[roleId]) {
                userObj.playerClass = classRoleMap[roleId];
            }
        });
        if (!userObj.playerRole || !userObj.playerClass) {
            user.sendMessage(
                'You need to pick a class and role to sign up to an event. You can do this in the #role-assign channel of the discord'
            );
            return;
        }

        switch (reaction._emoji.name) {
            case CONSTS.EMOJI_ACCEPT:
                store.dispatch({
                    type: 'add_player_to_event',
                    eventId: id,
                    player: userObj,
                    playerId: user.id,
                    role: userObj.playerRole,
                });
                break;
            case CONSTS.EMOJI_MAYBE:
                store.dispatch({
                    type: 'add_player_to_event',
                    eventId: id,
                    player: userObj,
                    playerId: user.id,
                    role: 'Maybe',
                });
                break;
            case CONSTS.EMOJI_DECLINE:
                store.dispatch({
                    type: 'add_player_to_event',
                    eventId: id,
                    player: userObj,
                    playerId: user.id,
                    role: 'Declined',
                });
                break;
            default:
                break;
        }

        const state = store.getState();
        const storedEvent = state.find(function(ev) {
            return ev.id == id;
        });

        //   reaction.message.edit(
        //       new Discord.RichEmbed()
        //           .setThumbnail(storedEvent.event.img)
        //           .setColor(storedEvent.event.color)
        //           .addField(title, generateMessage(bot, storedEvent.store))
        //   );
    });
});

bot.login(botconfig.token);
