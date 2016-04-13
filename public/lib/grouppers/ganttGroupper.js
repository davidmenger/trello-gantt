'use strict';

const BaseGroupper = require('./baseGroupper');

class GanttGroupper extends BaseGroupper {

    getProjectIdByAssignment (assignment, labelIds) {
        return assignment.memberId || this.labelAttribute(labelIds,
            label => this.options.appColors.indexOf(label.color) !== -1) || '-';
    }

    getProjectNameByAssignment (assignment, card, projectId) {
        if (this.membersById.has(assignment.memberId)) {
            return this.membersById.get(assignment.memberId).fullName;
        }
        const label = this.labelsById.get(projectId);
        return label ? label.name : '-';
    }

    getLaneIdByAssignment (assignment/* , labelIds*/) {
        return assignment.id;
    }

    getLaneNameByAssignment (assignment, card/* , laneId*/) {
        return card.name;
    }

}

module.exports = GanttGroupper;
