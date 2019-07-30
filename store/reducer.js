const initialState = [];

module.exports = function reducer(state = initialState, action) {
    console.log(action);
    switch(action.type) {
        case 'add_event':
            return [...state, action.event];
        case 'add_player_to_event':
            return state.map((ev) => {
                // only == because string == int
                if (ev.id == action.eventId) {
                    if (!ev.attending[action.status]) {
                        ev.attending[action.status] = [];
                    }
                    ev.attending[action.status].push(action.playerId);
                }
                return ev;
            });
        default:
            return state;
    }
}