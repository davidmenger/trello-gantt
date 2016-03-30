'use strict';

const consts = require('../consts');
const BaseGroupper = require('../lib/grouppers/baseGroupper');
const GanttGroupper = require('../lib/grouppers/ganttGroupper');

module.exports = function (state, action) {

    if (action.type !== consts.CHANGE_GROUPPING
        && action.type !== consts.SELECT_LABEL) {
        return state;
    }

    let groupper;
    let versionColors = [];
    let groupping = action.groupping;
    let selectedLabelId = action.labelId;

    if (action.type === consts.SELECT_LABEL) {
        groupping = state.groupping;
    } else if (action.type === consts.CHANGE_GROUPPING) {
        selectedLabelId = state.selectedLabelId;
    }

    switch (groupping) {
        case consts.GROUPPING_GANTT:
            groupper = new GanttGroupper(
                state.options.projectColors,
                state.cardsById,
                state.membersById,
                state.labelsById,
                { selectedLabelId, versionColors: [] }
            );
            break;
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
            { versionColors, selectedLabelId });
    }

    const projects = groupper.groupTasks(state.assignments);

    console.log({ projects });

    return Object.assign({}, state, {
        groupping,
        projects,
        selectedLabelId,
        start: groupper.start,
        end: groupper.end
    });
};
