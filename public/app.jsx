'use strict';

const React = require('react');
const redux = require('redux');
const reactRedux = require('react-redux');
const ganttActions = require('./actions/ganttActions');
const Table = require('./components/table.jsx');

class App extends React.Component {
    render () {
        return (
            <Table {...this.props} />
        );
    }
}

function mapStateToProps (state) {
    console.log('MAP', state.projects);
    return state.projects;
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
