'use strict';

require('bootstrap');
require('../less/default.less');
// require('babel-core/polyfill');

const React = require('react');
const ReactDom = require('react-dom');
const App = require('../app.jsx');
const reactRedux = require('react-redux');
const Provider = reactRedux.Provider;
const configureStore = require('../store/configureStore');
const actions = require('../actions/ganttActions');

const store = configureStore();

console.log(store.getState());

ReactDom.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('app')
);

const devBoardId = '558d0b592553648174835eeb';

Trello.authorize({
    name: 'Test',
    success () {
        Trello.get(`boards/${devBoardId}/cards?checklists=all&actions=commentCard&fields=due,id,idLabels,name,pos,idList,shortLink,actions`, (cards) => {
            Trello.get(`boards/${devBoardId}/lists`, (lists) => {
                Trello.get(`boards/${devBoardId}/members`, (members) => {
                    Trello.get(`boards/${devBoardId}/labels`, (labels) => {
                        store.dispatch(actions.trelloResponse({ cards, lists, actions: [], labels, members }));
                    });
                });
            });
        });
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
