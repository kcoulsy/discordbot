const { createStore, applyMiddleware, combineReducers } = require('redux');
const reducer = require('./reducer');
const classMapReducer = require('./reducers/classMap');
const specMapReducer = require('./reducers/specMap');
const middleware = require('./middleware');

module.exports = () => {
    const rootReducer = combineReducers({
        classMap: classMapReducer,
        specMap: specMapReducer,
        events: reducer
    })
    return createStore(rootReducer, applyMiddleware(middleware));
}