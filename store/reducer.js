const initialState = [];

module.exports = function reducer(state = initialState, action) {
    switch(action.type) {
        case 'add_event':
            return [...state, action.event];
        case 'add_player_to_event':
            return state.map((ev) => {
                // only == because string == int
                if (ev.id == action.eventId) {
                    ev.addPlayer(action.player, action.role)
                }
                return ev;
            })
        default:
            return state;
    }
}