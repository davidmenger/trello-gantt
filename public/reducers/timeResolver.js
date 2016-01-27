'use strict';

const hours = require('../utils/hours');

function resolveCardTasks (card, shortLinks, taskMap, memberWorkOptions) {
    const deps = [];
    const ret = [];
    const memberSet = new Set();

    for (const list of card.checklists) {
        if (!list.name.match(/^dep/i)) {
            continue;
        }
        for (const item of list.checkItems) {
            const match = item.name.match(/https:\/\/trello.com\/c\/([a-zA-Z0-9]{6,10})/);
            if (match && shortLinks.has(match[1])) {
                deps.push(shortLinks.get(match[1]));
            }
        }
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
        const key = action.data.card.id + action.idMemberCreator;

        let task = taskMap.get(key);

        if (!task) {
            task = {
                id: key,
                s,
                e,
                name: action.data.card.name,
                cardId: action.data.card.id,
                memberId: action.idMemberCreator,
                firstWork: null,
                lastWork: null,
                r: null,
                deps: deps.slice(),
                begin: null,
                end: null,
                firstEstimate: date,
                progress: null
            };
            memberSet.add(action.idMemberCreator);
            taskMap.set(key, task);
            ret.push(task);
        } else {
            task.s += s;
            task.e += e;
            task.firstEstimate = date;
        }

        if (!task.lastWork || date > task.lastWork) {
            task.lastWork = date;
        }

        if (s) {
            task.firstWork = hours.addWorkHours(date, -s, memberWorkOptions[action.memberId]);
        }

        task.r = Math.max(0, task.e - task.s);
        task.progress = task.e > 0 ? task.s / task.e : 0;
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
            const dep = taskMap.get(depCard.id + memberId);
            if (!taskHasResolvedDeps(dep, taskMap, membersMap, cardsById, stackSet) || !taskIsResolved(dep)) {
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
        task.begin = hours.addWorkHours(task.lastWork, -task.s, member.workOptions);
        task.end = hours.addWorkHours(task.lastWork, task.r, member.workOptions);
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
            for (const dep of task.deps) {
                waitsFor.add(dep);
            }
        }
    }
}

module.exports = {
    resolveToTasks (cards, lists, doingListId, memberWorkOptions, cardsById) {
        const listsOrder = lists.map(list => list.id);

        const doingListOrder = listsOrder.indexOf(doingListId);

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
            if (listsOrder.indexOf(card.idList) > doingListOrder) {
                continue;
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
