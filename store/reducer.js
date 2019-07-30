const initialState = [];

module.exports = function reducer(state = initialState, action) {
    switch(action.type) {
        case 'add_event':
            const event = Object.assign({
                id: state.length
            }, action.event);

            return [...state, event];
        case 'add_player_to_event':
            return state.map((ev) => {
                // only == because string == int
                if (ev.id == action.eventId) {
                    if (!ev.attending[action.role]) {
                        ev.attending[action.role] = [];
                    }
                    ev.attending[action.role].push(action.playerId);
                }
                return ev;
            });
        default:
            return state;
    }
}