'use strict';
/* eslint no-undef: 0*/

window.Tether = require('tether');
require('../scss/default.scss');
require('bootstrap');
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
    groupping: consts.GROUPPING_GANTT,
    options: {
        versionColors: ['black'],
        appColors: ['green', 'yellow', 'orange', 'sky'],
        bugColors: ['red'],
        projectColors: ['blue', 'lime', 'pink'],
        memberWorkOptions: {}
    }
});

ReactDom.render(
    <div className="container-fluid wrapper">
        <Provider store={store} >
            <App />
        </Provider>
    </div>,
    document.getElementById('app')
);

Trello.authorize({
    name: 'Test',
    success () {
        store.dispatch(actions.fetchBoardList());
        // /* '56eee0aa8d9d6c874fa97ec0'*/''));
        store.dispatch(actions.fetchBoard('57d7b74ca1c4d52cf978eb5a'));
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
