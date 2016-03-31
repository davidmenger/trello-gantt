'use strict';

const hours = require('../utils/hours');
const estimateParser = require('../utils/estimateParser');

const STATE_COMPLETE = 'complete';
const BEFORE_TWO_DAYS = new Date();
BEFORE_TWO_DAYS.setDate(BEFORE_TWO_DAYS.getDate() - 2);

function resolveWorkDates (card, assignment, actionDate, s, memberWorkOption) {
    if (!assignment.lastWork || actionDate > assignment.lastWork) {
        assignment.lastWork = actionDate;
    }
    if (s) {
        assignment.firstWork = hours.addWorkHours(actionDate, -s, memberWorkOption);
    }
    if (card._done) {
        assignment.e = assignment.s;
    }
}

function factoryAssignment (card, idMember, s, e, deps, date, memberWorkOption) {
    const firstEstimate = date || new Date(card.dateLastActivity);
    const ret = {
        id: card.id + (idMember || ''),
        s,
        e,
        name: card.name,
        cardId: card.id,
        memberId: idMember,
        firstWork: null,
        lastWork: null,
        r: null,
        deps: deps.slice(),
        depCardIds: deps.slice(),
        begin: null,
        end: null,
        firstEstimate,
        progress: e > 0 ? s / e : 0
    };
    resolveWorkDates(card, ret, firstEstimate, s, memberWorkOption);
    ret.r = Math.max(0, ret.e - ret.s);
    return ret;
}

function resolveCardTasks (card, shortLinks, taskMap, memberWorkOptions) {
    const deps = [];
    const ret = [];
    const memberSet = new Set();

    const nameEstimate = estimateParser(card.name);
    let subtasksEstimate = 0;
    let subtasksSpent = 0;

    let allDone = 1;
    for (const list of card.checklists) {
        const isDependency = list.name.match(/^dep/i);
        for (const item of list.checkItems) {
            if (isDependency) {
                const match = item.name.match(/https:\/\/trello.com\/c\/([a-zA-Z0-9]{6,10})/);
                if (match && shortLinks.has(match[1])) {
                    deps.push(shortLinks.get(match[1]));
                }
            } else if (nameEstimate === 0) {
                allDone = allDone && item.state === STATE_COMPLETE;
                const estimate = estimateParser(item.name);
                if (estimate === 0) {
                    continue;
                } else if (item.state === STATE_COMPLETE) {
                    subtasksSpent += estimate;
                }
                subtasksEstimate += estimate;
            } else {
                allDone = allDone && item.state === STATE_COMPLETE;
            }
        }
    }

    card._done = allDone === true || card._done;

    const taskByMember = {};

    if (!card.actions) {
        card.actions = [];
    }

    for (const action of card.actions) {
        if (action.type !== 'commentCard') {
            continue;
        }
        const match = action.data.text.match(/^plus!\s([0-9.,]+)\/([0-9.,]+)/i);
        if (!match) {
            continue;
        }

        const date = new Date(action.date);
        const s = Number.parseFloat(match[1].replace(',', '.'));
        const e = Number.parseFloat(match[2].replace(',', '.'));
        const key = card.id + action.idMemberCreator;

        let task = taskMap.get(key);

        if (!task) {
            task = factoryAssignment(card, action.idMemberCreator, s, e, deps, date);
            memberSet.add(action.idMemberCreator);
            taskMap.set(key, task);
            ret.push(task);
            taskByMember[action.idMemberCreator] = task;
        } else {
            task.s += s;
            task.e += e;
            task.firstEstimate = date;
            resolveWorkDates(card, task, date, s, memberWorkOptions[action.memberId]);
        }
        task.r = Math.max(0, task.e - task.s);
        task.progress = task.e > 0 ? task.s / task.e : 0;
    }

    // SET_ESTIMATE_TO_ASSIGNEES
    const staticEstimate = nameEstimate || subtasksEstimate;
    if (staticEstimate) {
        if (card.idMembers.length === 0) {
            // assign to "Planning" member
            const task = factoryAssignment(card, null, subtasksSpent, staticEstimate, deps);
            memberSet.add(null);
            taskMap.set(card.id, task);
            ret.push(task);
        } else {
            const splitEstimate = staticEstimate / card.idMembers.length;
            const splitSpend = subtasksSpent / card.idMembers.length;
            for (const idMember of card.idMembers) {
                if (typeof taskByMember[idMember] === 'undefined') {
                    // create assignment
                    const task = factoryAssignment(
                        card,
                        idMember,
                        splitSpend,
                        staticEstimate,
                        deps,
                        memberWorkOptions[idMember]);

                    memberSet.add(idMember);
                    taskMap.set(card.id + idMember, task);
                    ret.push(task);
                } else {
                    // compare estimate or reset it when there is no est.
                    const assignment = taskByMember[idMember];
                    const splitRemaining = splitEstimate - splitSpend;
                    if (splitSpend > 0 && assignment.r < splitRemaining) {
                        assignment.e += assignment.s + splitRemaining;
                    } else if (assignment.e < splitEstimate) {
                        assignment.e = splitEstimate;
                    }
                    assignment.r = Math.max(0, assignment.e - assignment.s);
                }
            }
        }
    }

    card.memberSet = memberSet;
    return ret;
}

function taskIsResolved (task) {
    return task.begin !== null;
}

