'use strict';

const Db = require('./Db');
const config = require('../../config');

module.exports = new Db(config.db);
