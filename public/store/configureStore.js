'use strict';

const redux = require('redux');
const reducers = require('../reducers');
const reduxThunk = require('redux-thunk');

function configureStore (initialState) {
    const store = redux.createStore(
        reducers,
        initialState,
        redux.applyMiddleware(reduxThunk.default));

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('../reducers', () => {
            const nextReducer = require('../reducers');
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}

module.exports = configureStore;
