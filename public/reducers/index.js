'use strict';

const redux = require('redux');
const projects = require('./projects');

module.exports = redux.combineReducers({
    projects
});
