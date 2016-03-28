'use strict';

const React = require('react');

class Lane extends React.Component {
    render () {
        const tasks = this.props.lane.tasks;

        return (
            <div className="lane">
                <div className="label">{this.props.lane.name}</div>
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

                        return (
                            <div key={task.id}
                                className={`task ${task.color || ''}`}
                                style={style}
                            >
                                <div className="cardName">
                                    {task.name}
                                    ({task.begin.toLocaleString()} - {task.end.toLocaleString()})
                                    [s:{formattedSpend}, r:{formattedRemaining}]
                                </div>
                                <div className="progressShow" style={progressStyle} >&nbsp;</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

module.exports = Lane;
