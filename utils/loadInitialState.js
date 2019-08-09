const fs = require('fs');

const { ROLES_CLASS, ROLES_SPEC } = require('../constants/main');
const { LOAD_INITIAL_STATE } = require('../constants/redux');

module.exports = function loadInitialState() {
    const { bot, store } = this;
    const guild = bot.guilds.find('name', 'Prototype');

    let classRoleMap = {};
    let specRoleMap = {};
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
        classRoleMap,
        specRoleMap,
        initialState: JSON.parse(initialState),
    });

    console.log(`Logged in as ${bot.user.tag}!`);

    bot.channels
        .find('name', 'bot-commands')
        .send('Bot started.');

    bot.user.setActivity('$');
}