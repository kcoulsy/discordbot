const { createStore, applyMiddleware, combineReducers } = require('redux');
const eventsReducer = require('./reducers/events');
const classMapReducer = require('./reducers/classMap');
const specMapReducer = require('./reducers/specMap');
const middleware = require('./middleware');

module.exports = () => {
    const rootReducer = combineReducers({
        classMap: classMapReducer,
        specMap: specMapReducer,
        events: eventsReducer
    })
    return createStore(rootReducer, applyMiddleware(middleware));
}