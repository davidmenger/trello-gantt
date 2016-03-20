'use strict';

const React = require('react');
const consts = require('../consts.js');

class Controls extends React.Component {

    selectBoard (e) {
        this.props.actions.fetchBoard(e.target.value);
    }

    selectGroupping (e) {
        this.props.actions.changeGroupping(e.target.value);
    }

    render () {
        const boards = this.props.boards || [];
        const selectedBoardId = this.props.selectedBoardId || null;
        const groupping = this.props.groupping;

        return (
            <div>
                <select name="board" onChange={this.selectBoard.bind(this)} value={selectedBoardId}>
                    {boards.map(board => {
                        return (<option value={board.id} key={board.id}>{board.name}</option>);
                    })}
                </select>
                <select name="groupping" onChange={this.selectGroupping.bind(this)} value={groupping}>
                    <option value={consts.GROUPPING_RELEASE}>Release</option>
                    <option value={consts.GROUPPING_PROJECT}>Project</option>
                    <option value={consts.GROUPPING_APP}>App</option>
                </select>
            </div>
        );
    }

}

module.exports = Controls;
