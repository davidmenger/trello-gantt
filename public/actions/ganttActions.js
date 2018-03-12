'use strict';
/* eslint no-undef: 0 */

const consts = require('../consts');

module.exports = {

    boardListResponse (boards) {
        return { type: consts.BOARD_LIST_RESPONSE, boards };
    },

    boardsResponse (data) {
        return { type: consts.BOARD_RESPONSE, data };
    },

    changeGroupping (groupping) {
        return { type: consts.CHANGE_GROUPPING, groupping };
    },

    fetchBoardList () {
        return (dispatch) => {
            Trello.get('members/me/boards', (boards) => {
                dispatch(this.boardListResponse(boards));
            }, () => {
                Trello.deauthorize();
            });
        };
    },

    selectLabel (labelId) {
        return { type: consts.SELECT_LABEL, labelId };
    },

    fetchBoard (boardId) {
        window.location.hash = boardId;
        return (dispatch) => {
            dispatch({ type: consts.BOARD_SELECT, boardId });
            const fields = 'idMembers,dateLastActivity,due,id,idLabels,'
                + 'name,pos,idList,shortLink,actions,shortUrl';
            const actionSettings = 'actions_fields=date,idMemberCreator,type'
                + '&actions_memberCreator_fields=username&actions_limit=1000'
                + '&actions=false' // commentCard,updateCheckItemStateOnCard,updateCard:idList'
                + '&checklists=all';

            Trello.get(`boards/${boardId}/cards?fields=${fields}&${actionSettings}`, (cards) => {
                Trello.get(`boards/${boardId}/lists`, (lists) => {
                    Trello.get(`boards/${boardId}/members`, (members) => {
                        Trello.get(`boards/${boardId}/labels`, (labels) => {
                            dispatch(module.exports.boardsResponse({
                                cards, lists, labels, members
                            }));
                        });
                    });
                });
            });
        };
    }
};
