'use strict';

const BaseGroupper = require('./baseGroupper');

class GanttGroupper extends BaseGroupper {

    getProjectIdByAssignment (assignment) {
        return assignment.memberId || '-';
    }

    getProjectNameByAssignment (assignment) {
        if (this.membersById.has(assignment.memberId)) {
            return this.membersById.get(assignment.memberId).fullName;
        }
        return '-';
    }

    getLaneIdByAssignment (assignment/* , labelIds*/) {
        return assignment.id;
    }

    getLaneNameByAssignment (assignment, card/* , laneId*/) {
        return card.name;
    }

}

module.exports = GanttGroupper;
