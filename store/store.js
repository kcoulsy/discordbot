const { createStore } = require('redux');
const reducer = require('./reducer');

module.exports = () => {
    return createStore(reducer);
}