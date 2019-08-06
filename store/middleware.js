const fs = require('fs');
const {
    ADD_PLAYER_TO_EVENT,
    REMOVE_PLAYER_FROM_EVENT,
    LOAD_INITIAL_STATE,
} = require('../constants/redux');

module.exports = store => next => action => {
    const state = store.getState();

    if (action.type === ADD_PLAYER_TO_EVENT) {
        state.forEach(event => {
            if (event.attending) {
                Object.entries(event.attending).forEach(
                    ([status, playerRoles]) => {
                        Object.entries(playerRoles).forEach(
                            ([playerRole, playerClasses]) => {
                                Object.entries(playerClasses).forEach(
                                    ([playerClass, players]) => {
                                        if (players.includes(action.playerId)) {
                                            store.dispatch({
                                                type: REMOVE_PLAYER_FROM_EVENT,
                                                playerId: action.playerId,
                                                status,
                                                playerClass,
                                                playerRole,
                                                eventId: event.id,
                                            });
                                        }
                                    }
                                );
                            }
                        );
                    }
                );
            }
        });
    }
    next(action);

    if (action.type !== LOAD_INITIAL_STATE) {
        console.log('Writing to store.json');
        fs.writeFileSync('store.json', JSON.stringify(state));
    }
};
