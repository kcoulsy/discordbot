const { createStore, applyMiddleware } = require('redux');
const reducer = require('./reducer');
const middleware = require('./middleware');

module.exports = () => {
    return createStore(reducer, applyMiddleware(middleware));
}