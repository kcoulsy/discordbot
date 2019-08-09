const {
    ADD_EVENT,
    REMOVE_EVENT,
    ADD_PLAYER_TO_EVENT,
    REMOVE_PLAYER_FROM_EVENT,
    LOAD_INITIAL_STATE,
} = require('../constants/redux');

const initialState = [];

module.exports = function reducer(state = initialState, action) {
    const { status, eventId, playerRole, playerClass, playerId } = action;

    switch (action.type) {
        case LOAD_INITIAL_STATE:
            return action.initialState;
        case ADD_EVENT:
            return [...state, action.event];
        case REMOVE_EVENT:
            return state.filter(event => event.id !== eventId);
        case ADD_PLAYER_TO_EVENT:
            return state.map(ev => {
                // only == because string == int
                if (ev.id == eventId) {
                    if (!ev.attending[status]) {
                        ev.attending[status] = {};
                    }
                    if (!ev.attending[status][playerRole]) {
                        ev.attending[status][playerRole] = {};
                    }
                    if (!ev.attending[status][playerRole][playerClass]) {
                        ev.attending[status][playerRole][playerClass] = [];
                    }

                    ev.attending[status][playerRole][playerClass].push(
                        playerId
                    );
                }
                return ev;
            });
        case REMOVE_PLAYER_FROM_EVENT:
            return state.map(ev => {
                // only == because string == int
                if (ev.id == eventId) {
                    if (
                        !ev.attending[status] ||
                        !ev.attending[status][playerRole] ||
                        !ev.attending[status][playerRole][playerClass]
                    ) {
                        return ev;
                    }
                    ev.attending[status][playerRole][
                        playerClass
                    ] = ev.attending[status][playerRole][playerClass].filter(
                        player => {
                            return player != playerId;
                        }
                    );

                    if (!ev.attending[status][playerRole][playerClass].length) {
                        delete ev.attending[status][playerRole][playerClass];
                    }
                    if (!Object.keys(ev.attending[status][playerRole]).length) {
                        delete ev.attending[status][playerRole];
                    }
                    if (!Object.keys(ev.attending[status]).length) {
                        delete ev.attending[status];
                    }
                }
                return ev;
            });
        default:
            return state;
    }
};
