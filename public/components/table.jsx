'use strict';

const React = require('react');
const Project = require('./project.jsx');

const DAY_MICROSECONDS = 86400000;

class Table extends React.Component {
    render () {
        if (this.props.loading) {
            return (
                <div>
                    <br />
                    <progress
                        className="progress progress-striped progress-animated"
                        value="100"
                        max="100"
                    >
                        100%
                    </progress>
                </div>
            );
        }

        const projects = this.props.projects || [];
        let begin = this.props.start || new Date();
        const firstCellWidth = 60 * ((23 - begin.getHours()) / 23);
        let firstStyle = { width: `${firstCellWidth}px` };
        const end = this.props.end || begin;
        const days = [];

        while (begin <= end) {
            days.push((<div className="day" key={begin.getTime()} style={firstStyle}>
                <span>{begin.getDate()}.{begin.getMonth() + 1}.</span>
            </div>));
            begin = new Date(begin.getTime() + DAY_MICROSECONDS);
            firstStyle = {};
        }

        return (
            <div className="graphContainer">
                <div className="days">
                    {days}
                </div>
                <br />
                {projects.map(project =>
                    <Project key={project.id} project={project} />
                )}
                <br />
            </div>
        );
    }
}

module.exports = Table;
