'use strict';

const React = require('react');
const Lane = require('./lane.jsx');

class Project extends React.Component {
    render () {
        let lanes = [];
        if (this.props.project.lanes instanceof Map) {
            lanes = Array.from(this.props.project.lanes.values());
        }

        return (
            <div className="project">
                <div className={`projectTitle ${this.props.project.color}`}>
                    {this.props.project.name}
                </div>
                <div className="lanes">
                    {lanes.map(lane =>
                        <Lane key={lane.id} lane={lane} />
                    )}
                </div>
            </div>
        );
    }
}

module.exports = Project;
