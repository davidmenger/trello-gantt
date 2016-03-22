'use strict';

const vector = require('../../utils/vector');

class BaseGroupper {

    /**
     * @param {Map} membersById
     * @param {Map} labelsById
     */
    constructor (projectColors, cardsById, membersById, labelsById, options) {

        /**
         * @type {Map}
         */
        this.membersById = membersById;

        /**
         * @type {Map}
         */
        this.labelsById = labelsById;

        /**
         * @type {Map}
         */
        this.cardsById = cardsById;

        /**
         * @type {Matrix}
         */
        this.matrix = null;

        /**
         * @type {string[]}
         */
        this.projectColors = projectColors;

        /**
         * @type {Object}
         */
        this.options = options || {};
    }

    filterAndMakeBounds (assignments) {
        let start = null;
        let end = null;

        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - 7);

        const filtered = assignments.filter(assignment => {
            if (!this.shouldBeIncluded(assignment)) {
                return false;
            }
            if (assignment.e === 0 || assignment.end < dateThreshold) {
                return false;
            }
            if (!start || start > assignment.begin) {
                start = assignment.begin;
            }
            if (!end || end < assignment.end) {
                end = assignment.end;
            }
            return true;
        });

        this.matrix = vector.makeMatrix(start || new Date(), end || new Date(), 60);
        this.start = start;
        this.end = end;

        return filtered;
    }

    shouldBeIncluded (assignment) {
        const labelIds = this.getCardByAssignment(assignment).idLabels;
        return this.getProjectIdByAssignment(assignment, labelIds) !== null;
    }

    getCardByAssignment (assignment) {
        return this.cardsById.get(assignment.cardId);
    }

    groupTasks (assignments) {
        /**
         * projects: [
         *     <project lanes: [
         *          <lane tasks: [ <task> ] >
         *     ]>
         * ]
         */

        console.log('RA', { assignments });

        const filtered = this.filterAndMakeBounds(assignments);

        const projects = new Map();

        for (const assignment of filtered) {
            const card = this.getCardByAssignment(assignment);
            const labelIds = card.idLabels;
            const projectId = this.getProjectIdByAssignment(assignment, labelIds);
            const laneId = this.getLaneIdByAssignment(assignment, labelIds);

            let project = projects.get(projectId);

            if (!project) {
                project = this.factoryProjectWithId(assignment, card, projectId);
                projects.set(projectId, project);
            }

            let lane = project.lanes.get(laneId);

            if (!lane) {
                lane = this.factoryLaneWithId(assignment, card, laneId);
                project.lanes.set(laneId, lane);
            }

            lane.tasks.push(this.factoryTask(assignment, card));
        }

        return Array.from(projects.values());
    }

    getProjectIdByAssignment (assignment, labelIds) {
        return this.labelAttribute(labelIds,
            label => this.options.versionColors.indexOf(label.color) !== -1);
    }

    labelAttribute (labelIds, filter, map) {
        return labelIds
            .map((label) => typeof label === 'object' ? label : this.labelsById.get(label))
            .filter(filter)
            .map(map || (label => label.id))
            .shift() || null;
    }

    factoryProjectWithId (assignment, card, projectId) {
        return {
            id: `p${projectId}`,
            name: this.getProjectNameByAssignment(assignment, card, projectId),
            lanes: new Map(),
            color: this.labelsById.get(projectId).color
        };
    }

    getProjectNameByAssignment (assignment, card, projectId) {
        return this.labelsById.get(projectId).name;
    }

    getLaneIdByAssignment (assignment, labelIds) {
        return assignment.memberId;
    }

    factoryLaneWithId (assignment, card, laneId) {
        return {
            id: `l${laneId}`,
            name: this.getLaneNameByAssignment(assignment, card, laneId),
            tasks: []
        };
    }

    getLaneNameByAssignment (assignment, card, laneId) {
        if (this.membersById.has(assignment.memberId)) {
            return this.membersById.get(assignment.memberId).fullName;
        }
        return '-';
    }

    factoryTask (assignment, card) {
        return {
            id: assignment.cardId + assignment.memberId,
            name: assignment.name,
            who: this.getMemberNameByAssignment(assignment),
            e: assignment.e,
            s: assignment.s,
            r: assignment.r,
            begin: assignment.begin,
            end: assignment.end,
            left: vector.position(assignment.begin, this.matrix),
            width: vector.width(assignment.begin, assignment.end, this.matrix),
            color: this.rowColor(card.idLabels),
            progress: assignment.progress,
            assignment
        };
    }

    rowColor (idLabels) {
        return this.labelAttribute(idLabels,
            (label) => this.projectColors.indexOf(label.color) !== -1,
            (label) => label.color);
    }

    getMemberNameByAssignment (assignment) {
        if (!this.membersById.has(assignment.membersById)) {
            return '-';
        }
        return this.membersById
            .get(assignment.memberId)
            .fullName;
    }

}

module.exports = BaseGroupper;
