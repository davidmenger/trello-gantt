'use strict';
/* eslint no-undef: 0*/

require('bootstrap');
require('../less/default.less');
// require('babel-core/polyfill');

const React = require('react');
const ReactDom = require('react-dom');
const App = require('./app.jsx');
const reactRedux = require('react-redux');
const Provider = reactRedux.Provider;
const configureStore = require('../store/configureStore');
const actions = require('../actions/ganttActions');
const consts = require('../consts');

const store = configureStore({
    groupping: consts.GROUPPING_RELEASE,
    options: {
        versionColors: ['black'],
        appColors: ['green', 'yellow', 'orange'],
        bugColors: ['red'],
        projectColors: ['blue', 'sky', 'lime', 'pink'],
        memberWorkOptions: {}
    }
});

ReactDom.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('app')
);

Trello.authorize({
    name: 'Test',
    success () {
        store.dispatch(actions.fetchBoardList());
        store.dispatch(actions.fetchBoard(/* '56eee0aa8d9d6c874fa97ec0'*/'558d0b592553648174835eeb'));
    },
    error (e) {
        console.error(e);
        Trello.deauthorize();
    }
});

/**
 * FILTER boards
 *
 * /member/me/boards
 *
 *
 * console.log("SUC", res
     .filter(board => board.name.match(/dev/i))
     .map(board => board.name + ': ' + board.id));
 */
