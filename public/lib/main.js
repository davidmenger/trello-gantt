'use strict';
/* eslint no-undef: 0*/

window.Tether = require('tether');
// require('../scss/default.scss');
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
        versionColors: [],
        appColors: ['green', 'yellow', 'orange'],
        bugColors: ['red'],
        projectColors: ['blue', 'lime', 'pink', 'sky', 'black'],
        memberWorkOptions: {
            '516d53c7096722b434001fb2': {
                hours: 6,
                weekDays: 4, // two of four out
                begin: 10
            }
        }
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
        const fetch = `${window.location.hash || ''}`.replace(/\#/, '');
        store.dispatch(actions.fetchBoard(fetch || '5a6a36a7a87820c3718a8d08'));
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
