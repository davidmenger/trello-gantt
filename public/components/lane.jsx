'use strict';

const React = require('react');

const LINE_HEIGHT = 30;
const TASK_HEIGHT = 22;

class Lane extends React.Component {

    render () {
        const tasks = this.props.lane.tasks;

        let laneName = this.props.lane.name;

        if (tasks.length === 1) {
            laneName = (<a href={tasks[0].link} target="_blank">{laneName}</a>);
        }

        return (
            <div className="lane">
                <div className="label">{laneName}</div>
                <div className="lane-row">
                    {tasks.map(task => {
                        const style = {
                            width: `${task.width}px`,
                            minWidth: `${task.width}px`,
                            left: `${task.left}px`
                        };

                        const progressStyle = {
                            width: `${Math.round(task.progress * 100)}%`
                        };

                        const formattedSpend = Math.round(task.s * 10) / 10;
                        const formattedRemaining = Math.round(task.r * 10) / 10;

                        let due = null;

                        if (task.due) {
                            const afterDueClass = task.afterDue ? ' due-date-after-due' : '';
                            due = (
                                <div className={`due-date${afterDueClass}`}>
                                    <div className="due-label">
                                        {task.due.toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        }

                        let deps = [];
                        let shortestLength = Number.MAX_SAFE_INTEGER;
                        let shortestIndex = -1;

                        task.deps.forEach((coords) => {

                            if (coords.topIndex === task.index) {
                                return;
                            }

                            const posDiff = coords.topIndex - task.index;

                            const from = {
                                x: 2,
                                y: posDiff > 0 ? TASK_HEIGHT : 0
                            };

                            const top = {
                                x: from.x,
                                y: from.y + (posDiff * LINE_HEIGHT) + ((posDiff > 0 ? -1 : 1) * TASK_HEIGHT / 2)
                            };

                            const to = {
                                x: (coords.left - task.left) - 2,
                                y: top.y
                            };

                            const len = Math.max(top.x - to.x, 0);

                            if (len < shortestLength) {
                                shortestIndex = deps.length;
                                shortestLength = len;
                            }

                            deps.push(
                                <div
                                    className="dep-line"
                                    key={`v${coords.id}`}
                                    style={{
                                        left: `${top.x}px`,
                                        top: `${Math.min(top.y, from.y)}px`,
                                        height: `${Math.abs(top.y - from.y)}px`
                                    }}
                                />
                            );

                            deps.push(
                                <div
                                    className="dep-line"
                                    key={`h${coords.id}`}
                                    style={{
                                        left: `${to.x}px`,
                                        top: `${to.y}px`,
                                        width: `${len}px`
                                    }}
                                />
                            );
                        });

                        if (deps.length > 6) {
                            deps = [
                                deps[shortestIndex],
                                deps[shortestIndex + 1]
                            ];
                        }

                        return (
                            <div key={task.id}
                                className={`task ${task.color || ''}`}
                                style={style}
                            >
                                <div className="cardName">
                                    {task.name}
                                    ({task.begin.toLocaleTimeString()}
                                    - {task.end.toLocaleTimeString()})
                                    [s:{formattedSpend}, r:{formattedRemaining}]
                                </div>
                                <div className="progressShow" style={progressStyle} >&nbsp;</div>
                                {due}
                                {deps}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

module.exports = Lane;
