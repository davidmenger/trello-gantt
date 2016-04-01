'use strict';

const React = require('react');
const redux = require('redux');
const reactRedux = require('react-redux');
const ganttActions = require('../actions/ganttActions');
const Table = require('../components/table.jsx');
const Controls = require('../components/controls.jsx');

class App extends React.Component {

    componentDidMount() {
        console.log(this);
    }

    render () {
        return (
            <div style={{width: `${this.props.width}px`}}>
                <Controls {...this.props} />
                <Table {...this.props} />
            </div>
        );
    }
}

function mapStateToProps (state) {
    return state;
}

function mapDispatchToProps (dispatch) {
    return {
        actions: redux.bindActionCreators(ganttActions, dispatch)
    };
}

module.exports = reactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
