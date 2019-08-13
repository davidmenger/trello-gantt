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
        appColors: ['green', 'yellow', 'ping', 'sky'],
        bugColors: ['red'],
        projectColors: ['blue', 'lime', 'black', 'orange'],
        ignoreMembers: [
            '52eba016a0a3bce401edc3c3',
            '5b1a546694db7264598c5e90',
            '5d07835a24feb056b373d40d'
        ],
        memberWorkOptions: {
            // pav
            '53f8e07fa98c4e4c54e42258': {
                hours: 6,
                weekDays: 3, // two of four out
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
        store.dispatch(actions.fetchBoard(fetch || '5cc6b93ee741391095b80117'));
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
