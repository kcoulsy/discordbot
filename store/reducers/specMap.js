const initialState = {};
const { LOAD_INITIAL_STATE } = require('../../constants/redux');

module.exports = function reducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_INITIAL_STATE:
            return action.specRoleMap;
        default:
            return state;
    }
};
