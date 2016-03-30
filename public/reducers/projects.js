'use strict';

const consts = require('../consts');
const timeResolver = require('./timeResolver');
const NOT_DEFINED = '-';
const groupReducer = require('./groupReducer');
const ganttActions = require('../actions/ganttActions');

module.exports = function (state, action) {
    if (action.type === consts.BOARD_SELECT) {

        return Object.assign({}, state, {
            selectedBoardId: action.boardId,
            loading: true
        });
    }

    if (action.type === consts.BOARD_LIST_RESPONSE) {
        console.log(action);
        return Object.assign({}, state, {
            boards: action.boards
        });
    }


    if (action.type === consts.BOARD_RESPONSE) {
        console.log(action.data);

        const cardsById = action.data.cards
            .reduce((res, card) => res.set(card.id, card), new Map());

        const labelsById = action.data.labels
            .reduce((res, label) => res.set(label.id, label), new Map());

        const assignments = timeResolver.resolveToTasks(
            action.data.cards,
            action.data.lists,
            state.options.memberWorkOptions,
            cardsById,
            labelsById
        );

        const membersById = action.data.members
            .reduce((res, members) => res.set(members.id, members), new Map());

        labelsById.set(null, { color: 'white', name: NOT_DEFINED, id: NOT_DEFINED });

        return groupReducer(Object.assign({}, state, {
            loading: false,
            assignments,
            cardsById,
            membersById,
            labelsById
        }), ganttActions.changeGroupping(state.groupping));
    }

    if (action.type === consts.CHANGE_GROUPPING
        || action.type === consts.SELECT_LABEL) {

        return groupReducer(state, action);
    }

    return state || {};
};
