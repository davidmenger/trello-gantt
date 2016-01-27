'use strict';

const consts = require('../consts');
const timeResolver = require('./timeResolver');
const vector = require('../utils/vector');
const NOT_DEFINED = '-';

const settings = {
    versionColor: 'black',
    appColors: ['green', 'yellow', 'orange'],
    bugColor: 'red',
    notProject: ['red', 'black', 'green', 'yellow', 'orange'],
    // doingListId: '558d0b9cb1dfa6f3cc1066e6',
    doingListId: '55fffae14bcfe5879cf7e034',
    memberWorkOptions: {}
};

function colorOfRow (labels, labelsById) {
    return labels
        .map((label) => typeof label === 'object' ? label : labelsById.get(label))
        .filter((label) => settings.notProject.indexOf(label.color) === -1)
        .map((label) => label.color)
        .shift();
}

/* function appLabelId (labels) {
    return labels.filter(label => settings.appColors.indexOf(label.color) !== -1)
        .map(label => label.id)
        .shift() || NOT_DEFINED;
}*/

function versionLabelId (labels, labelsById) {
    return labels
        .map((label) => typeof label === 'object' ? label : labelsById.get(label))
        .filter(label => settings.versionColor === label.color)
        .map(label => label.id)
        .shift() || NOT_DEFINED;
}

module.exports = function (state, action) {
    if (action.type === consts.TRELLO_RESPONSE) {
        console.log(action.data);

        const cardsById = action.data.cards.reduce((res, card) => res.set(card.id, card), new Map());

        const taskList = timeResolver.resolveToTasks(
            action.data.cards,
            action.data.lists,
            settings.doingListId,
            settings.memberWorkOptions,
            cardsById
        );

        const membersById = action.data.members.reduce((res, members) => res.set(members.id, members), new Map());
        const labelsById = action.data.labels.reduce((res, label) => res.set(label.id, label), new Map());
        labelsById.set(NOT_DEFINED, { color: 'white', name: NOT_DEFINED, id: NOT_DEFINED });

        let start = null;
        let end = null;
        const beforeMonth = new Date();
        beforeMonth.setMonth(beforeMonth.getMonth() - 1);
        const filtered = taskList.filter(task => {
            const labels = cardsById.has(task.cardId) ? cardsById.get(task.cardId).idLabels : [];
            if (versionLabelId(labels, labelsById) === NOT_DEFINED) {
                return false;
            }
            if (task.r === 0 && task.end < beforeMonth) {
                return false;
            }
            if (!start || start > task.begin) {
                start = task.begin;
            }
            if (!end || end < task.end) {
                end = task.end;
            }
            return true;
        });

        const matrix = vector.makeMatrix(start, end, 60);

        console.log({ cardsById, labelsById, membersById, filtered, taskList });

        const projects = new Map();

        for (const task of filtered) {
            const card = cardsById.get(task.cardId);
            const labels = card ? card.idLabels : [];
            const projectId = versionLabelId(labels, labelsById);
            const laneId = task.memberId;

            let project = projects.get(projectId);

            if (!project) {
                project = {
                    id: 'p' + projectId,
                    name: labelsById.get(projectId).name,
                    lanes: new Map(),
                    color: labelsById.get(projectId).color
                };
                projects.set(projectId, project);
            }

            let lane = project.lanes.get(laneId);
            if (!lane) {
                lane = {
                    id: 'l' + laneId,
                    name: membersById.has(task.memberId) ? membersById.get(task.memberId).fullName : '-',
                    tasks: []
                };
                project.lanes.set(laneId, lane);
            }

            const width = vector.width(task.begin, task.end, matrix);

            lane.tasks.push({
                id: task.cardId + task.memberId,
                name: task.name,
                who: membersById.has(task.memberId) ? membersById.get(task.memberId).fullName : '-',
                e: task.e,
                s: task.s,
                r: task.r,
                begin: task.begin,
                end: task.end,
                left: vector.position(task.begin, matrix),
                width,
                color: card ? colorOfRow(card.idLabels, labelsById) : null,
                progress: task.progress
            });
        }

        return {
            projects: Array.from(projects.values()).filter((proj) => proj.id !== 'p' + NOT_DEFINED),
            start,
            end
        };
    }

    return state || {};
};