function taskHasResolvedDeps (task, taskMap, membersMap, cardsById, stack) {
    if (task.deps.length === 0) {
        return true;
    }
    const stackSet = stack || new Set();
    if (stackSet.has(task.id)) {
        throw new Error(`Detected cirlular reference: ${task.name}`);
    }
    stackSet.add(task.id);
    while (task.deps.length > 0) {
        const depId = task.deps[0];
        const depCard = cardsById.get(depId);
        if (!depCard || !depCard.memberSet || !depCard.memberSet.size) {
            task.deps.shift();
            continue;
        }

        let success = true;
        let end = null;

        for (const memberId of depCard.memberSet) {
            const dep = taskMap.get(depCard.id + (memberId || ''));
            const resovedDeps = taskHasResolvedDeps(dep, taskMap, membersMap, cardsById, stackSet);
            if (!resovedDeps || !taskIsResolved(dep)) {
                success = false;
            } else if (!end || end < dep.end) {
                end = dep.end;
            }
        }

        if (success) {
            const member = membersMap.get(task.memberId);
            if (end > member.previousEnd) {
                member.previousEnd = end;
            }
            task.deps.shift();
        } else {
            stackSet.delete(task.id);
            return false;
        }
    }
    stackSet.delete(task.id);
    return true;
}

function resolveTask (task, member) {
    if (member.previousEnd === null) {
        const now = BEFORE_TWO_DAYS > task.lastWork ? new Date() : task.lastWork;
        task.begin = hours.addWorkHours(now, -task.s, member.workOptions);
        task.end = hours.addWorkHours(now, task.r, member.workOptions);
    } else {
        if (member.previousEnd < (task.firstWork || task.firstEstimate)) {
            task.begin = task.firstWork || task.firstEstimate;
        } else {
            task.begin = member.previousEnd;
        }
        if (task.r === 0) {
            task.end = task.begin;
            task.begin = hours.addWorkHours(task.begin, -task.s, member.workOptions);
        } else {
            task.end = hours.addWorkHours(task.begin, task.r, member.workOptions);
        }
        const now = new Date();
        if (task.end > now && task.begin < now) {
            task.begin = hours.addWorkHours(task.lastWork, -task.s, member.workOptions);
            task.end = hours.addWorkHours(task.lastWork, task.r, member.workOptions);
        }
    }
    member.previousEnd = task.end;
}

function resolveTaskList (taskList, taskMap, membersMap, cardsById) {
    const waitsFor = new Set();
    const buffer = [];
    let i = 0;
    while (i < taskList.length) {
        const task = taskList[i];
        const member = membersMap.get(task.memberId);
        if (taskHasResolvedDeps(task, taskMap, membersMap, cardsById)) {
            // resolve it
            resolveTask(task, member);
            // let's
            if (waitsFor.delete(task.id)) {
                for (let k = buffer.length - 1; k >= 0; k--) {
                    const depTask = buffer[k];
                    if (taskHasResolvedDeps(depTask, taskMap, membersMap, cardsById)) {
                        taskList.splice(i + 1, 0, depTask);
                        buffer.splice(k, 1);
                        waitsFor.delete(depTask.id);
                    }
                }
            }
            i++;
        } else {
            // store in buffer
            taskList.splice(i, 1);
            buffer.push(task);
            for (const dep of task.deps) {
                waitsFor.add(dep);
            }
        }
    }
    buffer.forEach((task) => {
        if (taskHasResolvedDeps(task, taskMap, membersMap, cardsById)) {
            // resolve it
            const member = membersMap.get(task.memberId);
            resolveTask(task, member);
            taskList.push(task);
        }
    });
}

module.exports = {
    resolveToTasks (cards, lists, memberWorkOptions, cardsById, labelsById) {
        const listsOrder = lists.map(list => list.id);
        const ignoredLabelIds = [];
        for (const label of labelsById.values()) {
            if (label.name.match(/ignore/)) {
                ignoredLabelIds.push(label.id);
            }
        }

        const rightDoingListId = lists
                .filter(list => list.name.match(/doing/i))
                .map(list => list.id)
                .shift();

        const doingListOrder = listsOrder.indexOf(rightDoingListId);

        console.log({ rightDoingListId, doingListOrder });

        const membersMap = new Map();
        const taskMap = new Map();
        const shortLinks = new Map();
        const taskList = [];
        const sortedCards = cards.sort((a, b) => {
            if (typeof a._listOrder === 'undefined') {
                a._listOrder = listsOrder.indexOf(a.idList);
                shortLinks.set(a.shortLink, a.id);
            }
            if (typeof b._listOrder === 'undefined') {
                b._listOrder = listsOrder.indexOf(b.idList);
                shortLinks.set(b.shortLink, b.id);
            }
            if (a._listOrder === b._listOrder) {
                if (a.pos === b.pos) {
                    return 0;
                }
                return a.pos > b.pos ? -1 : 1;
            }
            return a._listOrder < b._listOrder ? -1 : 1;
        });

        for (const card of sortedCards) {
            if (listsOrder.indexOf(card.idList) > (doingListOrder + 0)) {
                continue;
            }
            if (card.idLabels.some(idLabel => ignoredLabelIds.indexOf(idLabel) !== -1)) {
                continue;
            }
            if (listsOrder.indexOf(card.idList) === (doingListOrder + 1)) {
                // in done list
                card._done = true;
            }
            const tasks = resolveCardTasks(card, shortLinks, taskMap, memberWorkOptions);
            for (const task of tasks) {
                let member = membersMap.get(task.memberId);
                if (!member) {
                    member = {
                        id: task.memberId,
                        previousEnd: null,
                        workOptions: memberWorkOptions[task.memberId]
                    };
                    membersMap.set(task.memberId, member);
                }
                taskList.push(task);
            }
        }
        taskList.reverse();
        resolveTaskList(taskList, taskMap, membersMap, cardsById);
        return taskList;
    }
};
