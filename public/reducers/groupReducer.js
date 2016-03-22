'use strict';

const consts = require('../consts');
const BaseGroupper = require('../lib/grouppers/baseGroupper');

module.exports = function (state, action) {
    if (action.type !== consts.CHANGE_GROUPPING) {
        return state;
    }

    let groupper;
    let versionColors = [];

    switch (action.groupping) {
    case consts.GROUPPING_RELEASE:
        versionColors = state.options.versionColors;
        break;
    case consts.GROUPPING_PROJECT:
        versionColors = state.options.projectColors;
        break;
    case consts.GROUPPING_APP:
        versionColors = state.options.appColors;
        break;
    }

    if (!groupper) {
        groupper = new BaseGroupper(
            state.options.projectColors,
            state.cardsById,
            state.membersById,
            state.labelsById,
            { versionColors });
    }

    const projects = groupper.groupTasks(state.assignments);

    console.log({ projects });

    return Object.assign({}, state, {
        groupping: action.groupping,
        projects,
        start: groupper.start,
        end: groupper.end
    });
};
