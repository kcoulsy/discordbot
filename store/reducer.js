const initialState = [];

module.exports = function reducer(state = initialState, action) {
    // console.log(action);
    switch (action.type) {
        case 'add_event':
            return [...state, action.event];
        case 'add_player_to_event':
            const {
                status,
                eventId,
                playerRole,
                playerClass,
                playerId,
            } = action;
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
        default:
            return state;
    }
};
